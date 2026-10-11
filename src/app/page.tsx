import { DayList, RhythmChart, ScoreBlock, ShareBlock, TimeInputs } from "@/components/today";
import { meta } from "@/lib/content";
import { m } from "@/lib/labels";

export default function TodayPage() {
  return (
    <section className="panel">
      <h1 className="sr-only">
        {meta.name}: {m.nav.today}
      </h1>
      <TimeInputs />
      <RhythmChart />
      <DayList />
      <ScoreBlock />
      <ShareBlock />
      <p className="note">{m.today.saved}</p>
    </section>
  );
}
