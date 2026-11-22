"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser, useLogout } from "@/app/hooks/auth.hooks";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Building2,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  ShieldAlert,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeVariant?: "default" | "secondary" | "outline" | "success";
}

export interface NavSection {
  section: string;
  items: NavItem[];
}

const ADMIN_NAV_SECTIONS: NavSection[] = [
  {
    section: "Core",
    items: [
      {
        title: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Question Bank",
        href: "/admin/questions",
        icon: Code2,
        badge: "Active",
        badgeVariant: "success",
      },
      {
        title: "Assessments",
        href: "/admin/assessments",
        icon: FileCheck2,
      },
    ],
  },
  {
    section: "Management",
    items: [
      {
        title: "User Directory",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Audit Logs",
        href: "/admin/audit-logs",
        icon: ShieldAlert,
      },
    ],
  },
  {
    section: "Config",
    items: [
      {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

const RECRUITER_NAV_SECTIONS: NavSection[] = [
  {
    section: "Hiring Suite",
    items: [
      {
        title: "Dashboard",
        href: "/recruiter/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Assessments",
        href: "/recruiter/assessments",
        icon: FileCheck2,
      },
      {
        title: "Question Library",
        href: "/recruiter/questions",
        icon: BookOpen,
      },
    ],
  },
  {
    section: "Candidates",
    items: [
      {
        title: "Candidate Invites",
        href: "/recruiter/invites",
        icon: Mail,
      },
      {
        title: "Submissions & Grading",
        href: "/recruiter/submissions",
        icon: GraduationCap,
      },
    ],
  },
  {
    section: "Organization",
    items: [
      {
        title: "Company Settings",
        href: "/recruiter/settings",
        icon: Building2,
      },
    ],
  },
];

function getInitials(name?: string) {
  if (!name) return "U";
  const clean = name.replace(/[^\w\s]/gi, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function DashboardSidebar({ role }: { role: "ADMIN" | "RECRUITER" }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: userData } = useCurrentUser();
  const logoutMutation = useLogout();

  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const sections =
    role === "ADMIN" ? ADMIN_NAV_SECTIONS : RECRUITER_NAV_SECTIONS;

  const rawUser = userData?.data as {
    user?: {
      email?: string;
      role?: string;
      name?: string;
      adminProfile?: { name?: string; avatarUrl?: string };
      recruiterProfile?: {
        name?: string;
        companyName?: string;
        avatarUrl?: string;
      };
    };
    profile?: {
      name?: string;
      companyName?: string;
      avatarUrl?: string;
    };
    adminProfile?: { name?: string; avatarUrl?: string };
    recruiterProfile?: {
      name?: string;
      companyName?: string;
      avatarUrl?: string;
    };
    name?: string;
    email?: string;
    role?: string;
  } | null;

  const profile = rawUser?.profile;
  const user = rawUser?.user || rawUser;
  const userName =
    profile?.name ||
    user?.adminProfile?.name ||
    user?.recruiterProfile?.name ||
    rawUser?.adminProfile?.name ||
    rawUser?.recruiterProfile?.name ||
    rawUser?.name ||
    user?.email?.split("@")[0] ||
    (role === "ADMIN" ? "Admin" : "Recruiter");

  const avatarUrl =
    profile?.avatarUrl ||
    user?.adminProfile?.avatarUrl ||
    user?.recruiterProfile?.avatarUrl;
  const subtitle =
    role === "ADMIN"
      ? "Super Admin"
      : profile?.companyName ||
        user?.recruiterProfile?.companyName ||
        "Hiring Team";

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      {/* Brand & Collapse Header */}
      <div>
        <div
          className={cn(
            "flex h-16 items-center border-b border-border/60 transition-all",
            isCollapsed ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          {!isCollapsed ? (
            <>
              <Link
                href={
                  role === "ADMIN" ? "/admin/dashboard" : "/recruiter/dashboard"
                }
                className="flex items-center gap-2.5 font-bold tracking-tight"
              >
                <div
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold text-white shadow-md shadow-primary/20",
                    role === "ADMIN"
                      ? "bg-gradient-to-tr from-violet-600 to-indigo-500"
                      : "bg-gradient-to-tr from-cyan-600 to-blue-600",
                  )}
                >
                  &lt;/&gt;
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-extrabold tracking-tight">
                    DevAssess
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-bold tracking-wider uppercase",
                      role === "ADMIN" ? "text-violet-400" : "text-cyan-400",
                    )}
                  >
                    {role === "ADMIN" ? "Admin Console" : "Recruiter"}
                  </span>
                </div>
              </Link>

              {/* Single collapse button */}
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="hidden md:flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Collapse sidebar"
              >
                <ChevronLeft className="size-3.5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className={cn(
                "group relative flex size-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold text-white shadow-md shadow-primary/20 transition-all hover:scale-105 cursor-pointer",
                role === "ADMIN"
                  ? "bg-gradient-to-tr from-violet-600 to-indigo-500"
                  : "bg-gradient-to-tr from-cyan-600 to-blue-600",
              )}
              title="Click to expand sidebar"
            >
              <span className="group-hover:hidden">&lt;/&gt;</span>
              <ChevronRight className="hidden size-4 group-hover:block transition-transform" />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <div className="space-y-6 px-3 py-4">
          {sections.map((sec) => (
            <div key={sec.section} className="space-y-1.5">
              {!isCollapsed && (
                <p className="px-2.5 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                  {sec.section}
                </p>
              )}
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    pathname?.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-all",
                        isActive
                          ? role === "ADMIN"
                            ? "bg-violet-600/15 text-violet-400 font-semibold border border-violet-500/30 shadow-xs"
                            : "bg-primary/15 text-primary font-semibold border border-primary/30 shadow-xs"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                        isCollapsed && "justify-center px-2",
                      )}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <Icon
                        className={cn(
                          "size-4 shrink-0 transition-transform group-hover:scale-110",
                          isActive
                            ? role === "ADMIN"
                              ? "text-violet-400"
                              : "text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                      {!isCollapsed && (
                        <span className="flex-1 truncate">{item.title}</span>
                      )}
                      {!isCollapsed && item.badge && (
                        <Badge
                          variant={
                            item.badgeVariant === "success"
                              ? "default"
                              : "secondary"
                          }
                          className="h-4 px-1.5 text-[10px] uppercase font-bold"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer User Profile & Actions */}
      <div className="border-t border-border/60 p-3 space-y-2">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-xl border border-border/50 bg-card/60 p-2",
            isCollapsed && "justify-center p-1.5",
          )}
        >
          <Avatar className="size-8 shrink-0 border border-primary/20">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
            <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-foreground">
                {userName}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {subtitle}
              </p>
            </div>
          )}

          {!isCollapsed && (
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="Logout"
              >
                <LogOut className="size-3.5" />
              </Button>
            </div>
          )}
        </div>

        {isCollapsed && (
          <div className="flex flex-col items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Logout"
            >
              <LogOut className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Toggle Bar */}
      <div className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-border/60 bg-background/90 px-4 backdrop-blur-md md:hidden">
        <Link
          href={role === "ADMIN" ? "/admin/dashboard" : "/recruiter/dashboard"}
          className="flex items-center gap-2 font-bold tracking-tight"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary font-mono text-xs font-bold text-white">
            &lt;/&gt;
          </div>
          <span className="text-sm font-extrabold tracking-tight">
            DevAssess
          </span>
          <Badge variant="outline" className="text-[10px] uppercase font-bold">
            {role}
          </Badge>
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted"
        >
          {isMobileOpen ? (
            <X className="size-4" />
          ) : (
            <Menu className="size-4" />
          )}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close mobile sidebar backdrop"
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") setIsMobileOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Sidebar"
            className="fixed inset-y-0 left-0 w-72 border-r border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          "hidden md:block sticky top-0 h-screen shrink-0 border-r border-border/60 bg-card/40 backdrop-blur-md transition-all duration-300 z-30",
          isCollapsed ? "w-18" : "w-64",
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
