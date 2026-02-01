import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Header() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b bg-background">
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu />
      </Button>

      <h1 className="font-semibold text-lg">Dashboard</h1>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDark(!dark)}
      >
        {dark ? <Sun /> : <Moon />}
      </Button>
    </header>
  );
}
