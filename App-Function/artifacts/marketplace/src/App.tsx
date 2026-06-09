import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import About from "@/pages/about";
import NotFound from "@/pages/not-found";
import Vender from "@/pages/vender";
import Dashboard from "@/pages/dashboard";
import OrderDetail from "@/pages/order-detail";
import Admin from "@/pages/admin";
import Pending from "@/pages/pending";

import { useAuth } from "@workspace/replit-auth-web";
import { useGetMe } from "@workspace/api-client-react";

const queryClient = new QueryClient();

function LoginRedirect() {
  const { login } = useAuth();
  useEffect(() => {
    login();
  }, [login]);
  return null;
}

function ProtectedRoute({ component: Component, requireApproval = true, adminOnly = false }: any) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: userProfile, isLoading: profileLoading } = useGetMe({
    query: { enabled: isAuthenticated },
  });
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    } else if (!authLoading && !profileLoading && isAuthenticated) {
      if (adminOnly && userProfile?.role !== "admin") {
        setLocation("/");
      } else if (requireApproval && !userProfile?.approved && userProfile?.role !== "admin") {
        setLocation("/pending");
      }
    }
  }, [authLoading, isAuthenticated, profileLoading, userProfile, setLocation, requireApproval, adminOnly]);

  if (authLoading || (isAuthenticated && profileLoading)) {
    return <div className="p-8 text-center text-muted-foreground">A carregar...</div>;
  }

  if (!isAuthenticated) return null;
  if (adminOnly && userProfile?.role !== "admin") return null;
  if (requireApproval && !userProfile?.approved && userProfile?.role !== "admin") return null;

  return <Component />;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/products" component={Products} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/about" component={About} />
        <Route path="/login" component={LoginRedirect} />
        <Route path="/pending">
          <ProtectedRoute component={Pending} requireApproval={false} />
        </Route>
        <Route path="/vender">
          <ProtectedRoute component={Vender} />
        </Route>
        <Route path="/dashboard">
          <ProtectedRoute component={Dashboard} />
        </Route>
        <Route path="/orders/:id">
          <ProtectedRoute component={OrderDetail} />
        </Route>
        <Route path="/admin">
          <ProtectedRoute component={Admin} adminOnly={true} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
