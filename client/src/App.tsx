import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { GalleryProvider } from "@/lib/gallery-context";
import { queryClient } from "@/lib/queryClient";
import { Layout } from "@/components/layout";
import { Toaster } from "@/components/ui/toaster";
import { Home } from "@/pages/home";
import { AlbumView } from "@/pages/album";
import { Login } from "@/pages/login";
import { AdminDashboard } from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/album/:id" component={AlbumView} />
        <Route path="/login" component={Login} />
        <Route path="/admin" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <GalleryProvider>
          <Router />
          <Toaster />
        </GalleryProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
