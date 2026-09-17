import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 bg-[#0b1736] text-white">
      <div className="container grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <div className="text-xl font-black">DMK IT SOLUTIONS</div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">Technology that helps local and growing businesses get customers, work efficiently, and understand their data.</p>
          <p className="mt-5 text-sm text-slate-300">(844) 543-5453 · info@DMKITSolutions.com</p>
        </div>
        <div><div className="font-bold">Growth</div><div className="mt-3 space-y-2 text-sm text-slate-300"><Link className="block" href="/website-audit">Free Website Review</Link><Link className="block" href="#packages">Website Rescue</Link><Link className="block" href="#packages">Growth Website</Link></div></div>
        <div><div className="font-bold">Technology</div><div className="mt-3 space-y-2 text-sm text-slate-300"><Link className="block" href="#solutions">Business Technology</Link><Link className="block" href="#data">Data & Analytics</Link><Link className="block" href="#about">Consulting</Link></div></div>
        <div><div className="font-bold">Start</div><p className="mt-3 text-sm leading-6 text-slate-300">Tell us what you are trying to improve and we'll help you identify the next practical step.</p><Link href="/website-audit" className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-sm font-bold text-[#0b1736]">Get Started</Link></div>
      </div>
      <div className="border-t border-white/10"><div className="container flex flex-col justify-between gap-2 py-5 text-xs text-slate-400 sm:flex-row"><span>© 2026 DMK IT Solutions. All rights reserved.</span><span>Website & technology services for businesses.</span></div></div>
    </footer>
  );
}