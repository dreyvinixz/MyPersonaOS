"""
ci_watch.py — Monitora o GitHub Actions após push, baixa os logs,
descompacta, filtra erros e salva organizados por job/step.

Uso:
    export GITHUB_TOKEN=ghp_...
    export GITHUB_REPO=dreyvinixz/MyPersonaOS   # opcional
    python scripts/ci_watch.py

    # Para monitorar um run específico:
    python scripts/ci_watch.py --run-id 123456789

    # Para não esperar (pega o último run já finalizado):
    python scripts/ci_watch.py --no-wait
"""

import argparse
import io
import os
import re
import sys
import time
import zipfile
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

import requests

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


# ---------------------------------------------------------------------------
# Config & Environment Auto-Load
# ---------------------------------------------------------------------------

def _load_env_files() -> None:
    for env_name in [".env.local", ".env.dev", ".env"]:
        env_path = Path(env_name)
        if env_path.exists():
            for line in env_path.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("'\"")
                    if val and (key not in os.environ or not os.environ[key]):
                        os.environ[key] = val

_load_env_files()

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
GITHUB_REPO  = os.environ.get("GITHUB_REPO", "dreyvinixz/MyPersonaOS")

HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

BASE_URL   = "https://api.github.com"
OUTPUT_DIR = Path("ci_logs")


# ---------------------------------------------------------------------------
# Strip de ANSI e timestamps
# ---------------------------------------------------------------------------

ANSI_ESCAPE = re.compile(r"\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])")

def strip_ansi(text: str) -> str:
    return ANSI_ESCAPE.sub("", text)

_TS_RE = re.compile(r"^\d{4}-\d{2}-\d{2}T[\d:.]+Z\s*")

def strip_timestamp(line: str) -> str:
    """Remove o prefixo de timestamp ISO 8601 adicionado pelo GitHub Actions."""
    return _TS_RE.sub("", line)

def clean_line(line: str) -> str:
    """Remove ANSI e timestamp de uma linha de log."""
    return strip_ansi(strip_timestamp(line))


# ---------------------------------------------------------------------------
# Padrões de detecção organizados por SEVERIDADE e FERRAMENTA
# ---------------------------------------------------------------------------

NOISE_PATTERNS = [
    r"(?i)\bno\s+errors?\b",             # "no errors found"
    r"(?i)\b0\s+errors?\b",              # "0 errors"
    r"(?i)errors?\s*=\s*0\b",            # "errors=0"
    r"(?i)\b0\s+warnings?\b",            # "0 warnings"
    r"(?i)warnings?\s*=\s*0\b",          # "warnings=0"
    r"(?i)\bno\s+warnings?\b",           # "no warnings"
    r"(?i)\bno\s+issues?\b",             # "no issues found"
    r"^##\[debug\]",                     # GitHub Actions debug prefix
    r"(?i)ResourceWarning",              # Python interno, irrelevante
    r"(?i)--ignore.*error",              # flag de CLI ignorando erros
    r"(?i)error_code\s*=",              # atribuição de variável
    r"(?i)\bon_error\b",                 # nome de handler/callback
    r"(?i)\bignore.*warnings?\b",        # ignore warnings flag
    r"(?i)^\s*#.*\berror\b",             # comentário de código
]

CRITICAL_PATTERNS = [
    r"(?i)Traceback \(most recent call last\)",
    r"^::error::",
    r"(?i)##\[error\]",
    r"(?i)The process .* failed with exit code [^0]",
    r"(?i)\bexit code\s+[^0]\b",
    r"(?i)\bexitcode\s*=\s*[^0]\b",
    r"(?i)\breturncode\s*=\s*-?\s*[^0]\b",
    r"(?i)non-zero exit",
    r"(?i)\bSegmentation fault\b",
    r"(?i)\bKilled\b",
    r"(?i)\bOut of memory\b",
    r"(?i)\bSIGKILL\b|\bSIGTERM\b",
    r"(?i)Connection reset by peer",
    r"(?i)Found \d+ errors?\.",
]

ERROR_PATTERNS = [
    r"(?i)^src/.*:\d+:\d+:.*\berror\b",
    r"(?i)^src/.*:\d+:\s+error:",
    r"(?i)Module not found:\s+",
    r"(?i)Error:\s+Can't resolve",
    r"(?i)Build failed because of",
    r"(?i)Failed to compile",
    r"(?i)^\s*FAILED\b",
    r"(?i)^\s*ERROR\b",
    r"(?i)\b(?:Syntax|Import|Module\s*Not\s*Found|Attribute|Type|Value|Key|Runtime|OS|IO|Permission|Unicode|Assertion)Error\b",
    r"(?i)\berror\b",
    r"(?i)\bfailed\b",
    r"(?i)\bfailure\b",
    r"(?i)\bexception\b",
]

WARNING_PATTERNS = [
    r"^::warning::",
    r"^::notice::",
    r"(?i)##\[warning\]",
    r"(?i)\bwarning\b",
    r"(?i)\bwarn\b",
]

_NOISE_RE    = [re.compile(p) for p in NOISE_PATTERNS]
_CRITICAL_RE = [re.compile(p) for p in CRITICAL_PATTERNS]
_ERROR_RE    = [re.compile(p) for p in ERROR_PATTERNS]
_WARNING_RE  = [re.compile(p) for p in WARNING_PATTERNS]


def _classify(line: str) -> str | None:
    if any(r.search(line) for r in _NOISE_RE):
        return None
    if any(r.search(line) for r in _CRITICAL_RE):
        return "critical"
    if any(r.search(line) for r in _ERROR_RE):
        return "error"
    if any(r.search(line) for r in _WARNING_RE):
        return "warning"
    return None


# ---------------------------------------------------------------------------
# Data Models
# ---------------------------------------------------------------------------

@dataclass
class ErrorEvent:
    severity: str                                   # "critical" | "error" | "warning"
    trigger_line: str                               # A linha que disparou a detecção
    context_before: list[str] = field(default_factory=list)
    context_after: list[str]  = field(default_factory=list)
    line_number: int = 0
    is_traceback: bool = False
    traceback_lines: list[str] = field(default_factory=list)


@dataclass
class StepLog:
    job_name: str
    step_name: str
    conclusion: str             # success | failure | skipped | cancelled | unknown
    raw_lines: list[str] = field(default_factory=list)
    error_events: list[ErrorEvent] = field(default_factory=list)
    invisible_failure: bool = False


@dataclass
class RunReport:
    run_id: int
    run_number: int
    workflow_name: str
    branch: str
    commit_sha: str
    commit_message: str
    conclusion: str
    started_at: str
    steps: list[StepLog] = field(default_factory=list)


# ---------------------------------------------------------------------------
# GitHub API Helpers
# ---------------------------------------------------------------------------

def _get(url: str, stream: bool = False) -> requests.Response:
    if not GITHUB_TOKEN:
        sys.exit("❌  GITHUB_TOKEN não definido. Defina no .env.local ou exporte no terminal.")
    r = requests.get(url, headers=HEADERS, stream=stream, timeout=60)
    if r.status_code == 401:
        sys.exit("❌  Token inválido ou sem permissão (Actions: read). Verifique o GITHUB_TOKEN.")
    if r.status_code == 404:
        sys.exit(f"❌  Repositório não encontrado ou sem permissão: {GITHUB_REPO}")
    r.raise_for_status()
    return r


def get_latest_run(workflow_file: str | None = None) -> dict:
    url = f"{BASE_URL}/repos/{GITHUB_REPO}/actions/runs?per_page=1"
    if workflow_file:
        url += f"&workflow={workflow_file}"
    data = _get(url).json()
    runs = data.get("workflow_runs", [])
    if not runs:
        sys.exit("❌  Nenhum run encontrado.")
    return runs[0]


def get_run(run_id: int) -> dict:
    return _get(f"{BASE_URL}/repos/{GITHUB_REPO}/actions/runs/{run_id}").json()


def get_jobs(run_id: int) -> list[dict]:
    url = f"{BASE_URL}/repos/{GITHUB_REPO}/actions/runs/{run_id}/jobs"
    return _get(url).json().get("jobs", [])


def wait_for_run(run_id: int, poll_interval: int = 10) -> dict:
    print(f"⏳  Aguardando run #{run_id} finalizar...", flush=True)
    dots = 0
    while True:
        run = get_run(run_id)
        status     = run["status"]
        conclusion = run.get("conclusion") or "—"
        if status == "completed":
            print(f"\n✅  Finalizado: {conclusion.upper()}")
            return run
        dots += 1
        print(f"\r   Status: {status}... {'.' * dots}   ", end="", flush=True)
        time.sleep(poll_interval)


def download_logs_zip(run_id: int) -> zipfile.ZipFile:
    print("📦  Baixando arquivo de logs compactado...", flush=True)
    r = _get(f"{BASE_URL}/repos/{GITHUB_REPO}/actions/runs/{run_id}/logs", stream=True)
    content = b"".join(r.iter_content(chunk_size=8192))
    return zipfile.ZipFile(io.BytesIO(content))


# ---------------------------------------------------------------------------
# Precise Log Parsing & Job Matching
# ---------------------------------------------------------------------------

def _normalize(name: str) -> str:
    return re.sub(r"[^\w]", "", name).lower()


def _resolve_job_and_step_name(name: str, jobs: list[dict]) -> tuple[str, str, str]:
    parts = name.split("/", 1)
    if len(parts) > 1:
        raw_job  = parts[0].strip()
        raw_step = Path(parts[1]).stem
    else:
        raw_job  = ""
        raw_step = Path(parts[0]).stem

    raw_step_clean = re.sub(r"^\d+_", "", raw_step).strip()
    norm_job  = _normalize(raw_job)
    norm_step = _normalize(raw_step_clean)

    target_job = None
    if norm_job:
        for job in jobs:
            if _normalize(job.get("name", "")) == norm_job:
                target_job = job
                break

    if not target_job and len(jobs) == 1:
        target_job = jobs[0]

    if not target_job:
        for job in jobs:
            for s in job.get("steps", []):
                if _normalize(s.get("name", "")) == norm_step:
                    target_job = job
                    break
            if target_job:
                break

    job_name = target_job.get("name", raw_job or "Job") if target_job else (raw_job or "Job")
    step_conclusion    = "unknown"
    resolved_step_name = raw_step_clean

    if target_job:
        for s in target_job.get("steps", []):
            if _normalize(s.get("name", "")) == norm_step:
                resolved_step_name = s.get("name", raw_step_clean)
                step_conclusion    = s.get("conclusion") or "unknown"
                break
        if step_conclusion == "unknown":
            step_conclusion = target_job.get("conclusion") or "unknown"

    return job_name, resolved_step_name, step_conclusion


# ---------------------------------------------------------------------------
# Motor de extração de erros com contexto
# ---------------------------------------------------------------------------

def extract_errors(
    raw_lines: list[str],
    context_before: int = 3,
    context_after: int = 5,
) -> list[ErrorEvent]:
    clean: list[str] = [clean_line(l) for l in raw_lines]
    n = len(clean)
    events: list[ErrorEvent] = []
    skip_until = -1

    for i, line in enumerate(clean):
        if i <= skip_until:
            continue

        if "Traceback (most recent call last):" in line:
            tb = [line]
            j  = i + 1
            while j < n:
                nxt = clean[j]
                tb.append(nxt)
                if j > i + 1 and nxt and not nxt[0].isspace():
                    break
                j += 1
            skip_until = j

            events.append(ErrorEvent(
                severity="critical",
                trigger_line=line,
                context_before=clean[max(0, i - context_before):i],
                context_after=clean[j + 1:min(n, j + 3)],
                line_number=i,
                is_traceback=True,
                traceback_lines=tb,
            ))
            continue

        if line.startswith("::error::"):
            events.append(ErrorEvent(
                severity="critical",
                trigger_line=line,
                context_before=clean[max(0, i - 2):i],
                context_after=clean[i + 1:min(n, i + 4)],
                line_number=i,
            ))
            continue

        if line.startswith("::warning::") or line.startswith("::notice::"):
            events.append(ErrorEvent(
                severity="warning",
                trigger_line=line,
                context_before=clean[max(0, i - 2):i],
                context_after=clean[i + 1:min(n, i + 3)],
                line_number=i,
            ))
            continue

        severity = _classify(line)
        if severity:
            events.append(ErrorEvent(
                severity=severity,
                trigger_line=line,
                context_before=clean[max(0, i - context_before):i],
                context_after=clean[i + 1:min(n, i + context_after)],
                line_number=i,
            ))

    return events


def parse_logs(zf: zipfile.ZipFile, jobs: list[dict]) -> list[StepLog]:
    steps: list[StepLog] = []
    for name in sorted(zf.namelist()):
        if not name.endswith(".txt"):
            continue
        job_name, step_name, conclusion = _resolve_job_and_step_name(name, jobs)
        raw_text  = zf.read(name).decode("utf-8", errors="replace")
        raw_lines = raw_text.splitlines()
        error_events = extract_errors(raw_lines)
        invisible = (conclusion == "failure" and not error_events)

        steps.append(StepLog(
            job_name=job_name,
            step_name=step_name,
            conclusion=conclusion,
            raw_lines=raw_lines,
            error_events=error_events,
            invisible_failure=invisible,
        ))
    return steps


# ---------------------------------------------------------------------------
# Formatação de saída com severidade e contexto
# ---------------------------------------------------------------------------

_SEVERITY_ICON = {"critical": "🔴", "error": "🟠", "warning": "🟡"}


def _format_event(event: ErrorEvent, f) -> None:
    icon  = _SEVERITY_ICON.get(event.severity, "⚪")
    label = event.severity.upper()

    f.write(f"{icon} [{label}] — linha {event.line_number + 1}\n")

    if event.is_traceback:
        f.write("  ┌─ Traceback ────────────────────────────────────────\n")
        for l in event.context_before:
            f.write(f"  │  {l}\n")
        if event.context_before:
            f.write("  │  ↓\n")
        for l in event.traceback_lines:
            f.write(f"  │  {l}\n")
        if event.context_after:
            f.write("  │  ↓\n")
            for l in event.context_after:
                f.write(f"  │  {l}\n")
        f.write("  └────────────────────────────────────────────────────\n")
    else:
        for l in event.context_before:
            f.write(f"  ·  {l}\n")
        f.write(f"  »  {event.trigger_line}\n")
        for l in event.context_after:
            f.write(f"  ·  {l}\n")

    f.write("\n")


def _write_invisible_failure(step: StepLog, f) -> None:
    f.write("⚠️  FALHA INVISÍVEL — step falhou mas nenhum padrão de erro foi reconhecido.\n")
    f.write("    Possíveis causas: timeout, OOM, erro de rede, ou padrão ainda não coberto.\n\n")
    f.write("  Últimas 40 linhas do log:\n")
    tail = step.raw_lines[-40:] if len(step.raw_lines) > 40 else step.raw_lines
    for l in tail:
        f.write(f"  {clean_line(l)}\n")
    f.write("\n")


def _safe_name(name: str) -> str:
    return re.sub(r"[^\w\-]", "_", name).strip("_")[:80]


# ---------------------------------------------------------------------------
# Salvamento dos logs filtrados
# ---------------------------------------------------------------------------

def save_logs(report: RunReport, out_dir: Path) -> Path:
    commit_short = report.commit_sha[:7] if report.commit_sha else "unknown"
    ts      = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_dir = out_dir / f"run_{report.run_id}_commit_{commit_short}_{ts}"
    run_dir.mkdir(parents=True, exist_ok=True)

    failed_steps    = [s for s in report.steps if s.conclusion == "failure"]
    invisible_steps = [s for s in report.steps if s.invisible_failure]

    n_critical = sum(
        1 for s in report.steps for e in s.error_events if e.severity == "critical"
    )
    n_error = sum(
        1 for s in report.steps for e in s.error_events if e.severity == "error"
    )
    n_warning = sum(
        1 for s in report.steps for e in s.error_events if e.severity == "warning"
    )

    summary_path = run_dir / "summary.txt"
    with summary_path.open("w", encoding="utf-8") as f:
        f.write(f"MyPersonaOS CI Report — Run #{report.run_number}\n")
        f.write("=" * 70 + "\n")
        f.write(f"Workflow   : {report.workflow_name}\n")
        f.write(f"Branch     : {report.branch}\n")
        f.write(f"Commit     : {report.commit_sha[:12]} - {report.commit_message[:80]}\n")
        f.write(f"Conclusão  : {report.conclusion.upper()}\n")
        f.write(f"Gerado em  : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("\n")

        f.write("Eventos detectados:\n")
        f.write(f"  🔴 CRITICAL : {n_critical}\n")
        f.write(f"  🟠 ERROR    : {n_error}\n")
        f.write(f"  🟡 WARNING  : {n_warning}\n")
        if invisible_steps:
            f.write(f"  ⚠️  FALHAS INVISÍVEIS : {len(invisible_steps)} (padrão não coberto)\n")
        f.write("\n")

        f.write("Status dos Steps:\n")
        f.write("-" * 50 + "\n")
        for step in report.steps:
            icon = {"success": "✓", "failure": "✗", "skipped": "—"}.get(step.conclusion, "?")
            counts = {
                "critical": sum(1 for e in step.error_events if e.severity == "critical"),
                "error":    sum(1 for e in step.error_events if e.severity == "error"),
                "warning":  sum(1 for e in step.error_events if e.severity == "warning"),
            }
            parts = [f"{v} {k}" for k, v in counts.items() if v]
            extra = f"  ({', '.join(parts)})" if parts else ""
            invis = "  ⚠️ falha invisível" if step.invisible_failure else ""
            f.write(f"  [{icon}] {step.job_name} > {step.step_name}{extra}{invis}\n")
        f.write("\n")

        if failed_steps:
            f.write("STEPS COM FALHA:\n")
            f.write("-" * 50 + "\n")
            for step in failed_steps:
                invis = " [⚠️ INVISÍVEL]" if step.invisible_failure else ""
                f.write(f"  • {step.job_name} > {step.step_name}{invis}\n")

    print("   📄  summary.txt")

    errors_path = run_dir / "errors.txt"
    with errors_path.open("w", encoding="utf-8") as f:
        f.write(f"MYPERSONAOS CI — ANÁLISE DE ERROS (RUN #{report.run_number})\n")
        f.write("=" * 70 + "\n\n")

        has_anything = any(s.error_events or s.invisible_failure for s in report.steps)

        if not has_anything:
            f.write("✅ Nenhum erro ou falha detectada nesta execução.\n")
        else:
            if failed_steps:
                f.write("━" * 70 + "\n")
                f.write("1. STEPS COM FALHA\n")
                f.write("━" * 70 + "\n\n")

                for step in failed_steps:
                    f.write(f"╔══ FALHA: {step.job_name} › {step.step_name}\n\n")

                    if step.invisible_failure:
                        _write_invisible_failure(step, f)
                    else:
                        for sev in ("critical", "error", "warning"):
                            evts = [e for e in step.error_events if e.severity == sev]
                            if evts:
                                icon = _SEVERITY_ICON[sev]
                                f.write(f"  {icon} {len(evts)} evento(s) {sev.upper()}:\n\n")
                                for event in evts:
                                    _format_event(event, f)

                    f.write("\n")

            warning_steps = [
                s for s in report.steps
                if s.conclusion != "failure" and s.error_events
            ]
            if warning_steps:
                f.write("\n" + "━" * 70 + "\n")
                f.write("2. ALERTAS EM STEPS CONCLUÍDOS COM SUCESSO\n")
                f.write("━" * 70 + "\n\n")
                for step in warning_steps:
                    counts = {
                        sev: [e for e in step.error_events if e.severity == sev]
                        for sev in ("critical", "error", "warning")
                    }
                    f.write(f"[{step.conclusion.upper()}] {step.job_name} › {step.step_name}\n\n")
                    for sev in ("critical", "error", "warning"):
                        for event in counts[sev][:10]:
                            _format_event(event, f)

    print("   ⚠️   errors.txt")

    for step in report.steps:
        job_dir   = run_dir / "jobs" / _safe_name(step.job_name)
        job_dir.mkdir(parents=True, exist_ok=True)
        step_file = job_dir / f"{_safe_name(step.step_name)}.txt"
        with step_file.open("w", encoding="utf-8") as f:
            f.write(f"# JOB: {step.job_name}\n# STEP: {step.step_name}\n# CONCLUSÃO: {step.conclusion}\n\n")
            for line in step.raw_lines:
                f.write(clean_line(line) + "\n")

    print(f"   📁  jobs/ ({len(report.steps)} arquivos)")

    if failed_steps:
        fail_dir = run_dir / "failed_steps"
        fail_dir.mkdir(exist_ok=True)
        for step in failed_steps:
            fname = f"{_safe_name(step.job_name)}__{_safe_name(step.step_name)}.txt"
            with (fail_dir / fname).open("w", encoding="utf-8") as f:
                invis = " [FALHA INVISÍVEL]" if step.invisible_failure else ""
                f.write(f"# FALHA{invis}: {step.job_name} > {step.step_name}\n\n")
                for line in step.raw_lines:
                    f.write(clean_line(line) + "\n")
        print(f"   🔥  failed_steps/ ({len(failed_steps)} step(s))")

    print(f"\n📂  Logs salvos em: {run_dir.resolve()}")
    return run_dir


# ---------------------------------------------------------------------------
# Preview no terminal com contagens por severidade
# ---------------------------------------------------------------------------

def print_errors_preview(report: RunReport) -> None:
    failed_steps    = [s for s in report.steps if s.conclusion == "failure"]
    invisible_steps = [s for s in report.steps if s.invisible_failure]
    any_events      = any(s.error_events for s in report.steps)

    if not failed_steps and not any_events:
        print("\n✅  Nenhum erro detectado no CI!")
        return

    print(f"\n{'═' * 70}")
    print(f"🔴  CI REPORT — Run #{report.run_number}  [{report.conclusion.upper()}]")
    print(f"{'═' * 70}")

    if failed_steps:
        print("\n[STEPS QUE FALHARAM]:")
        for step in failed_steps:
            invis = " ⚠️ falha invisível" if step.invisible_failure else ""
            print(f"  • {step.job_name} > {step.step_name}{invis}")

            for event in step.error_events[:3]:
                icon = _SEVERITY_ICON.get(event.severity, "⚪")
                if event.is_traceback and event.traceback_lines:
                    last = event.traceback_lines[-1] if event.traceback_lines else event.trigger_line
                    print(f"      {icon} {last}")
                else:
                    print(f"      {icon} {event.trigger_line}")

            if len(step.error_events) > 3:
                print(f"      ... e mais {len(step.error_events) - 3} evento(s) em errors.txt")

    if invisible_steps:
        print(f"\n  ⚠️  {len(invisible_steps)} step(s) com FALHA INVISÍVEL (ver errors.txt > seção 1)")

    n_critical = sum(1 for s in report.steps for e in s.error_events if e.severity == "critical")
    n_error    = sum(1 for s in report.steps for e in s.error_events if e.severity == "error")
    n_warning  = sum(1 for s in report.steps for e in s.error_events if e.severity == "warning")

    if n_critical or n_error or n_warning:
        print(f"\n  🔴 {n_critical} critical  🟠 {n_error} error  🟡 {n_warning} warning")

    print(f"\n{'─' * 70}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Monitora GitHub Actions e salva logs detalhados de erro localmente."
    )
    parser.add_argument("--run-id",   type=int,   help="ID específico do run (padrão: último run)")
    parser.add_argument("--no-wait",  action="store_true", help="Não espera run em andamento terminar")
    parser.add_argument("--workflow", type=str,   help="Filtrar por arquivo de workflow (ex: ci.yml)")
    parser.add_argument("--out-dir",  type=str,   default="ci_logs", help="Pasta de saída")
    args = parser.parse_args()

    out_dir = Path(args.out_dir)

    if args.run_id:
        run = get_run(args.run_id)
    else:
        run = get_latest_run(args.workflow)

    run_id = run["id"]
    commit = run.get("head_commit") or {}

    print(f"\n🔍  Run #{run['run_number']} — {run['name']}")
    print(f"    Branch : {run['head_branch']}")
    print(f"    Commit : {run['head_sha'][:12]} — {(commit.get('message') or '')[:70]}")
    print(f"    Status : {run['status']} / {run.get('conclusion') or '...'}")

    if run["status"] != "completed":
        if args.no_wait:
            sys.exit("⚠️  Run ainda em andamento. Execute sem --no-wait para aguardar.")
        run = wait_for_run(run_id)

    jobs  = get_jobs(run_id)
    zf    = download_logs_zip(run_id)
    steps = parse_logs(zf, jobs)

    report = RunReport(
        run_id=run_id,
        run_number=run["run_number"],
        workflow_name=run["name"],
        branch=run["head_branch"],
        commit_sha=run["head_sha"],
        commit_message=(commit.get("message") or "").splitlines()[0],
        conclusion=run.get("conclusion") or "unknown",
        started_at=run.get("created_at") or "",
        steps=steps,
    )

    print_errors_preview(report)

    print("💾  Salvando relatórios e logs organizados...")
    save_logs(report, out_dir)

    if report.conclusion not in ("success", "skipped"):
        sys.exit(1)


if __name__ == "__main__":
    main()
