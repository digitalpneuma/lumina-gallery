import { Switch, Route } from "wouter";
import { GalleryProvider } from "@/lib/gallery-context";
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
    <GalleryProvider>
      <Router />
      <Toaster />
    </GalleryProvider>
  );
}

export default App;
