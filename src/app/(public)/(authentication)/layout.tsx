"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCurrentUser } from "@/app/hooks/auth.hooks";
import { Loader2 } from "lucide-react";

export default function AuthenticationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: userData, isLoading } = useCurrentUser();

  const user = (userData?.data as any)?.user || (userData?.data as any);
  const role = user?.role;

  const isOAuthSuccess = pathname?.includes("/auth/success");

  React.useEffect(() => {
    // If user is already authenticated and visits any auth form (login, register, forgot-password)
    if (!isOAuthSuccess && !isLoading && user && role) {
      if (role === "ADMIN") {
        router.replace("/admin/dashboard");
      } else if (role === "RECRUITER") {
        router.replace("/recruiter/dashboard");
      } else {
        router.replace("/candidate/dashboard");
      }
    }
  }, [isOAuthSuccess, isLoading, user, role, router]);

  // While OAuth callback is resolving, permit direct view
  if (isOAuthSuccess) {
    return <>{children}</>;
  }

  // If already authenticated, display brief loading state while redirecting
  if (!isLoading && user && role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
