import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import PostGenerator from "./pages/PostGenerator";
import PostHistory from "./pages/PostHistory";
import Promotions from "./pages/Promotions";
import Specials from "./pages/Specials";
import Events from "./pages/Events";
import Photos from "./pages/Photos";
import BorderBoostAndBrew from "./pages/BorderBoostAndBrew";
import Menu from "./pages/Menu";
import Signage from "./pages/Signage";
import Settings from "./pages/Settings";
import SecurityLog from "./pages/SecurityLog";
import Login from "./pages/Login";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a0a00]">
        <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-t-[#D4AF37] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated && location !== "/login") {
    const returnTo = location !== "/" ? `?returnTo=${encodeURIComponent(location)}` : "";
    window.location.href = `/login${returnTo}`;
    return null;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <AuthGuard>
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
        <Route path="/border-boost-and-brew" component={BorderBoostAndBrew} />
        <Route path="/borderline-brew" component={BorderBoostAndBrew} />
        <Route path="/signage" component={Signage} />
        <Route path="/settings" component={Settings} />
        <Route path="/security" component={SecurityLog} />
        <Route path="/login" component={Login} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AuthGuard>
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
