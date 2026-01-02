import { AlbumLibrary } from "@/components/album-library";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex flex-1 flex-col gap-4 p-8">
        <AlbumLibrary />
      </div>
      <Toaster />
      <Analytics />
      <SpeedInsights />
    </ThemeProvider>
  );
}

export default App;
