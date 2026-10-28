import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft, Pencil, Trash2, MapPin, User, Phone, Plus,
  CalendarDays, Clock, CalendarOff, Sunrise, Sun, CloudSun, Sunset, Moon,
  CheckCircle2, CalendarX, Printer, AlertTriangle, PenLine, ThumbsUp, X,
} from "lucide-react";
import { AppShell, Avatar } from "@/components/app/AppShell";
import { Sheet, Field, inputCls, primaryBtn } from "@/components/app/Sheet";
import { StudentForm } from "@/components/app/StudentForm";
import { useStore, type AttendanceRow, type Tutanak } from "@/lib/store";
import { computeStats, monthly, VAKITLER } from "@/lib/stats";

export const Route = createFileRoute("/talebe/$name")({
  head: () => ({
    meta: [
      { title: "Talebe Detayı — Kur'an Kursu" },
      { name: "description", content: "Talebe detayı: yoklama geçmişi, tutanaklar ve aile raporu." },
      { property: "og:title", content: "Talebe Detayı — Kur'an Kursu" },
      { property: "og:description", content: "Talebe detayı: yoklama geçmişi, tutanaklar ve aile raporu." },
    ],
  }),
  component: TalebeDetay,
});

const tabs = ["Yoklama", "Tutanaklar", "Aile Raporu"] as const;
const vakitIcons = { Sabah: Sunrise, Öğle: Sun, İkindi: CloudSun, Akşam: Sunset, Yatsı: Moon } as Record<string, typeof Clock>;
const TAGS = ["Namaza Katılmama", "Derse Geç Kalma", "Disiplinsizlik", "Arkadaşlarıyla Tartışma", "Güzel Davranış", "Başarı", "Diğer"];
const today = () => new Date().toISOString().slice(0, 10);
const weekday = (d: string) => new Date(d + "T12:00").toLocaleDateString("tr-TR", { weekday: "long" });

function StatCard({ label, icon: Icon, value, tone }: { label: string; icon: typeof Clock; value: number; tone: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div>
      <p className="mt-3 font-serif text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function durumLabel(r: AttendanceRow) {
  if (r.durum === "izinli") return { t: "İzinli", c: "text-info" };
  if (r.durum === "gec") return { t: "Geç Kaldı", c: "text-warn" };
  if (r.vakitler.length && r.ders) return { t: "Namaz + Ders", c: "text-primary" };
  if (r.ders) return { t: "Ders", c: "text-primary" };
  if (r.vakitler.length) return { t: `Namaz (${r.vakitler.length})`, c: "text-primary" };
  return { t: "Katılmadı", c: "text-destructive" };
}

function AttendanceForm({ onSubmit }: { onSubmit: (a: Omit<AttendanceRow, "id" | "studentId">) => void }) {
  const [date, setDate] = useState(today());
  const [vakitler, setV] = useState<string[]>([]);
  const [ders, setDers] = useState(false);
  const [durum, setDurum] = useState<AttendanceRow["durum"]>("normal");
  const chip = (on: boolean) => `rounded-xl border px-3 py-2 text-sm ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface"}`;
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ date, vakitler, ders, durum }); }}>
      <Field label="Tarih"><input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
      <p className="text-xs text-muted-foreground">Kıldığı namazlar</p>
      <div className="mb-3 mt-1 flex flex-wrap gap-2">
        {VAKITLER.map((v) => (
          <button type="button" key={v} className={chip(vakitler.includes(v))} onClick={() => setV(vakitler.includes(v) ? vakitler.filter((x) => x !== v) : [...vakitler, v])}>{v}</button>
        ))}
        <button type="button" className={chip(ders)} onClick={() => setDers(!ders)}>Ders</button>
      </div>
      <p className="text-xs text-muted-foreground">Durum</p>
      <div className="mb-4 mt-1 flex gap-2">
        {([["normal", "Normal"], ["gec", "Geç Kaldı"], ["izinli", "İzinli"]] as const).map(([k, l]) => (
          <button type="button" key={k} className={chip(durum === k)} onClick={() => setDurum(k)}>{l}</button>
        ))}
      </div>
      <button className={primaryBtn}>Kaydet</button>
    </form>
  );
}

function TutanakForm({ onSubmit }: { onSubmit: (t: Omit<Tutanak, "id" | "studentId">) => void }) {
  const [f, setF] = useState({ title: "", tag: TAGS[0]!, date: today(), body: "", positive: false, signed: false });
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (f.title.trim()) onSubmit(f); }}>
      <div className="mb-3 grid grid-cols-2 gap-2">
        {[false, true].map((p) => (
          <button type="button" key={String(p)} onClick={() => setF({ ...f, positive: p })} className={`rounded-xl border py-2 text-sm ${f.positive === p ? (p ? "border-good bg-good text-primary-foreground" : "border-destructive bg-destructive text-destructive-foreground") : "border-border bg-surface"}`}>
            {p ? "Olumlu" : "Olumsuz"}
          </button>
        ))}
      </div>
      <Field label="Başlık *"><input className={inputCls} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Konu"><select className={inputCls} value={f.tag} onChange={(e) => setF({ ...f, tag: e.target.value })}>{TAGS.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Tarih"><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
      </div>
      <Field label="Açıklama"><textarea rows={5} className={inputCls} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
      <label className="mb-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={f.signed} onChange={(e) => setF({ ...f, signed: e.target.checked })} /> Veli tarafından imzalandı</label>
      <button className={primaryBtn} disabled={!f.title.trim()}>Kaydet</button>
    </form>
  );
}

function TalebeDetay() {
  const { name: raw } = Route.useParams();
  const store = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Yoklama");
  const [sheet, setSheet] = useState<null | "edit" | "yoklama" | "tutanak">(null);
  const found = store.students.find((s) => s.id === raw) ?? store.students.find((s) => s.name === decodeURIComponent(raw));
  const student = found;
  const id = found?.id ?? raw;

  if (!student) {
    return (
      <AppShell>
        <Link to="/" className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Talebeler</Link>
        <p className="mt-10 text-center text-muted-foreground">Talebe bulunamadı.</p>
      </AppShell>
    );
  }

  const rows = store.attendance.filter((a) => a.studentId === id).sort((a, b) => b.date.localeCompare(a.date));
  const tut = store.tutanaklar.filter((t) => t.studentId === id).sort((a, b) => b.date.localeCompare(a.date));
  const st = computeStats(rows);
  const months = monthly(rows);

  const remove = () => {
    if (confirm(`${student.name} ve tüm kayıtları silinsin mi?`)) { store.removeStudent(id); navigate({ to: "/" }); }
  };

  const TutCard = ({ t }: { t: Tutanak }) => (
    <div className={`rounded-2xl border bg-card p-4 ${t.positive ? "border-good/40" : "border-warn/40"}`}>
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${t.positive ? "bg-brand-soft" : "bg-amber-soft"}`}>
          {t.positive ? <ThumbsUp className="h-5 w-5 text-good" /> : <AlertTriangle className="h-5 w-5 text-warn" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{t.title}</p>
          <p className="text-xs text-muted-foreground">{t.date}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`rounded-full px-3 py-1 text-xs ${t.positive ? "bg-good text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>{t.tag}</span>
          <button onClick={() => store.updateTutanak(t.id, { signed: !t.signed })} className={`flex items-center gap-1 text-xs ${t.signed ? "text-good" : "text-muted-foreground"}`}>
            <PenLine className="h-3.5 w-3.5" /> {t.signed ? "İmzalı" : "İmzala"}
          </button>
        </div>
      </div>
      {t.body && <p className="mt-3 whitespace-pre-wrap rounded-xl bg-surface p-4 text-sm leading-relaxed">{t.body}</p>}
      <button onClick={() => confirm("Tutanak silinsin mi?") && store.removeTutanak(t.id)} className="mt-2 flex items-center gap-1 text-xs text-destructive"><Trash2 className="h-3.5 w-3.5" /> Sil</button>
    </div>
  );

  const pos = tut.filter((t) => t.positive);
  const neg = tut.filter((t) => !t.positive);

  return (
    <AppShell>
      <Link to="/" className="mt-4 flex items-center gap-2 text-sm text-muted-foreground print:hidden">
        <ArrowLeft className="h-4 w-4" /> Talebeler
      </Link>

      <div className="mt-3 rounded-2xl border border-border bg-card p-4 print:hidden">
        <div className="flex items-center gap-3">
          <Avatar name={student.name} />
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-serif text-2xl font-bold leading-tight">{student.name}</h2>
            <p className="text-sm text-muted-foreground">
              {[student.age && `${student.age} yaş`, student.group].filter(Boolean).join(" · ")}
            </p>
          </div>
          <button onClick={() => setSheet("edit")} className="rounded-xl border border-border p-2" aria-label="Düzenle"><Pencil className="h-4 w-4" /></button>
          <button onClick={remove} className="rounded-xl p-2 text-destructive" aria-label="Sil"><Trash2 className="h-4 w-4" /></button>
        </div>
        {(student.guardian || student.phone || student.city) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
            {student.guardian && <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {student.guardian}</span>}
            {student.phone && <a href={`tel:${student.phone}`} className="flex items-center gap-1.5 text-primary"><Phone className="h-4 w-4" /> {student.phone}</a>}
            {student.city && <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {student.city}</span>}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1 rounded-2xl bg-surface p-1.5 print:hidden">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl py-2 text-sm ${tab === t ? "bg-card font-semibold shadow-sm" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "Yoklama" && (
        <>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[
              { l: "Toplam", v: st.toplam, c: "text-foreground" },
              { l: "Ders", v: st.ders, c: "text-primary" },
              { l: "Geç", v: st.gec, c: "text-warn" },
              { l: "İzinli", v: st.izinli, c: "text-info" },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl bg-surface py-3">
                <p className={`font-serif text-2xl font-bold ${s.c}`}>{s.v}</p>
                <p className="text-xs text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between rounded-2xl bg-surface px-3 py-3">
            {VAKITLER.map((v) => {
              const Icon = vakitIcons[v] ?? Clock;
              return (
                <div key={v} className="flex flex-1 flex-col items-center">
                  <Icon className="h-4 w-4 text-good" />
                  <p className="mt-1 font-serif text-lg font-bold">{st.vakit[v] ?? 0}</p>
                  <p className="text-[11px] text-muted-foreground">{v}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold">Yoklama Geçmişi</h3>
            <button onClick={() => setSheet("yoklama")} className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-sm text-primary-foreground"><Plus className="h-4 w-4" /> Ekle</button>
          </div>
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
            {rows.length === 0 && <p className="p-5 text-center text-sm text-muted-foreground">Kayıt yok.</p>}
            {rows.map((h) => (
              <div key={h.id} className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 text-sm last:border-0">
                <span className="font-medium">{h.date}</span>
                {h.durum !== "normal" && <span className={`text-xs ${durumLabel(h).c}`}>{durumLabel(h).t}</span>}
                <span className="flex-1" />
                {h.vakitler.map((c) => <span key={c} className="rounded-full bg-brand-soft px-2.5 py-0.5 text-xs text-primary">{c} ✓</span>)}
                <span className="text-xs text-muted-foreground">Ders: {h.ders ? "✓" : "—"}</span>
                <button onClick={() => store.removeAttendance(h.id)} aria-label="Kaydı sil" className="text-muted-foreground"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>

          {months.length > 0 && (
            <div className="mt-4 rounded-2xl border border-border bg-card p-4">
              <h4 className="font-serif text-lg font-bold">Aylık Gelişim</h4>
              <div className="mt-3 flex h-28 items-end gap-4 border-b border-border px-2">
                {months.map((m) => (
                  <div key={m.key} className="flex h-full flex-1 items-end justify-center gap-1.5">
                    <div className="w-5 rounded-t-lg bg-good" style={{ height: `${Math.max(m.namaz, 2)}%` }} title={`Namaz %${m.namaz}`} />
                    <div className="w-5 rounded-t-lg bg-warn" style={{ height: `${Math.max(m.ders, 2)}%` }} title={`Ders %${m.ders}`} />
                  </div>
                ))}
              </div>
              <div className="mt-1 flex gap-4 px-2 text-xs text-muted-foreground">{months.map((m) => <span key={m.key} className="flex-1 text-center">{m.ay}</span>)}</div>
              <div className="mt-2 flex justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-good" /> Namaz %</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warn" /> Ders %</span>
              </div>
            </div>
          )}
        </>
      )}

      {tab === "Tutanaklar" && (
        <>
          <div className="mt-6 flex items-start justify-between gap-3">
            <h3 className="font-serif text-2xl font-bold leading-tight">Tutanaklar & Davranış Kayıtları</h3>
            <button onClick={() => setSheet("tutanak")} className="flex shrink-0 items-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm text-destructive-foreground"><Plus className="h-4 w-4" /> Tutanak Ekle</button>
          </div>
          <h4 className="mt-5 font-serif text-lg font-bold text-primary">Olumlu ({pos.length})</h4>
          <div className="mt-3 space-y-4">{pos.length ? pos.map((t) => <TutCard key={t.id} t={t} />) : <p className="text-sm text-muted-foreground">Kayıt yok.</p>}</div>
          <h4 className="mt-5 font-serif text-lg font-bold text-warn">Olumsuz ({neg.length})</h4>
          <div className="mt-3 space-y-4">{neg.length ? neg.map((t) => <TutCard key={t.id} t={t} />) : <p className="text-sm text-muted-foreground">Kayıt yok.</p>}</div>
        </>
      )}

      {tab === "Aile Raporu" && (
        <>
          <div className="mt-6 flex items-center justify-between print:hidden">
            <h3 className="font-serif text-2xl font-bold">Aile Raporu</h3>
            <button onClick={() => window.print()} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground"><Printer className="h-4 w-4" /> Yazdır / PDF</button>
          </div>
          <div className="mt-4 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-4">
              <Avatar name={student.name} />
              <div>
                <p className="font-serif text-xl font-bold">{student.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  {student.age && <span>{student.age} yaş</span>}
                  {student.group && <span className="rounded-full bg-amber-soft px-2.5 py-0.5 text-xs font-medium text-warn">{student.group}</span>}
                  {student.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {student.city}</span>}
                </div>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-y-6 border-t border-border pt-5 text-center">
              {[
                { icon: CheckCircle2, v: st.namazGun, l: "Namaza Katıldığı", c: "text-good" },
                { icon: CheckCircle2, v: st.ders, l: "Derse Girdiği", c: "text-good" },
                { icon: Clock, v: st.gec, l: "Geç Kaldığı", c: "text-warn" },
                { icon: CalendarX, v: st.katilmadi, l: "Katılmadığı", c: "text-destructive" },
                { icon: CalendarOff, v: st.izinli, l: "İzinli Gün", c: "text-info" },
                { icon: CalendarDays, v: st.toplam, l: "Toplam Gün", c: "text-muted-foreground" },
              ].map((s) => (
                <div key={s.l}>
                  <s.icon className={`mx-auto h-7 w-7 ${s.c}`} />
                  <p className="mt-1 font-serif text-2xl font-bold">{s.v}</p>
                  <p className="text-xs text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
            {tut.length > 0 && (
              <>
                <h4 className="mt-6 font-serif text-lg font-bold">Davranış Kayıtları</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  {tut.map((t) => <li key={t.id}><span className={t.positive ? "text-good" : "text-warn"}>●</span> {t.date} — {t.title}</li>)}
                </ul>
              </>
            )}
          </div>
        </>
      )}

      <Sheet open={sheet === "edit"} onClose={() => setSheet(null)} title="Talebeyi Düzenle">
        <StudentForm initial={student} onSubmit={(s) => { store.updateStudent(id, s); setSheet(null); }} />
      </Sheet>
      <Sheet open={sheet === "yoklama"} onClose={() => setSheet(null)} title="Yoklama Ekle">
        <AttendanceForm onSubmit={(a) => { store.addAttendance({ ...a, studentId: id }); setSheet(null); }} />
      </Sheet>
      <Sheet open={sheet === "tutanak"} onClose={() => setSheet(null)} title="Tutanak Ekle">
        <TutanakForm onSubmit={(t) => { store.addTutanak({ ...t, studentId: id }); setSheet(null); }} />
      </Sheet>
    </AppShell>
  );
}
