import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Code2, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm mb-4">
        <Code2 className="size-7" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        404
      </h1>
      <h2 className="mt-2 text-lg font-semibold text-foreground">
        Page Not Found
      </h2>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm">
        The assessment or page you are looking for does not exist or has been
        moved.
      </p>
      <div className="mt-6">
        <Link href="/login">
          <Button className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back to Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}
