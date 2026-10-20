import { ThemeProvider } from "@/components/ThemeProvider";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  );
}
