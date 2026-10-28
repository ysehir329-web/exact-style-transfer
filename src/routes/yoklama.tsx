import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Calendar, Save, Check, Download } from "@/components/app/icons";
import { AppShell, Avatar } from "@/components/app/AppShell";
import { ReportSheet } from "@/components/app/ReportSheet";
import { useStore, type AttendanceRow } from "@/lib/store";
import { VAKITLER } from "@/lib/stats";

export const Route = createFileRoute("/yoklama")({
  head: () => ({
    meta: [
      { title: "Günlük Yoklama — Kur'an Kursu" },
      { name: "description", content: "Beş vakit namaz ve ders yoklamasını işaretleyip kaydedin." },
      { property: "og:title", content: "Günlük Yoklama — Kur'an Kursu" },
      { property: "og:description", content: "Beş vakit namaz ve ders yoklamasını işaretleyip kaydedin." },
    ],
  }),
  component: Yoklama,
});

const cols = [...VAKITLER, "Ders"];
type Row = { vakitler: string[]; ders: boolean; durum: AttendanceRow["durum"] };

function Yoklama() {
  const { students, attendance, saveDay } = useStore();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [marks, setMarks] = useState<Record<string, Row>>({});
  const [saved, setSaved] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    const m: Record<string, Row> = {};
    for (const a of attendance.filter((x) => x.date === date)) m[a.studentId] = { vakitler: a.vakitler, ders: a.ders, durum: a.durum };
    setMarks(m);
    setSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const d = new Date(date + "T12:00");
  const label = d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
  const day = d.toLocaleDateString("tr-TR", { weekday: "long" });
  const get = (id: string): Row => marks[id] ?? { vakitler: [], ders: false, durum: "normal" };

  const toggle = (id: string, c: string) => {
    const r = get(id);
    const next = c === "Ders" ? { ...r, ders: !r.ders } : { ...r, vakitler: r.vakitler.includes(c) ? r.vakitler.filter((v) => v !== c) : [...r.vakitler, c] };
    setMarks({ ...marks, [id]: next });
    setSaved(false);
  };
  const setDurum = (id: string, durum: Row["durum"]) => { setMarks({ ...marks, [id]: { ...get(id), durum } }); setSaved(false); };

  const save = () => {
    saveDay(date, students.map((s) => ({ studentId: s.id, ...get(s.id) })));
    setSaved(true);
  };

  return (
    <AppShell>
      <h2 className="mt-7 font-serif text-3xl font-bold">Günlük Yoklama</h2>
      <p className="mt-2 text-sm text-muted-foreground">Beş vakit namaz ve ders yoklamasını işaretleyip kaydedin.</p>
      <div className="mt-5 flex items-end justify-between gap-3 rounded-2xl border border-border bg-card p-5">
        <div>
          <p className="text-xs text-muted-foreground">Tarih</p>
          <div className="mt-2 flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <label className="relative whitespace-nowrap rounded-xl border border-border px-4 py-2 text-sm">
              {label}
              <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="absolute inset-0 opacity-0" />
            </label>
          </div>
          <p className="mt-2 font-semibold capitalize text-primary">{day}</p>
        </div>
        <button onClick={save} disabled={!students.length} className="mb-6 flex items-center gap-2 whitespace-nowrap rounded-xl bg-primary px-3 py-2.5 text-xs text-primary-foreground disabled:opacity-50">
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />} {saved ? "Kaydedildi" : "Yoklamayı Kaydet"}
        </button>
      </div>
      <button
        onClick={() => setReportOpen(true)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-brand-soft py-3 text-sm font-medium text-primary transition-transform active:scale-[0.98]"
      >
        <Download className="h-4 w-4" /> Yoklama Raporu İndir (PDF / Excel)
      </button>
      <ReportSheet open={reportOpen} onClose={() => setReportOpen(false)} initialDate={date} />
      {students.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
          Yoklama almak için önce <Link to="/" className="font-medium text-primary underline">talebe ekleyin</Link>.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex items-center bg-brand-soft px-3 py-3 text-xs text-muted-foreground">
            <span className="w-24 text-sm">Adı Soyadı</span>
            <div className="grid flex-1 grid-cols-6 gap-1 text-center text-[10px]">{cols.map((c) => <span key={c}>{c}</span>)}</div>
          </div>
          {students.map((s) => {
            const r = get(s.id);
            return (
              <div key={s.id} className="border-t border-border px-3 py-3">
                <div className="flex items-center">
                  <div className="flex w-24 min-w-0 items-center gap-2"><Avatar name={s.name} size="sm" /><span className="truncate text-sm">{s.name}</span></div>
                  <div className="grid flex-1 grid-cols-6 gap-1">
                    {cols.map((c) => {
                      const on = c === "Ders" ? r.ders : r.vakitler.includes(c);
                      return (
                        <button key={c} onClick={() => toggle(s.id, c)} aria-label={`${s.name} ${c}`} className={`flex h-8 items-center justify-center rounded-lg border border-border ${on ? "bg-primary text-primary-foreground" : "bg-surface"}`}>
                          {on && <Check className="h-4 w-4" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-2 flex justify-end gap-1.5 text-xs">
                  {([["normal", "Normal"], ["gec", "Geç Kaldı"], ["izinli", "İzinli"]] as const).map(([k, l]) => (
                    <button key={k} onClick={() => setDurum(s.id, k)} className={`rounded-full px-2.5 py-1 ${r.durum === k ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground"}`}>{l}</button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
