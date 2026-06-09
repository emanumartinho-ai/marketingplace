import { Link, useLocation } from "wouter";
import { ShoppingCart, Bell, Package, PlusCircle, LogOut, LogIn, UserPlus, Globe } from "lucide-react";
import { useAuthStore } from "@/lib/auth";
import { useGetMe, useLogout, useGetCart, useListNotifications } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

export function Navbar() {
  const [location, navigate] = useLocation();
  const { token, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: me } = useGetMe({ query: { enabled: !!token } });
  const { data: cart } = useGetCart({ query: { enabled: !!token } });
  const { data: notifications } = useListNotifications({ query: { enabled: !!token } });
  const logoutMutation = useLogout();

  const cartCount = cart?.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0) ?? 0;
  const unreadCount = notifications?.filter((n: { isRead: boolean }) => !n.isRead).length ?? 0;

  const handleLogout = async () => {
    await logoutMutation.mutateAsync({});
    logout();
    queryClient.clear();
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Globe className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              Global<span className="text-primary">Market</span>
            </span>
          </motion.div>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/products">
            <Button variant={location === "/products" ? "secondary" : "ghost"} size="sm">
              Produtos
            </Button>
          </Link>

          {me && (
            <>
              <Link href="/sell">
                <Button variant={location === "/sell" ? "secondary" : "ghost"} size="sm" className="gap-1.5">
                  <PlusCircle className="w-4 h-4" />
                  Vender
                </Button>
              </Link>

              <Link href="/orders">
                <Button variant={location === "/orders" ? "secondary" : "ghost"} size="sm" className="gap-1.5">
                  <Package className="w-4 h-4" />
                  Encomendas
                </Button>
              </Link>

              <Link href="/notifications">
                <Button variant={location === "/notifications" ? "secondary" : "ghost"} size="sm" className="gap-1.5 relative">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Link href="/cart">
                <Button variant={location === "/cart" ? "secondary" : "ghost"} size="sm" className="gap-1.5 relative">
                  <ShoppingCart className="w-4 h-4" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{me.name?.split(" ")[0]}</span>
              </Button>
            </>
          )}

          {!token && (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <LogIn className="w-4 h-4" />
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="gap-1.5">
                  <UserPlus className="w-4 h-4" />
                  Registar
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
