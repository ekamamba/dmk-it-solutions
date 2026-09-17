import Link from "next/link";
import { ArrowRight, BarChart3, Bot, CheckCircle2, Globe, LineChart, Settings, Smartphone, Database, Zap } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import PackageCard from "@/components/PackageCard";

export default function Home() {
  return <>
    <main>
      <section className="hero-grid overflow-hidden">
        <div className="container grid gap-10 py-14 md:grid-cols-[1.1fr_.9fr] md:items-center md:gap-12 md:py-28">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-blue-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[.15em] text-[#1769e0] sm:text-xs">Serving local & growing businesses</div>
            <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-[#0b1736] sm:text-5xl md:text-7xl">Technology that helps your <span className="gradient-text">business grow.</span></h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">DMK IT Solutions helps businesses attract customers, work more efficiently, and make better decisions with practical websites, automation, business technology, and data solutions.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/website-audit" className="btn-primary w-full justify-center sm:w-auto">Get a Free Website Review <ArrowRight size={17} className="ml-2"/></Link>
              <Link href="#solutions" className="btn-secondary w-full justify-center sm:w-auto">Explore Solutions</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-600"><span>✓ Practical solutions</span><span>✓ Clear pricing</span><span>✓ Ongoing support</span></div>
          </div>
          <div className="card relative overflow-hidden p-5 sm:p-7">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-100 blur-2xl"/>
            <div className="relative"><div className="text-sm font-black uppercase tracking-widest text-[#1769e0]">Your growth roadmap</div><div className="mt-5 space-y-3">
              {["Get more customers","Automate repetitive work","Connect your business data","Build useful dashboards","Improve your technology"].map((x,i)=><div key={x} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-white font-black text-[#1769e0]">{i+1}</div><span className="font-bold text-[#0b1736]">{x}</span></div>)}
            </div></div>
          </div>
        </div>
      </section>

      <section id="solutions" className="container py-20">
        <SectionTitle eyebrow="How we help" title="Solve the business problem, not just the technology problem." text="Start with the outcome you want. We'll help you choose the right technology to get there."/>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {icon:Globe,title:"Get More Customers",text:"Professional websites, local visibility, online booking, lead capture, and conversion improvements.",items:["Website development","Website rescue","Local SEO & Google presence","Online booking & lead forms"]},
            {icon:Settings,title:"Work More Efficiently",text:"Connect systems and automate repetitive work so your team can focus on customers.",items:["Microsoft 365","Business automation","Custom applications","Cloud & integrations"]},
            {icon:BarChart3,title:"Understand Your Business",text:"Turn spreadsheets and disconnected systems into useful information for decision-making.",items:["Power BI dashboards","SQL & databases","ETL & integration","Business reporting"]}
          ].map(({icon:Icon,title,text,items})=><div className="card p-7" key={title}><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#1769e0]"><Icon/></div><h3 className="mt-5 text-2xl font-black text-[#0b1736]">{title}</h3><p className="mt-3 leading-7 text-slate-600">{text}</p><ul className="mt-5 space-y-2 text-sm text-slate-700">{items.map(x=><li key={x}>✓ {x}</li>)}</ul></div>)}
        </div>
      </section>

      <section id="packages" className="bg-[#f5f8fc] py-20">
        <div className="container"><SectionTitle eyebrow="Simple packages" title="Clear starting points for your next step." text="Start small, solve an immediate problem, and expand when your business is ready."/>
          <div className="grid gap-6 lg:grid-cols-3">
            <PackageCard name="Business Technology Checkup" price="$199" description="Find problems before they cost you customers or time." items={["Website & mobile review","Basic SEO & Google presence","Contact & booking review","Security/SSL review","Prioritized PDF action plan","$199 credited toward a qualifying project"]}/>
            <PackageCard featured name="Website Rescue" price="$749" description="Improve an existing website and make it easier for customers to take action." items={["Mobile optimization","Homepage & CTA improvements","Contact form testing","Basic technical SEO","Analytics & Search Console setup","Up to 5 hours of website improvements"]}/>
            <PackageCard name="Business Growth Website" price="$1,995+" description="A professional website designed to attract, build trust, and convert customers." items={["Up to 7 pages","Mobile-first responsive design","Contact & appointment forms","Analytics & Search Console","Basic local SEO","30 days post-launch support"]}/>
          </div>
          <p className="mt-7 text-center text-sm font-semibold text-slate-600">Ongoing Website Care starts at <b>$99/month</b>. Growth support starts at <b>$199/month</b>.</p>
        </div>
      </section>

      <section id="industries" className="container py-20">
        <SectionTitle eyebrow="Who we help" title="Built for businesses that need technology to produce results."/>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {["Contractors & Home Services","Automotive","Beauty & Wellness","Professional Services","Growing Businesses"].map((x,i)=><div className="card p-5" key={x}><div className="text-xs font-black text-[#1769e0]">0{i+1}</div><h3 className="mt-3 font-black text-[#0b1736]">{x}</h3><p className="mt-2 text-sm leading-6 text-slate-600">Practical digital and technology solutions designed around how your customers buy.</p></div>)}
        </div>
      </section>

      <section id="data" className="bg-[#0b1736] py-20 text-white">
        <div className="container grid gap-10 md:grid-cols-2 md:items-center">
          <div><div className="text-xs font-black uppercase tracking-[.2em] text-[#19b5fe]">Our technical advantage</div><h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">More than a web design company.</h2><p className="mt-5 text-lg leading-8 text-slate-300">Your business may start with a website. It doesn't have to end there. DMK can help you move from disconnected spreadsheets and manual processes to integrated data, automation, dashboards, and technology consulting.</p><Link href="/website-audit" className="mt-7 inline-flex rounded-full bg-white px-5 py-3 font-bold text-[#0b1736]">Start With a Review <ArrowRight size={17} className="ml-2"/></Link></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[["Web & Mobile",Globe],["Automation",Zap],["SQL & Databases",Database],["Power BI",BarChart3],["Cloud",Bot],["Reporting",LineChart]].map(([t,Icon])=>{const C=Icon as typeof Globe; return <div className="rounded-2xl border border-white/10 bg-white/5 p-5" key={t as string}><C className="text-[#19b5fe]"/><div className="mt-3 font-bold">{t as string}</div></div>})}
          </div>
        </div>
      </section>

      <section id="about" className="container py-20">
        <div className="card grid gap-8 p-8 md:grid-cols-[1.1fr_.9fr] md:p-12">
          <div><div className="text-xs font-black uppercase tracking-[.2em] text-[#1769e0]">Why DMK</div><h2 className="mt-3 text-4xl font-black text-[#0b1736]">Experienced technology, explained in business language.</h2><p className="mt-5 leading-8 text-slate-600">DMK IT Solutions' current service portfolio spans consulting, training, database consulting, data analytics, software testing, web/mobile development, cloud consultation, and ETL integration. We're turning that technical breadth into simpler, outcome-focused packages for businesses.</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{["Senior-level technical expertise","Practical, cost-conscious solutions","Project or ongoing support","On-site or remote options"].map(x=><div className="flex gap-2 text-sm font-semibold text-slate-700" key={x}><CheckCircle2 className="shrink-0 text-[#1769e0]"/> {x}</div>)}</div></div>
          <div className="rounded-3xl bg-[#f5f8fc] p-7"><div className="text-sm font-black text-[#0b1736]">Ready to identify your biggest opportunity?</div><p className="mt-3 text-sm leading-6 text-slate-600">Start with a free three-point website review. We'll identify practical opportunities around visibility, trust, and customer conversion.</p><Link href="/website-audit" className="btn-primary mt-6 w-full">Request Free Review</Link></div>
        </div>
      </section>
    </main>
  </>;
}