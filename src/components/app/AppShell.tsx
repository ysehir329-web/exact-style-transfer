import { LiquidTabBar } from "./LiquidTabBar";
import { BookOpen, Users, CalendarCheck, FileText, Menu } from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Talebeler", icon: Users },
  { to: "/yoklama", label: "Yoklama", icon: CalendarCheck },
  { to: "/kagit", label: "Kâğıt", icon: FileText },
  { to: "/menu", label: "Menü", icon: Menu },
] as const;

function Mosque() {
  return (
    <svg viewBox="0 0 400 160" className="pointer-events-none absolute bottom-0 right-0 h-[130px] w-auto text-primary-foreground opacity-10" fill="currentColor">
      <path d="M40 160V50l6-30 6 30v110zM330 160V50l6-30 6 30v110z" />
      <path d="M90 160v-50a25 25 0 0150 0v50zM300 160v-50a17 17 0 0134 0v50z" />
      <path d="M150 160v-60a70 70 0 01140 0v60z" />
      <rect x="216" y="10" width="6" height="30" />
      <circle cx="219" cy="10" r="5" />
      <path d="M380 0a28 28 0 1 0 10 50a22 22 0 1 1 -10-50z" />
    </svg>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background pb-32 font-sans text-foreground">
      <header className="relative overflow-hidden rounded-b-[2rem] bg-primary px-4 pb-6 pt-12 shadow-md">
        <Mosque />
        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-card text-primary">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold leading-tight text-primary-foreground">Kur'an Kursu</h1>
            <p className="text-xs text-primary-foreground/85">İlim, hayatın en güzel rehberidir</p>
          </div>
        </div>
      </header>
      <main className="px-4">{children}</main>
      <LiquidTabBar tabs={tabs} />

    </div>
  );
}


export function Avatar({ name, size = "lg" }: { name: string; size?: "lg" | "sm" }) {
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground ${size === "lg" ? "h-11 w-11 text-base" : "h-9 w-9 text-xs"}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
