import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const forbiddenFilePatterns = [
  /(^|\/)\.env(\.|$)/,
  /\.(?:key|p12|pfx|pem)$/i,
  /(^|\/)(?:credentials|secrets)(?:\.|\/|$)/i,
];

const allowedFiles = new Set([".env.example"]);

const secretPatterns = [
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["AWS access key", /(?:AKIA|ASIA)[0-9A-Z]{16}/],
  ["GitHub token", /(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})/],
  ["GitLab token", /glpat-[A-Za-z0-9_-]{20,}/],
  ["Google API key", /AIza[0-9A-Za-z_-]{30,}/],
  ["OpenAI-style key", /sk-[A-Za-z0-9_-]{20,}/],
  ["Slack token", /xox[baprs]-[A-Za-z0-9-]{10,}/],
  ["Stripe secret key", /sk_(?:live|test)_[A-Za-z0-9]{16,}/],
  ["JWT", /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
];

const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
  encoding: "utf8",
}).split("\0").filter(Boolean);

const findings = [];

for (const file of trackedFiles) {
  if (!allowedFiles.has(file) && forbiddenFilePatterns.some((pattern) => pattern.test(file))) {
    findings.push({ file, kind: "sensitive filename" });
    continue;
  }

  const buffer = readFileSync(file);
  if (buffer.length > 2_000_000 || buffer.includes(0)) continue;
  const content = buffer.toString("utf8");

  for (const [kind, pattern] of secretPatterns) {
    if (pattern.test(content)) findings.push({ file, kind });
  }
}

if (findings.length > 0) {
  console.error("Potential secrets found (values intentionally redacted):");
  for (const finding of findings) {
    console.error(`- ${finding.file}: ${finding.kind}`);
  }
  process.exit(1);
}

console.log(`Secret scan passed for ${trackedFiles.length} tracked files.`);
