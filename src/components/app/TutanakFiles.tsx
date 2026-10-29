import { useEffect, useState } from "react";
import { Camera, FileText } from "./icons";
import { getFile } from "@/lib/attachments";

function useFileUrl(id?: string | undefined) {
  const [file, setFile] = useState<{ url: string; type: string; name: string } | null>(null);
  useEffect(() => {
    if (!id) return;
    let url = "";
    let alive = true;
    getFile(id).then((f) => {
      if (!f || !alive) return;
      url = URL.createObjectURL(f.blob);
      setFile({ url, type: f.type, name: f.name });
    }).catch(() => undefined);
    return () => { alive = false; if (url) URL.revokeObjectURL(url); };
  }, [id]);
  return file;
}

function One({ id, label, icon: Icon }: { id?: string | undefined; label: string; icon: typeof Camera }) {
  const f = useFileUrl(id);
  if (!id || !f) return null;
  return (
    <a href={f.url} target="_blank" rel="noreferrer" className="block min-w-0 overflow-hidden rounded-xl border border-border bg-surface">
      {f.type.startsWith("image/")
        ? <img src={f.url} alt={label} className="h-24 w-full object-cover" loading="lazy" />
        : <div className="flex h-24 items-center justify-center"><FileText className="h-8 w-8 text-muted-foreground" /></div>}
      <p className="flex items-center gap-1 truncate px-2 py-1 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5 shrink-0" /> {label}</p>
    </a>
  );
}

export function TutanakFiles({ photoId, docId }: { photoId?: string | undefined; docId?: string | undefined }) {
  if (!photoId && !docId) return null;
  return (
    <div className="mt-3 grid grid-cols-2 gap-2">
      <One id={photoId} label="Fotoğraf Kanıtı" icon={Camera} />
      <One id={docId} label="İmzalı Belge" icon={FileText} />
    </div>
  );
}
