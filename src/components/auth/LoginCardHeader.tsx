import { Zap } from "lucide-react";

export function LoginCardHeader() {
  return (
    <div className="flex flex-col items-center text-center mb-8">
      <div className="oil-logo flex items-center justify-center w-12 h-12 rounded-xl mb-4 text-white shadow-lg">
        <Zap size={24} strokeWidth={2.5} />
      </div>
      <h1
        className="text-2xl font-extrabold tracking-tight"
        style={{ color: "var(--text)" }}
      >
        MyPersonaOS
      </h1>
      <p
        className="text-sm mt-1.5 font-medium"
        style={{ color: "var(--text-muted)" }}
      >
        Your life. One system.
      </p>
    </div>
  );
}
