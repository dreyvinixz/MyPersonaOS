import { DateClock } from "@/components/today/DateClock";
import { MainFocus } from "@/components/today/MainFocus";
import { TodayTasks } from "@/components/today/TodayTasks";
import { QuickCapture } from "@/components/today/QuickCapture";
import { ModuleSummaries } from "@/components/today/ModuleSummaries";

export default function TodayPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <p
          className="text-[10px] uppercase tracking-[0.25em] font-semibold mb-3"
          style={{ color: "var(--text-subtle)" }}
        >
          MyPersonaOS • Command Center
        </p>
        <DateClock />
      </div>

      {/* Main layout */}
      <div className="flex flex-col gap-6">
        <MainFocus />
        <TodayTasks />
        <QuickCapture />
        <ModuleSummaries />
      </div>
    </div>
  );
}
