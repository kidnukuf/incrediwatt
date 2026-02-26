import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import PostGenerator from "./pages/PostGenerator";
import PostHistory from "./pages/PostHistory";
import Promotions from "./pages/Promotions";
import Specials from "./pages/Specials";
import Events from "./pages/Events";
import Photos from "./pages/Photos";
import BorderlineBrew from "./pages/BorderlineBrew";
import Menu from "./pages/Menu";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/calendar" component={Calendar} />
      <Route path="/generate" component={PostGenerator} />
      <Route path="/history" component={PostHistory} />
      <Route path="/promotions" component={Promotions} />
      <Route path="/specials" component={Specials} />
      <Route path="/events" component={Events} />
      <Route path="/photos" component={Photos} />
      <Route path="/menu" component={Menu} />
      <Route path="/borderline-brew" component={BorderlineBrew} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
