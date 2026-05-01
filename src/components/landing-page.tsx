import { Button } from "@/components/ui/button";
import { Disc3 } from "lucide-react";
import * as React from "react";
import { AuthModal } from "./auth/auth-modal";

export function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<"signin" | "signup">("signin");

  const openSignIn = () => {
    setAuthMode("signin");
    setAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthMode("signup");
    setAuthModalOpen(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
      <AuthModal 
        isOpen={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        defaultMode={authMode} 
      />

      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <header className="flex h-16 items-center justify-between px-6 lg:px-12 relative z-10">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Disc3 className="h-6 w-6" />
          <span>Aldex</span>
        </div>
        <nav>
          <Button onClick={openSignIn} variant="ghost" className="font-medium tracking-tight">Sign In</Button>
        </nav>
      </header>
      
      <main className="flex-1 relative z-10 flex flex-col justify-center">
        <section className="container mx-auto flex flex-col items-center justify-center gap-10 py-24 text-center md:py-32">
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl tracking-tight leading-[0.9]">
              Curate your <br className="hidden sm:block" />
              <span className="text-muted-foreground italic font-light">personal</span> archive.
            </h1>
            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl font-sans font-light leading-relaxed">
              A meticulously designed space to track your collection, manage your backlog, and redisover the albums you love.
            </p>
          </div>
          <div className="flex gap-4 pt-4">
            <Button onClick={openSignUp} size="lg" className="h-14 px-10 text-lg rounded-full font-serif font-bold tracking-wide hover:scale-105 transition-transform">
              Start Tracking
            </Button>
          </div>
        </section>

        <section className="container mx-auto grid gap-12 px-4 py-16 md:grid-cols-3 md:py-32 border-t border-border/50">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <Disc3 className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-serif tracking-tight">
              Track the Collection
            </h3>
            <p className="text-muted-foreground font-sans font-light leading-relaxed max-w-sm">
              Keep a record of every album you own, your listening progress, and
              your honest ratings.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
            </div>
            <h3 className="text-2xl font-serif tracking-tight">Manage the Backlog</h3>
            <p className="text-muted-foreground font-sans font-light leading-relaxed max-w-sm">
              Never forget an album you want to hear. Add it to your
              wishlist and bring it into your rotation.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            </div>
            <h3 className="text-2xl font-serif tracking-tight">Beautifully Organized</h3>
            <p className="text-muted-foreground font-sans font-light leading-relaxed max-w-sm">
              Filter by status, search by artist, and view your music life in a pristine, minimalist grid.
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground font-sans z-10 bg-background">
        <p>&copy; {new Date().getFullYear()} Aldex. A space for albums.</p>
      </footer>
    </div>
  );
}
