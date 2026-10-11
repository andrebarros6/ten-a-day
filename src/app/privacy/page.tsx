import type { Metadata } from "next";
import { DeleteData } from "@/components/delete-data";
import { PageHead } from "@/components/protocol-parts";
import { m } from "@/lib/labels";

const p = m.privacy;

export const metadata: Metadata = { title: p.num, description: p.title };

export default function PrivacyPage() {
  return (
    <section className="panel">
      <PageHead num={p.num} title={p.title} />
      {p.sections.map((s) => (
        <div className="sec" key={s.title}>
          <h2>{s.title}</h2>
          {s.body.map((b) => (
            <p key={b}>{b}</p>
          ))}
        </div>
      ))}
      <div className="sec">
        <h2>{p.deleteTitle}</h2>
        <p>{p.deleteBody}</p>
        <DeleteData />
      </div>
    </section>
  );
}
