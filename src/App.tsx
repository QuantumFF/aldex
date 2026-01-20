import { AlbumLibrary } from "@/components/album-library";
import { LandingPage } from "@/components/landing-page";
import { LoadingScreen } from "@/components/loading-screen";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { UserButton } from "@clerk/clerk-react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

export function App() {
  return (
    <main>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Unauthenticated>
          <LandingPage />
        </Unauthenticated>
        <Authenticated>
          <div className="flex flex-1 flex-col gap-4 p-8">
            <AlbumLibrary>
              <UserButton />
            </AlbumLibrary>
          </div>
        </Authenticated>
        <AuthLoading>
          <LoadingScreen />
        </AuthLoading>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </ThemeProvider>
    </main>
  );
}

export default App;
