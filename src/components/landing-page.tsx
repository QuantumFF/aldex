import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/clerk-react";
import { Disc3 } from "lucide-react";

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Disc3 className="h-6 w-6" />
          <span>Aldex</span>
        </div>
        <nav>
          <SignInButton mode="modal">
            <Button variant="ghost">Sign In</Button>
          </SignInButton>
        </nav>
      </header>
      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center gap-8 py-24 text-center md:py-32">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Your Personal <span className="text-primary">Album Library</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Track your collection, manage your wishlist, and rediscover your
              favorite music. Built for album lovers.
            </p>
          </div>
          <div className="flex gap-4">
            <SignInButton mode="modal">
              <Button size="lg" className="h-12 px-8 text-lg">
                Get Started
              </Button>
            </SignInButton>
          </div>
        </section>

        <section className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-3 md:py-24">
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 text-xl font-semibold">
              Track Your Collection
            </h3>
            <p className="text-muted-foreground">
              Keep track of every album you own, your listening progress, and
              your ratings.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 text-xl font-semibold">Manage Wishlist</h3>
            <p className="text-muted-foreground">
              Never forget an album you want to listen to. Add it to your
              wishlist for later.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <h3 className="mb-2 text-xl font-semibold">Discover & Organize</h3>
            <p className="text-muted-foreground">
              Filter by genre, artist, or release year. Keep your music life
              organized.
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Aldex. All rights reserved.</p>
      </footer>
    </div>
  );
}
