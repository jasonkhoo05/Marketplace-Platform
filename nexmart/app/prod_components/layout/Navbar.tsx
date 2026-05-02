type NavbarProps = {
    categories: string[];
    onSelect: (category: string) => void;
  };
  
  export default function Navbar({ categories, onSelect }: NavbarProps) {
    return (
      <nav className="flex gap-10 border-b bg-white px-16 py-4">
        {categories.map((category) => (
          <button key={category} onClick={() => onSelect(category)}>
            {category}
          </button>
        ))}
      </nav>
    );
  }