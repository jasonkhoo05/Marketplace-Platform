// components/layout/Header.tsx
export default function Header() {
    return (
      <header className="flex items-center justify-between border-b bg-white px-10 py-4">
        <h1 className="text-2xl font-bold">NexMart</h1>
  
        <input
          placeholder="Search for products..."
          className="w-[420px] rounded-full border px-5 py-3"
        />
  
        <div className="flex items-center gap-5">
          <span>Sign In</span>
          <button className="rounded-full bg-teal-700 px-6 py-2 text-white">
            Sign Up
          </button>
        </div>
      </header>
    );
  }