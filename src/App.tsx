import { AlbumLibrary } from "@/components/album-library";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex flex-1 flex-col gap-4 p-8">
        <AlbumLibrary />
      </div>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
