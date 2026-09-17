import Link from "next/link";
export default function PackageCard({ name, price, description, items, featured=false }: {name:string; price:string; description:string; items:string[]; featured?:boolean}) {
  return <div className={`card relative p-7 ${featured ? "border-2 border-[#1769e0]" : ""}`}>
    {featured && <div className="absolute -top-3 left-6 rounded-full bg-[#1769e0] px-3 py-1 text-xs font-black text-white">MOST POPULAR</div>}
    <h3 className="text-xl font-black text-[#0b1736]">{name}</h3><div className="mt-3 text-3xl font-black text-[#1769e0]">{price}</div><p className="mt-3 min-h-14 text-sm leading-6 text-slate-600">{description}</p>
    <ul className="mt-5 space-y-3 text-sm text-slate-700">{items.map(x=><li key={x}>✓ {x}</li>)}</ul>
    <Link href="/website-audit" className="btn-primary mt-7 w-full">Get Started</Link>
  </div>
}