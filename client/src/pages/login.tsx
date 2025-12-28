import { useState } from "react";
import { useLocation } from "wouter";
import { useGallery } from "@/lib/gallery-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Login() {
  const [password, setPassword] = useState("");
  const { login, isAdmin } = useGallery();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  if (isAdmin) {
    setLocation("/admin");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (success) {
      toast({ title: "Welcome back", description: "You are now logged in as admin." });
      setLocation("/admin");
    } else {
      toast({ title: "Access Denied", description: "Incorrect password.", variant: "destructive" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto bg-primary/5 p-3 rounded-full w-fit mb-2">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-serif">Admin Access</CardTitle>
          <CardDescription>Enter password to manage gallery</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password (try 'admin')"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-center tracking-widest"
              />
            </div>
            <Button type="submit" className="w-full">
              Unlock
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
