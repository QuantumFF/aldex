import { AlbumLibrary } from "@/pages/album-library";
import { LandingPage } from "@/pages/landing-page";
import { LoadingScreen } from "@/pages/loading-screen";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { CustomUserButton } from "@/components/auth/custom-user-button";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Authenticated, AuthLoading, Unauthenticated } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

export function App() {
  // Handle OAuth callback directly in App
  if (typeof window !== "undefined" && window.location.pathname === "/sso-callback") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <AuthenticateWithRedirectCallback />
        <LoadingScreen />
      </div>
    );
  }

  return (
    <main>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <AnimatePresence mode="wait">
          <Unauthenticated key="unauth">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <LandingPage />
            </motion.div>
          </Unauthenticated>
          <Authenticated key="auth">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex flex-1 flex-col gap-4 p-8"
            >
              <AlbumLibrary>
                <CustomUserButton />
              </AlbumLibrary>
            </motion.div>
          </Authenticated>
          <AuthLoading key="loading">
            <LoadingScreen />
          </AuthLoading>
        </AnimatePresence>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </ThemeProvider>
    </main>
  );
}

export default App;
