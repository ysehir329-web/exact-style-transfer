import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, FileText, Camera, ImagePlus, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/kagit")({
  head: () => ({
    meta: [
      { title: "Kâğıt Yoklama — Kur'an Kursu" },
      { name: "description", content: "Kâğıt yoklamanın fotoğrafını yükleyin, yapay zekâ kayıtları çıkarsın." },
      { property: "og:title", content: "Kâğıt Yoklama — Kur'an Kursu" },
      { property: "og:description", content: "Kâğıt yoklamanın fotoğrafını yükleyin, yapay zekâ kayıtları çıkarsın." },
    ],
  }),
  component: Kagit,
});

const fmt = (s: string) => new Date(s).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
const iso = (d: Date) => d.toISOString().slice(0, 10);

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mt-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <label className="relative flex-1 rounded-xl border border-border py-3 text-center text-base">
          {fmt(value)}
          <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0" />
        </label>
      </div>
    </div>
  );
}

function Kagit() {
  const now = new Date();
  const [start, setStart] = useState(iso(new Date(now.getFullYear(), now.getMonth(), 1, 12)));
  const [end, setEnd] = useState(iso(now));
  const [files, setFiles] = useState<File[]>([]);
  return (
    <AppShell>
      <h2 className="mt-2 font-serif text-3xl font-bold">Kâğıt Yoklama</h2>
      <p className="mt-2 text-sm text-muted-foreground">Haftalık veya aylık kâğıt yoklamanın fotoğrafını yükleyin — yapay zekâ kayıtları çıkarır, kontrol edip kaydedersiniz.</p>
      <div className="mt-5 rounded-2xl border border-border bg-card p-5">
        <h3 className="flex items-center gap-3 font-serif text-lg font-bold"><FileText className="h-5 w-5 text-primary" /> Kâğıt Yoklama (Haftalık / Aylık)</h3>
        <p className="mt-2 text-sm text-muted-foreground">Kâğıda aldığınız yoklama çizelgesinin fotoğrafını çekin veya galeriden yükleyin — yapay zekâ isimleri okur, kayıtlı talebelerle eşleştirir ve gün gün (ör. tüm ay) yoklamayı doldurur.</p>
        <DateField label="Başlangıç Tarihi" value={start} onChange={setStart} />
        <DateField label="Bitiş Tarihi" value={end} onChange={setEnd} />
        <button onClick={() => { setStart(iso(new Date(now.getFullYear(), now.getMonth(), 1, 12))); setEnd(iso(now)); }} className="mt-4 w-full rounded-xl border border-border py-2 text-sm">Bu Ay</button>
        <p className="mt-5 text-xs text-muted-foreground">Çizelge Fotoğrafları</p>
        <label className="mt-2 flex w-fit items-center gap-3 rounded-xl border border-dashed border-border px-6 py-2 text-sm text-muted-foreground">
          <Camera className="h-4 w-4" /> Fotoğraf Çek
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => setFiles((f) => [...f, ...Array.from(e.target.files ?? [])])} />
        </label>
        <label className="mt-2 flex w-fit items-center gap-3 rounded-xl border border-dashed border-border px-6 py-2 text-sm text-muted-foreground">
          <ImagePlus className="h-4 w-4" /> Galeriden Seç (birden fazla)
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => setFiles((f) => [...f, ...Array.from(e.target.files ?? [])])} />
        </label>
        {files.length > 0 && <p className="mt-2 text-xs text-primary">{files.length} fotoğraf seçildi</p>}
        <p className="mt-2 text-xs text-muted-foreground">Fotoğraflar özel olarak saklanır; yükleme sonrası kontrol tablosunda her hücreyi dokunarak düzeltebilirsiniz.</p>
        <button disabled={!files.length} className="mt-4 flex items-center gap-3 rounded-xl bg-primary px-6 py-2.5 text-sm text-primary-foreground disabled:opacity-50">
          <Sparkles className="h-4 w-4" /> AI ile Analiz Et
        </button>
      </div>
    </AppShell>
  );
}
