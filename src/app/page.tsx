import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Shield, Users } from "lucide-react";

export default function Home() {
  return (
    <AuthShell
      title="Developer Assessment Gateway"
      subtitle="Select an option below to enter the platform or take a test"
      badgeText="Automated Technical Screening"
    >
      <Card className="border-border/70 bg-card/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-xl font-bold">Get Started</CardTitle>
          <CardDescription className="text-xs">
            Access your developer assessment environment or recruit talent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3.5">
          <Link href="/login" className="block">
            <Button className="w-full h-11 font-semibold text-sm shadow-md shadow-primary/20 flex items-center justify-between px-4">
              <span className="flex items-center gap-2">
                <Code2 className="size-4" />
                Sign In to Platform
              </span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>

          <Link href="/register" className="block">
            <Button
              variant="outline"
              className="w-full h-11 font-semibold text-sm border-border/80 hover:bg-muted flex items-center justify-between px-4"
            >
              <span className="flex items-center gap-2">
                <Users className="size-4" />
                Create New Account
              </span>
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
