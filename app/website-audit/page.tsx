import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function WebsiteAudit() {
  return <main>
    <section className="hero-grid py-16"><div className="container grid gap-12 md:grid-cols-[1fr_.8fr] md:items-start">
      <div><Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#1769e0]"><ArrowLeft size={16}/> Back to DMK</Link>
        <div className="mt-10 text-xs font-black uppercase tracking-[.2em] text-[#1769e0]">Free introductory review</div>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-[#0b1736] md:text-6xl">Is your website helping your business grow?</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">We'll look at three things that matter: can customers find you, trust you, and take the next step?</p>
        <div className="mt-8 space-y-4">{["Visibility: basic SEO, Google presence, and mobile experience","Trust: design, content, contact information, and credibility","Conversion: calls, forms, estimates, bookings, and customer actions"].map(x=><div className="flex gap-3" key={x}><CheckCircle2 className="mt-1 shrink-0 text-[#1769e0]"/><span className="font-semibold text-slate-700">{x}</span></div>)}</div>
      </div>
      <div className="card p-7">
        <h2 className="text-2xl font-black text-[#0b1736]">Request your free review</h2>
        <p className="mt-2 text-sm text-slate-600">No obligation. We'll contact you with the next step.</p>
        <form action="/api/contact" method="post" className="mt-6 space-y-4">
          <input className="input" name="name" placeholder="Your name" required />
          <input className="input" name="business" placeholder="Business name" required />
          <input className="input" name="website" type="url" placeholder="https://yourwebsite.com" required />
          <input className="input" name="email" type="email" placeholder="Email address" required />
          <input className="input" name="phone" placeholder="Phone (optional)" />
          <select className="input" name="businessType" defaultValue=""><option value="" disabled>Business type</option><option>Contractor / Home Services</option><option>Automotive</option><option>Beauty / Wellness</option><option>Professional Services</option><option>Restaurant / Food</option><option>Nonprofit / Church</option><option>Other</option></select>
          <button className="btn-primary w-full" type="submit">Get My Free Review</button>
          <p className="text-center text-xs leading-5 text-slate-500">By submitting, you agree that DMK IT Solutions may contact you about your request.</p>
        </form>
      </div>
    </div></section>
    <section className="container py-16"><div className="grid gap-6 md:grid-cols-3">{[["Business Technology Checkup","$199","A deeper review with a prioritized action plan. The $199 can be credited toward a qualifying project."],["Website Rescue","$749","Practical improvements to an existing website, including mobile, forms, CTAs, SEO basics, and analytics."],["Business Growth Website","$1,995+","A new customer-focused website with lead capture, analytics, SEO basics, and post-launch support."]].map(([a,b,c])=><div className="card p-6" key={a}><div className="text-sm font-black text-[#1769e0]">{a}</div><div className="mt-2 text-3xl font-black text-[#0b1736]">{b}</div><p className="mt-3 text-sm leading-6 text-slate-600">{c}</p></div>)}</div></section>
  </main>;
}