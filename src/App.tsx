import Page from "@/app/dashboard/page";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Page />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
