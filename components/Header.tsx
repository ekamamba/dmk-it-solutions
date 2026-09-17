"use client";

import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="container relative flex items-center justify-between gap-4 py-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1736] font-black text-white">DMK</div>
          <div className="min-w-0">
            <div className="truncate text-sm font-black tracking-tight text-[#0b1736] sm:text-base">DMK IT SOLUTIONS</div>
            <div className="text-[9px] font-semibold uppercase tracking-[.18em] text-slate-500 sm:text-[10px]">Technology for Growth</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-700 md:flex">
          <Link href="/">Home</Link>
          <Link href="#solutions">Solutions</Link>
          <Link href="#packages">Packages</Link>
          <Link href="#industries">Industries</Link>
          <Link href="#data">Data & Analytics</Link>
          <Link href="#about">About</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/website-audit" className="btn-primary hidden sm:inline-flex">Free Website Review <ArrowRight size={16} className="ml-2" /></Link>
          <button
            className="rounded-xl border border-slate-200 p-2 md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {menuOpen && (
          <nav className="absolute left-0 right-0 top-full mt-2 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg md:hidden">
            <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link href="#solutions" onClick={() => setMenuOpen(false)}>Solutions</Link>
            <Link href="#packages" onClick={() => setMenuOpen(false)}>Packages</Link>
            <Link href="#industries" onClick={() => setMenuOpen(false)}>Industries</Link>
            <Link href="#data" onClick={() => setMenuOpen(false)}>Data & Analytics</Link>
            <Link href="#about" onClick={() => setMenuOpen(false)}>About</Link>
            <Link href="/website-audit" className="btn-primary mt-2 w-full justify-center" onClick={() => setMenuOpen(false)}>
              Free Website Review
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}