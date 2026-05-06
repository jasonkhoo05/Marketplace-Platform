import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { productFromRow, type ProductRow } from "@/lib/products";
import { hasEnvVars } from "@/lib/utils";
import { Suspense } from "react";

async function TrendingPreview() {
  let trending: { id: number; name: string; price: number; image: string }[] =
    [];

  if (hasEnvVars) {
    const supabase = await createClient();
    const { data: rows } = await supabase
      .from("product")
      .select(`
        prod_id,
        prod_name,
        prod_price,
        prod_stock_qty,
        prod_rating,
        prod_sold_qty,
        prod_image,
        product_category_type!prod_prod_cat_fk(prod_cat_name),
        user!fk_product_seller(username)
      `)
      .order("prod_sold_qty", { ascending: false })
      .limit(4);

    trending =
      (rows as ProductRow[] | null)?.map((r) => {
        const p = productFromRow(r);
        return { id: p.id, name: p.name, price: p.price, image: p.image };
      }) ?? [];
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {trending.length === 0 ? (
        <p className="col-span-full text-center text-gray-500">
          {hasEnvVars
            ? "No products yet. Add rows in Supabase or run the migration SQL."
            : "Configure Supabase in .env.local to load trending products."}
        </p>
      ) : (
        trending.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.id}`}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition block"
          >
            <img
              src={item.image}
              alt={item.name}
              className="h-80 w-full object-cover rounded mb-3"
            />

            <p className="font-medium">{item.name}</p>

            <p className="text-sm text-gray-500">${item.price}</p>
          </Link>
        ))
      )}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-between w-full">

      <nav className="flex justify-between items-center px-8 py-4 border-b">
        <h1 className="text-xl font-bold leading-none">NexMart</h1>
        <div className="flex gap-4 items-center">
          <Link
            href="/auth/login"
            className="px-4 py-2 flex items-center justify-center"
          >
            Login
          </Link>

          <Link
            href="/auth/sign-up"
            className="px-4 py-2 flex items-center justify-center bg-primary text-white rounded-lg"
          >
            Sign Up
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center text-center px-6 py-24 flex-1">
        <h2 className="text-4xl font-bold mb-4">
          Buy and sell anything in minutes - without middlemen or complicated steps
        </h2>
        <p className="text-gray-500 max-w-xl mb-6">
          NexMart connects buyers and sellers in one seamless platform -
          making transactions faster, safer, and more efficient than ever.
        </p>

        <div className="flex gap-2">
          <Link
            href="/auth/sign-up"
            className="bg-primary text-white px-6 py-3 rounded-lg"
          >
            Get Started
          </Link>

          <Link
            href="/auth/login"
            className="border px-6 py-3 rounded-lg"
          >
            Login
          </Link>
        </div>
      </section>

      <section className="px-10 py-16 bg-muted">
        <h3 className="text-2xl font-bold text-center mb-10">
          Why choose NexMart
        </h3>

        <div className="grid gap-6 md:grid-cols-3">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <h4 className="font-semibold text-lg mb-2">Easy to Use</h4>
            <p className="text-gray-500">
              A simple and intuitive platform designed for both buyers and sellers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <h4 className="font-semibold text-lg mb-2">Secure Transactions</h4>
            <p className="text-gray-500">
              Your payments and data are protected with modern security systems.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition">
            <h4 className="font-semibold text-lg mb-2">Fast & Scalable</h4>
            <p className="text-gray-500">
              Experience fast performance whether you're buying or selling.
            </p>
          </div>

        </div>
      </section>

      <section className="px-10 py-12">
      <div className="flex items-center justify-center gap-6 md:gap-10 text-center">

        <div className="flex flex-col gap-1">
          <p className="text-3xl font-bold">10K+</p>
          <p className="text-sm text-muted-foreground">Active Users</p>
        </div>

        <Separator orientation="vertical" className="hidden md:block h-12" />

        <div className="flex flex-col gap-1">
          <p className="text-3xl font-bold">5K+</p>
          <p className="text-sm text-muted-foreground">Products Listed</p>
        </div>

        <Separator orientation="vertical" className="hidden md:block h-12" />

        <div className="flex flex-col gap-1">
          <p className="text-3xl font-bold">99%</p>
          <p className="text-sm text-muted-foreground">User Satisfaction</p>
        </div>
      </div>
    </section>

      <section className="px-10 py-16">
        <h3 className="text-2xl font-bold mb-6 text-center">
          Trending Preview
        </h3>

        <Suspense
          fallback={
            <p className="text-center text-gray-500">Loading trending...</p>
          }
        >
          <TrendingPreview />
        </Suspense>
      </section>

      <section className="px-3 py-15 text-center">
        <h3 className="text-2xl font-bold mb-10">How NexMart Works</h3>

        <div className="grid md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
          
          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
            <p className="text-sm text-gray-400 mb-2">Step 1</p>
            <p className="font-semibold mb-2">Discover</p>
            <p className="text-gray-600">
              Browse products uploaded by real users
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
            <p className="text-sm text-gray-400 mb-2">Step 2</p>
            <p className="font-semibold mb-2">Connect</p>
            <p className="text-gray-600">
              Chat directly with sellers instantly for product enquiries
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
            <p className="text-sm text-gray-400 mb-2">Step 3</p>
            <p className="font-semibold mb-2">Trade</p>
            <p className="text-gray-600">
              Complete deals easily between buyers and sellers
            </p>
          </div>
        </div>
      </section>

      <section className="px-3 py-16 text-center mb-10">
        <h3 className="text-2xl font-bold mb-10">Users feedback</h3>

        <div className="grid md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
          
          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
            <p className="text-gray-600 mb-3"> "Super easy to sell my items. I can actually found a buyer within minutes!" </p> 
            <p className="font-semibold">- Aiden</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
            <p className="text-gray-600 mb-3"> "This is way faster than other marketplaces. I love the features in this marketplace!" </p> 
            <p className="font-semibold">- Lucas</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition">
            <p className="text-gray-600 mb-3"> "Highly recommend to use this marketplace! It's really convenient to track my orders' details." </p> 
            <p className="font-semibold">- Michelle</p>
          </div>
        </div>
      </section>

      <section className="text-center py-20 bg-muted">
        <h3 className="text-3xl font-bold">
          Ready to get started?
        </h3>
        <p className="text-gray-600 mb-6">
          Join NexMart today and experience a better way to trade.
        </p>
      </section>

      <footer className="text-center py-6 border-t text-sm text-gray-500">
        © 2026 NexMart. All rights reserved.
      </footer>

    </main>
  );
}
