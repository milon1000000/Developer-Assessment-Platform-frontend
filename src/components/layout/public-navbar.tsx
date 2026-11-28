"use client";

import {
  Code2,
  Info,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { useCurrentUser, useLogout } from "@/app/hooks/auth.hooks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: currentUserData, isLoading: isUserLoading } = useCurrentUser();
  const logoutMutation = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const rawUser = currentUserData?.data as {
    user?: {
      email?: string;
      role?: string;
    };
    role?: string;
    email?: string;
  } | null;

  const user = rawUser?.user || rawUser;
  const isAuthenticated = !isUserLoading && !!(user?.email || rawUser?.email);
  const role = user?.role || rawUser?.role;

  const dashboardHref =
    role === "ADMIN"
      ? "/admin/dashboard"
      : role === "RECRUITER"
        ? "/recruiter/dashboard"
        : "/candidate/dashboard";

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out successfully", {
        description: "You have been signed out of your account.",
      });
      setMobileMenuOpen(false);
      router.push("/login");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-2.5 transition-opacity hover:opacity-90 min-w-0"
        >
          <div className="flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/25">
            <Code2 className="size-4 sm:size-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm sm:text-base font-bold tracking-tight text-foreground flex items-center gap-1.5">
              DevAssess
              <span className="rounded-sm bg-primary/15 px-1.5 py-0.2 text-[10px] font-semibold text-primary shrink-0">
                PRO
              </span>
            </span>
            <span className="text-[10px] text-muted-foreground font-medium -mt-0.5 truncate">
              Developer Assessment Platform
            </span>
          </div>
        </Link>

        {/* Simple Flat Desktop Navigation */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm transition-colors py-1 border-b-2",
                  isActive
                    ? "border-primary text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground font-medium",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <Badge
            variant="brand"
            className="hidden lg:inline-flex py-1 px-3 gap-1.5"
          >
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Anti-Cheat Engine Active
          </Badge>

          <ThemeToggle />

          {/* Desktop Auth Controls */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link href={dashboardHref}>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 gap-1.5 px-3 text-xs font-semibold shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer transition-all hover:scale-[1.02]"
                    title="Go to Dashboard"
                  >
                    <LayoutDashboard className="size-3.5" />
                    <span>Dashboard</span>
                  </Button>
                </Link>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="h-8 gap-1.5 px-3 text-xs font-semibold border-border/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors cursor-pointer"
                  title="Log out from DevAssess"
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <LogOut className="size-3.5" />
                  )}
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button
                  type="button"
                  size="sm"
                  className="h-8 gap-1.5 px-3 text-xs font-semibold shadow-xs cursor-pointer"
                  title="Sign in to your account"
                >
                  <LogIn className="size-3.5" />
                  <span>Login</span>
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="size-8 md:hidden border-border/80 cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Simple Mobile Navigation Links */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-md px-4 py-3 space-y-1">
          {NAV_LINKS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground font-medium",
                )}
              >
                {item.href === "/" && <Code2 className="size-4" />}
                {item.href === "/about" && <Info className="size-4" />}
                {item.href === "/contact" && <Mail className="size-4" />}
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-border/40 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    type="button"
                    size="sm"
                    className="w-full h-9 justify-start gap-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                  >
                    <LayoutDashboard className="size-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full h-9 justify-start gap-2 text-xs font-semibold border-border/80 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 cursor-pointer"
                >
                  {logoutMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4" />
                  )}
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  type="button"
                  size="sm"
                  className="w-full h-9 justify-start gap-2 text-xs font-semibold cursor-pointer"
                >
                  <LogIn className="size-4" />
                  <span>Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
