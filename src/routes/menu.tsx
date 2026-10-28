import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Download, Upload, RotateCcw, FileDown, UserPlus } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { ReportSheet } from "@/components/app/ReportSheet";
import { Sheet } from "@/components/app/Sheet";
import { StudentForm, emptyStudent } from "@/components/app/StudentForm";
import { useStore, type State } from "@/lib/store";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menü — Kur'an Kursu" },
      { name: "description", content: "Kur'an kursu verilerini yedekleyin, geri yükleyin veya sıfırlayın." },
      { property: "og:title", content: "Menü — Kur'an Kursu" },
      { property: "og:description", content: "Kur'an kursu verilerini yedekleyin, geri yükleyin veya sıfırlayın." },
    ],
  }),
  component: Menu,
});

function Menu() {
  const { students, tutanaklar, attendance, resetAll, importAll, addStudent } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState("");
  const [reportOpen, setReportOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ students, tutanaklar, attendance }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kuran-kursu-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importData = async (f?: File) => {
    if (!f) return;
    try {
      importAll(JSON.parse(await f.text()) as State);
      setMsg("Yedek geri yüklendi.");
    } catch {
      setMsg("Dosya okunamadı.");
    }
  };
  const btn = "flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left text-sm";

  return (
    <AppShell>
      <h2 className="mt-7 font-serif text-3xl font-bold">Menü</h2>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[["Talebe", students.length], ["Yoklama", attendance.length], ["Tutanak", tutanaklar.length]].map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-surface p-3"><p className="font-serif text-2xl font-bold">{v}</p><p className="text-xs text-muted-foreground">{l}</p></div>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        <button onClick={() => setAddOpen(true)} className={`${btn} border-primary bg-primary text-primary-foreground`}><UserPlus className="h-5 w-5" /> Talebe Ekle</button>
        <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Yeni Talebe">
          <StudentForm initial={emptyStudent} onSubmit={(s) => { addStudent(s); setAddOpen(false); setMsg(`${s.name} eklendi.`); }} />
        </Sheet>
        <button onClick={() => setReportOpen(true)} className={btn}><FileDown className="h-5 w-5 text-primary" /> Yoklama Raporu İndir (PDF / Excel)</button>
        <ReportSheet open={reportOpen} onClose={() => setReportOpen(false)} />
        <button onClick={exportData} className={btn}><Download className="h-5 w-5 text-primary" /> Verileri Yedekle (indir)</button>
        <button onClick={() => fileRef.current?.click()} className={btn}><Upload className="h-5 w-5 text-primary" /> Yedeği Geri Yükle</button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => importData(e.target.files?.[0])} />
        <button
          onClick={() => { if (confirm("Tüm talebeler, yoklamalar ve tutanaklar silinsin mi?")) { resetAll(); setMsg("Tüm veriler sıfırlandı."); } }}
          className={`${btn} border-destructive/40 text-destructive`}
        >
          <RotateCcw className="h-5 w-5" /> Tüm Verileri Sıfırla
        </button>
        {msg && <p className="text-center text-sm text-primary">{msg}</p>}
        <p className="text-center text-xs text-muted-foreground">Veriler bu cihazda saklanır.</p>
      </div>
    </AppShell>
  );
}
