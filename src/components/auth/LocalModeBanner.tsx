import { ArrowRight, HardDrive } from "lucide-react";

interface LocalModeBannerProps {
  onContinue: () => void;
}

export function LocalModeBanner({ onContinue }: LocalModeBannerProps) {
  return (
    <div className="space-y-5">
      <div
        className="flex items-start gap-3 px-4 py-3.5 rounded-xl border text-sm"
        style={{
          background: "rgba(34,211,238,0.05)",
          borderColor: "rgba(34,211,238,0.18)",
          color: "var(--text-muted)",
        }}
      >
        <HardDrive size={18} className="shrink-0 mt-0.5 text-[var(--cyan)]" />
        <div>
          <p className="font-semibold text-[var(--text)] mb-1">
            Local Mode ativo
          </p>
          <p className="text-xs leading-relaxed">
            Supabase não está configurado neste ambiente. O MyPersonaOS
            continua funcionando localmente sem autenticação.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white shadow-lg cursor-pointer"
        style={{ background: "var(--oil-gradient)" }}
      >
        Continuar em Local Mode
        <ArrowRight size={16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
