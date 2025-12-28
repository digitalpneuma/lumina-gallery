import { Link, useLocation } from "wouter";
import { useGallery } from "@/lib/gallery-context";
import { Button } from "@/components/ui/button";
import { Camera, LogOut, Shield } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAdmin, logout } = useGallery();
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 group">
              <Camera className="h-6 w-6 stroke-[1.5] group-hover:stroke-primary transition-colors" />
              <span className="font-serif text-xl font-semibold tracking-tight">Lumina Gallery</span>
            </a>
          </Link>

          <nav className="flex items-center gap-4">
            {isAdmin ? (
              <div className="flex items-center gap-4">
                <Link href="/admin">
                  <a className={`text-sm font-medium transition-colors hover:text-primary ${location === '/admin' ? 'text-primary' : 'text-muted-foreground'}`}>
                    Dashboard
                  </a>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <a className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
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

      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground font-light">
          <p>© {new Date().getFullYear()} Lumina Gallery. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
