import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="relative z-10 w-full border-t border-border/40 bg-background/50 py-4 text-center text-xs text-muted-foreground backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} DevAssess Inc. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:underline hover:text-foreground">
            Home
          </Link>
          <Link href="/about" className="hover:underline hover:text-foreground">
            About
          </Link>
          <Link
            href="/contact"
            className="hover:underline hover:text-foreground"
          >
            Contact
          </Link>
          <Link href="/login" className="hover:underline hover:text-foreground">
            Sign In
          </Link>
        </div>
      </div>
    </footer>
  );
}
