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
  User,
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
        title: "Submissions",
        href: "/admin/submissions",
        icon: GraduationCap,
      },
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

const DEVELOPER_NAV_SECTIONS: NavSection[] = [
  {
    section: "Developer Portal",
    items: [
      {
        title: "Dashboard",
        href: "/candidate/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "My Submissions",
        href: "/candidate/submissions",
        icon: GraduationCap,
      },
    ],
  },
  {
    section: "Assessment Suite",
    items: [
      {
        title: "Live Challenges",
        href: "/candidate/dashboard#assessments",
        icon: Code2,
        badge: "Sandbox",
        badgeVariant: "success",
      },
    ],
  },
  {
    section: "Account & Stack",
    items: [
      {
        title: "Profile & Tech Stack",
        href: "/candidate/settings?tab=profile",
        icon: User,
      },
      {
        title: "Password & Security",
        href: "/candidate/settings?tab=security",
        icon: Settings,
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

export function DashboardSidebar({
  role,
}: {
  role: "ADMIN" | "RECRUITER" | "DEVELOPER" | "CANDIDATE";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: userData } = useCurrentUser();
  const logoutMutation = useLogout();

  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const normalizedRole = role === "CANDIDATE" ? "DEVELOPER" : role;
  const sections =
    normalizedRole === "ADMIN"
      ? ADMIN_NAV_SECTIONS
      : normalizedRole === "RECRUITER"
        ? RECRUITER_NAV_SECTIONS
        : DEVELOPER_NAV_SECTIONS;

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
      developerProfile?: {
        name?: string;
        avatarUrl?: string;
        experienceYears?: number;
        skills?: string[];
      };
    };
    profile?: {
      name?: string;
      companyName?: string;
      avatarUrl?: string;
      experienceYears?: number;
      skills?: string[];
    };
    adminProfile?: { name?: string; avatarUrl?: string };
    recruiterProfile?: {
      name?: string;
      companyName?: string;
      avatarUrl?: string;
    };
    developerProfile?: {
      name?: string;
      avatarUrl?: string;
      experienceYears?: number;
      skills?: string[];
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
    user?.developerProfile?.name ||
    rawUser?.adminProfile?.name ||
    rawUser?.recruiterProfile?.name ||
    rawUser?.developerProfile?.name ||
    rawUser?.name ||
    user?.email?.split("@")[0] ||
    (normalizedRole === "ADMIN"
      ? "Admin"
      : normalizedRole === "RECRUITER"
        ? "Recruiter"
        : "Developer");

  const avatarUrl =
    profile?.avatarUrl ||
    user?.adminProfile?.avatarUrl ||
    user?.recruiterProfile?.avatarUrl ||
    user?.developerProfile?.avatarUrl;
  const subtitle =
    normalizedRole === "ADMIN"
      ? "Super Admin"
      : normalizedRole === "RECRUITER"
        ? profile?.companyName ||
          user?.recruiterProfile?.companyName ||
          "Hiring Team"
        : user?.developerProfile?.experienceYears ||
            rawUser?.developerProfile?.experienceYears
          ? `${user?.developerProfile?.experienceYears || rawUser?.developerProfile?.experienceYears} Yrs Exp`
          : "Candidate Account";

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  const renderNavContent = (isMobileDrawer = false) => {
    const collapsed = isMobileDrawer ? false : isCollapsed;
    return (
      <div className="flex h-full flex-col justify-between">
        {/* Brand & Collapse Header */}
        <div>
          <div
            className={cn(
              "flex h-16 items-center border-b border-border/60 transition-all",
              collapsed ? "justify-center px-2" : "justify-between px-4",
            )}
          >
            {!collapsed ? (
              <>
                <Link
                  href={
                    normalizedRole === "ADMIN"
                      ? "/admin/dashboard"
                      : normalizedRole === "RECRUITER"
                        ? "/recruiter/dashboard"
                        : "/candidate/dashboard"
                  }
                  onClick={() => {
                    if (isMobileDrawer) setIsMobileOpen(false);
                  }}
                  className="flex items-center gap-2.5 font-bold tracking-tight"
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold text-white shadow-md shadow-primary/20",
                      normalizedRole === "ADMIN"
                        ? "bg-gradient-to-tr from-violet-600 to-indigo-500"
                        : normalizedRole === "RECRUITER"
                          ? "bg-gradient-to-tr from-cyan-600 to-blue-600"
                          : "bg-gradient-to-tr from-emerald-600 to-teal-500",
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
                        normalizedRole === "ADMIN"
                          ? "text-violet-400"
                          : normalizedRole === "RECRUITER"
                            ? "text-cyan-400"
                            : "text-emerald-500 dark:text-emerald-400",
                      )}
                    >
                      {normalizedRole === "ADMIN"
                        ? "Admin Console"
                        : normalizedRole === "RECRUITER"
                          ? "Recruiter"
                          : "Candidate"}
                    </span>
                  </div>
                </Link>

                {/* Mobile Drawer Close Button or Desktop Collapse Button */}
                {isMobileDrawer ? (
                  <button
                    type="button"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    title="Close sidebar"
                  >
                    <X className="size-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCollapsed(true)}
                    className="hidden md:flex size-7 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                    title="Collapse sidebar"
                  >
                    <ChevronLeft className="size-3.5" />
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className={cn(
                  "group relative flex size-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-bold text-white shadow-md shadow-primary/20 transition-all hover:scale-105 cursor-pointer",
                  normalizedRole === "ADMIN"
                    ? "bg-gradient-to-tr from-violet-600 to-indigo-500"
                    : normalizedRole === "RECRUITER"
                      ? "bg-gradient-to-tr from-cyan-600 to-blue-600"
                      : "bg-gradient-to-tr from-emerald-600 to-teal-500",
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
                {!collapsed && (
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
                            ? normalizedRole === "ADMIN"
                              ? "bg-violet-600/15 text-violet-400 font-semibold border border-violet-500/30 shadow-xs"
                              : normalizedRole === "RECRUITER"
                                ? "bg-primary/15 text-primary font-semibold border border-primary/30 shadow-xs"
                                : "bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/30 shadow-xs"
                            : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                          collapsed && "justify-center px-2",
                        )}
                        title={collapsed ? item.title : undefined}
                      >
                        <Icon
                          className={cn(
                            "size-4 shrink-0 transition-transform group-hover:scale-110",
                            isActive
                              ? normalizedRole === "ADMIN"
                                ? "text-violet-400"
                                : normalizedRole === "RECRUITER"
                                  ? "text-primary"
                                  : "text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground",
                          )}
                        />
                        {!collapsed && (
                          <span className="flex-1 truncate">{item.title}</span>
                        )}
                        {!collapsed && item.badge && (
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
              collapsed && "justify-center p-1.5",
            )}
          >
            <Avatar className="size-8 shrink-0 border border-primary/20">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
              <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-foreground">
                  {userName}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {subtitle}
                </p>
              </div>
            )}

            {!collapsed && (
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

          {collapsed && (
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
  };

  return (
    <>
      {/* Mobile Hamburger Toggle Bar */}
      <div className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur-md md:hidden">
        <Link
          href={
            normalizedRole === "ADMIN"
              ? "/admin/dashboard"
              : normalizedRole === "RECRUITER"
                ? "/recruiter/dashboard"
                : "/candidate/dashboard"
          }
          className="flex items-center gap-2 font-bold tracking-tight"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary font-mono text-xs font-bold text-white">
            &lt;/&gt;
          </div>
          <span className="text-sm font-extrabold tracking-tight">
            DevAssess
          </span>
          <Badge variant="outline" className="text-[10px] uppercase font-bold">
            {normalizedRole}
          </Badge>
        </Link>

        <button
          type="button"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted cursor-pointer"
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
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden animate-in fade-in-0 duration-200"
          onClick={() => setIsMobileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape" || e.key === "Enter") setIsMobileOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Sidebar"
            className="fixed inset-y-0 left-0 w-72 border-r border-border bg-card shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {renderNavContent(true)}
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
        {renderNavContent(false)}
      </aside>
    </>
  );
}
