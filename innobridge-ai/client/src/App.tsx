import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import News from "./pages/News";
import Papers from "./pages/Papers";
import Repos from "./pages/Repos";
import SearchPage from "./pages/Search";
import Blueprints from "./pages/Blueprints";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/news"} component={News} />
      <Route path={"/papers"} component={Papers} />
      <Route path={"/repos"} component={Repos} />
      <Route path={"/search"} component={SearchPage} />
      <Route path={"/blueprints"} component={Blueprints} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
