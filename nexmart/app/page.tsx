import Link from "next/link";
import { Separator } from "@/components/ui/separator"

export default function Home() {

  return (
    <main className="min-h-screen flex flex-col justify-between w-full">

      <nav className="flex justify-between items-center px-8 py-4 border-b">
        <h1 className="text-xl font-bold leading-none">NexMart</h1>
        <div className="flex gap-4 items-center">
          <Link
            href="/login/buyer"
            className="px-4 py-2 flex items-center justify-center"
          >
            Login
          </Link>

          <Link
            href="/signup"
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
            href="/signup"
            className="bg-primary text-white px-6 py-3 rounded-lg"
          >
            Get Started
          </Link>

          <Link
            href="/login/buyer"
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

      <footer className="text-center py-6 border-t text-sm text-gray-500">
        © 2026 NexMart. All rights reserved.
      </footer>

    </main>
  );
}
