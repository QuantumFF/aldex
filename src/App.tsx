import { AlbumLibrary } from "@/components/album-library";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";

export function App() {
  return (
    <main>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Unauthenticated>
          <SignInButton />
        </Unauthenticated>
        <Authenticated>
          <div className="flex flex-1 flex-col gap-4 p-8">
            <AlbumLibrary />
          </div>
          <UserButton />
        </Authenticated>
        <AuthLoading>
          <p>Loading...</p>
        </AuthLoading>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </ThemeProvider>
    </main>
  );
}

export default App;
