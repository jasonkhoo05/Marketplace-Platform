import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { productFromRow, type ProductRow } from "@/lib/products";
import { hasEnvVars } from "@/lib/utils";
import { Suspense } from "react";

async function TrendingPreview() {
  let trending: { id: number; name: string; price: number; image: string }[] = [];

  if (hasEnvVars) {
    const supabase = await createClient();
    const { data: rows } = await supabase
      .from("product")
      .select(`
        prod_id,
        prod_name,
        prod_desc,
        prod_price,
        prod_stock_qty,
        prod_rating,
        prod_sold_qty,
        prod_image,
        prod_cat_link!prod_cat_link_prod_fk(
          prod_cat_id,
          product_category_type!prod_cat_link_prod_cat_fk(
            prod_cat_name)),
        user!product_seller_uuid_fkey(username)
      `)
      .order("prod_sold_qty", { ascending: false })
      .limit(4);

    trending =
      (rows as unknown as ProductRow[] | null)?.map((r) => {
        const p = productFromRow(r);
        return { id: p.id, name: p.name, price: p.price, image: p.image };
      }) ?? [];
  }

  const placeholders = [
    { name: "Wireless Headphones", price: "89.00", badge: "Hot" },
    { name: "Mechanical Keyboard", price: "129.00", badge: "Top" },
    { name: "Running Shoes", price: "64.00", badge: null },
    { name: "Vintage Camera", price: "210.00", badge: null },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {trending.length === 0 ? (
        placeholders.map((item) => (
          <div key={item.name} className="prod-card">
            <div className="prod-img">
              <div style={{ width: 40, height: 40, borderRadius: 9, background: "linear-gradient(135deg,#185fa5,#1d9e75)", opacity: 0.2 }} />
              {item.badge && <span className="prod-badge">{item.badge}</span>}
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold" style={{ color: "#0d2b22" }}>{item.name}</p>
              <p className="text-xs" style={{ color: "#4a7060" }}>${item.price}</p>
            </div>
          </div>
        ))
      ) : (
        trending.map((item) => (
          <Link key={item.id} href={`/buyer/products/${item.id}`} className="prod-card">
            <div className="prod-img">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold" style={{ color: "#0d2b22" }}>{item.name}</p>
              <p className="text-xs" style={{ color: "#4a7060" }}>${item.price}</p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col w-full" style={{ background: "#f5faf8" }}>

      {/* NAV */}
      <nav className="flex justify-between items-center px-8 py-4 border-b sticky top-0 z-50" style={{ background: "rgba(255,255,255,0.96)" }}>
        <div className="flex items-center gap-2">
          <div className="grad" style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, color: "white" }}>
            N
          </div>
          <h1 className="grad-text text-lg font-bold leading-none">NexMart</h1>
        </div>
        <div className="flex gap-2 items-center">
          <Link href="/login" className="px-4 py-2 flex items-center justify-center rounded-lg text-sm font-semibold border" style={{ borderColor: "rgba(29,158,117,0.3)", color: "#0f6e56" }}>
            Login
          </Link>
          <Link href="/signup" className="grad px-4 py-2 flex items-center justify-center text-white rounded-lg text-sm font-semibold" style={{ boxShadow: "0 2px 10px rgba(29,158,117,0.25)" }}>
            Sign Up
          </Link>
        </div>
      </nav>

      <section className="grad grid md:grid-cols-2" style={{ minHeight: 460 }}>

        <div className="flex flex-col justify-center px-10 py-16">
          <div className="hero-pill">✦ The smarter marketplace</div>
          <h2 className="text-4xl font-extrabold text-white mb-4" style={{ lineHeight: 1.15 }}>
            Buy and sell anything — without the hassle
          </h2>
          <p className="text-sm mb-7" style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.65, maxWidth: 340 }}>
            NexMart connects buyers and sellers in one seamless platform,
            making transactions faster, safer, and more efficient than ever.
          </p>
          <div className="flex gap-2 mb-7">
            <Link href="/signup" className="btn-white">Get Started</Link>
            <Link href="/login" className="btn-outline-white">Login</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {["All", "Electronics", "Fashion", "Home", "Sports"].map((tag, i) => (
              <span key={tag} className={`hero-tag${i === 0 ? " hero-tag-active" : ""}`}>{tag}</span>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center py-10 px-8">
          <div style={{ position: "relative", width: 255, height: 295 }}>

          </div>
        </div>
      </section>

      <div className="flex justify-center bg-white border-b" style={{ borderColor: "rgba(29,158,117,0.15)" }}>
        {[
          { num: "10K+", label: "Active Users" },
          { num: "5K+", label: "Products Listed" },
          { num: "99%", label: "Satisfaction" },
          { num: "2min", label: "Avg. Sale Time" },
        ].map((s) => (
          <div key={s.label} className="stat-item">
            <p className="grad-text text-2xl font-extrabold">{s.num}</p>
            <p className="text-xs mt-0.5" style={{ color: "#4a7060" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2">
        <div className="why-text bg-white">
          <p className="eyebrow">Why NexMart</p>
          <h3 className="text-2xl font-extrabold mb-3" style={{ color: "#0d2b22", lineHeight: 1.25 }}>
            The easiest way to trade anything
          </h3>
          <p className="text-sm mb-6" style={{ color: "#4a7060", lineHeight: 1.7 }}>
            A simple and intuitive platform designed for both buyers and sellers —
            list your first product in under 2 minutes.
          </p>
          <div className="flex flex-col gap-2.5">
            {["No complicated listing forms", "Instant buyer-seller chat", "Dashboard to track all orders"].map((c) => (
              <div key={c} className="flex items-center gap-2 text-sm" style={{ color: "#0d2b22" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(135deg,#185fa5,#1d9e75)", flexShrink: 0, display: "inline-block" }} />
                {c}
              </div>
            ))}
          </div>
        </div>
        <div className="why-visual" style={{ background: "#f2faf7" }}>
          <div className="mock-wrap">
            <div className="mock-card" style={{ width: 158, top: 0, left: 0 }}>
              <div className="mock-icon">
                <svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" /></svg>
              </div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "#0d2b22" }}>New listing live</p>
              <p style={{ fontSize: 10, color: "#4a7060" }}>Headphones · $89</p>
              <div className="mock-bar" style={{ width: "80%" }} />
            </div>
            <div className="mock-card" style={{ width: 143, top: 72, left: 50 }}>
              <div className="mock-icon" style={{ background: "linear-gradient(135deg,#1d9e75,#185fa5)" }}>
                <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
              </div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "#0d2b22" }}>Buyer connected</p>
              <p style={{ fontSize: 10, color: "#4a7060" }}>Offer received · $82</p>
              <div className="mock-bar" style={{ width: "60%", background: "linear-gradient(90deg,#1d9e75,#185fa5)" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2">
        <div className="why-visual bg-white">
          <div className="mock-wrap">
            <div className="mock-card" style={{ width: 158, top: 0, left: 0 }}>
              <div className="mock-icon">
                <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "#0d2b22" }}>Payment secured</p>
              <p style={{ fontSize: 10, color: "#4a7060" }}>End-to-end encrypted</p>
              <div className="mock-bar" style={{ width: "100%" }} />
            </div>
            <div className="mock-card" style={{ width: 143, top: 72, left: 50 }}>
              <div className="mock-icon" style={{ background: "linear-gradient(135deg,#1d9e75,#185fa5)" }}>
                <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p className="text-xs font-semibold mb-0.5" style={{ color: "#0d2b22" }}>Seller verified</p>
              <p style={{ fontSize: 10, color: "#4a7060" }}>4.9 ★ · 230 sales</p>
              <div className="mock-bar" style={{ width: "92%", background: "linear-gradient(90deg,#1d9e75,#185fa5)" }} />
            </div>
          </div>
        </div>
        <div className="why-text" style={{ background: "#f2faf7" }}>
          <p className="eyebrow">Secure &amp; Fast</p>
          <h3 className="text-2xl font-extrabold mb-3" style={{ color: "#0d2b22", lineHeight: 1.25 }}>
            Your payments and data, always protected
          </h3>
          <p className="text-sm mb-6" style={{ color: "#4a7060", lineHeight: 1.7 }}>
            Modern security systems keep every transaction safe — so you can buy
            and sell with total peace of mind.
          </p>
          <div className="flex flex-col gap-2.5">
            {["Encrypted payment processing", "Verified seller profiles", "Dispute resolution support"].map((c) => (
              <div key={c} className="flex items-center gap-2 text-sm" style={{ color: "#0d2b22" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "linear-gradient(135deg,#185fa5,#1d9e75)", flexShrink: 0, display: "inline-block" }} />
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="px-10 py-16 bg-white">
        <h3 className="text-2xl font-bold text-center mb-10" style={{ color: "#0d2b22" }}>How NexMart Works</h3>
        <div className="flex items-start max-w-2xl mx-auto">
          {[
            { n: "1", title: "Discover", desc: "Browse products uploaded by real users", last: false },
            { n: "2", title: "Connect", desc: "Chat directly with sellers instantly for product enquiries", last: false },
            { n: "3", title: "Trade", desc: "Complete deals easily between buyers and sellers", last: true },
          ].map((step) => (
            <div key={step.n} className="flex-1 text-center px-4" style={{ position: "relative" }}>
              <div className="step-num">
                {step.n}
                {!step.last && <div className="step-line" />}
              </div>
              <p className="text-sm font-bold mb-1" style={{ color: "#0d2b22" }}>{step.title}</p>
              <p className="text-xs" style={{ color: "#4a7060", lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-10 py-16" style={{ background: "#f2faf7" }}>
        <h3 className="text-2xl font-bold mb-6 text-center" style={{ color: "#0d2b22" }}>Trending Preview</h3>
        <Suspense fallback={<p className="text-center text-gray-500">Loading trending...</p>}>
          <TrendingPreview />
        </Suspense>
      </section>

      <section className="px-10 py-16 bg-white">
        <h3 className="text-2xl font-bold text-center mb-10" style={{ color: "#0d2b22" }}>Users feedback</h3>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { name: "Aiden", role: "Seller", text: "Super easy to sell my items. I can actually found a buyer within minutes!" },
            { name: "Lucas", role: "Buyer", text: "This is way faster than other marketplaces. I love the features in this marketplace!" },
            { name: "Michelle", role: "Buyer & Seller", text: "Highly recommend to use this marketplace! It's really convenient to track my orders' details." },
          ].map((r) => (
            <div key={r.name} className="rev-card">
              <div className="text-sm mb-2" style={{ color: "#1d9e75" }}>★★★★★</div>
              <p className="text-sm mb-4" style={{ color: "#4a7060", lineHeight: 1.65, fontStyle: "italic" }}>"{r.text}"</p>
              <div className="flex items-center gap-2">
                <div className="avatar">{r.name[0]}</div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#0d2b22" }}>{r.name}</p>
                  <p style={{ fontSize: 11, color: "#4a7060" }}>{r.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grad text-center py-20">
        <h3 className="text-3xl font-bold text-white mb-3">Ready to get started?</h3>
        <p className="mb-8" style={{ color: "rgba(255,255,255,0.78)", fontSize: 14 }}>
          Join NexMart today and experience a better way to trade.
        </p>
        <Link href="/signup" className="btn-white">Join NexMart — it&apos;s free</Link>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-6 border-t text-sm" style={{ color: "#4a7060" }}>
        © 2026 NexMart. All rights reserved.
      </footer>

    </main>
  );
}