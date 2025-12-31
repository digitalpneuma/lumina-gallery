import { Link, useLocation } from "wouter";
import { useTheme } from "next-themes";
import { useGallery } from "@/lib/gallery-context";
import { Button } from "@/components/ui/button";
import { LogOut, Shield, Moon, Sun } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAdmin, logout } = useGallery();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-navy-gradient backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 group">
              <img src="/logo.png" alt="Logo" className="h-6 w-6 object-contain group-hover:opacity-80 transition-opacity" />
              <span className="font-serif text-xl font-semibold tracking-tight text-white">Photo Gallery</span>
            </a>
          </Link>

          <nav className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-white hover:text-blush hover:bg-white/10"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {isAdmin ? (
              <div className="flex items-center gap-4">
                <Link href="/admin">
                  <a className={`text-sm font-medium transition-colors hover:text-blush ${location === '/admin' ? 'text-blush' : 'text-white/80'}`}>
                    Dashboard
                  </a>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-white hover:text-blush hover:bg-white/10">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <a className="text-sm text-white/80 hover:text-blush transition-colors flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </a>
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-500">
        {children}
      </main>

      <footer className="border-t py-8 mt-auto bg-[#5d5e5e]">
        <div className="container mx-auto px-4 text-center text-sm font-light">
          <p className="text-white/80">© {new Date().getFullYear()} Photo Gallery. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
