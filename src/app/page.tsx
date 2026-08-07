import Image from "next/image";
import { DateClock } from "@/components/today/DateClock";
import { MainFocus } from "@/components/today/MainFocus";
import { TodayTasks } from "@/components/today/TodayTasks";
import { QuickCapture } from "@/components/today/QuickCapture";
import { ModuleSummaries } from "@/components/today/ModuleSummaries";

export default function TodayPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="oil-hero relative overflow-hidden rounded-2xl border mb-8 px-5 py-5 sm:px-6 sm:py-6">
        <div className="relative z-10 max-w-[75%] sm:max-w-[70%]">
          <p
            className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-3 oil-gradient-text"
          >
            MyPersonaOS • Command Center
          </p>
          <DateClock />
          <p
            className="mt-3 text-xs leading-relaxed max-w-md"
            style={{ color: "var(--text-muted)" }}
          >
            Clareza antes de velocidade. Escolha o que merece sua atenção e faça hoje.
          </p>
        </div>
        <Image
          src="/assets/oil-slick/oil-orb.svg"
          alt=""
          width={260}
          height={260}
          aria-hidden="true"
          className="oil-orb"
          priority
        />
      </div>

      <div className="flex flex-col gap-6">
        <MainFocus />
        <TodayTasks />
        <QuickCapture />
        <ModuleSummaries />
      </div>
    </div>
  );
}
