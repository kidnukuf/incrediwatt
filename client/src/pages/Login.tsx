import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Eye, EyeOff, Lock, User, ShieldCheck } from "lucide-react";

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.loginWithPassword.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get("returnTo") || "/";
      window.location.href = returnTo;
    },
    onError: (err) => {
      setError(err.message || "Invalid username or password");
      // Reset CAPTCHA on error so user must complete it again
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
      setTurnstileToken(null);
    },
  });

  const renderTurnstile = useCallback(() => {
    if (!turnstileContainerRef.current || !window.turnstile || !TURNSTILE_SITE_KEY) return;
    // Clean up any existing widget
    if (widgetIdRef.current) {
      try { window.turnstile.remove(widgetIdRef.current); } catch {}
    }
    widgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "dark",
      callback: (token: string) => {
        setTurnstileToken(token);
      },
      "expired-callback": () => {
        setTurnstileToken(null);
      },
      "error-callback": () => {
        setTurnstileToken(null);
      },
    });
    setTurnstileReady(true);
  }, []);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) {
      // No site key configured — skip CAPTCHA (dev mode)
      setTurnstileReady(true);
      setTurnstileToken("dev-bypass");
      return;
    }

    // If Turnstile is already loaded, render immediately
    if (window.turnstile) {
      renderTurnstile();
      return;
    }

    // Otherwise load the script
    window.onTurnstileLoad = renderTurnstile;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      window.onTurnstileLoad = undefined;
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch {}
      }
    };
  }, [renderTurnstile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }
    if (!turnstileToken) {
      setError("Please complete the security check");
      return;
    }
    loginMutation.mutate({ username: username.trim(), password, turnstileToken });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a0a00] via-[#2d1200] to-[#1a0a00] p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      <div className="relative w-full max-w-md">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37]/30 mb-4">
            <span className="text-4xl">🌮</span>
          </div>
          <h1 className="text-3xl font-black text-[#D4AF37] tracking-wide">SOPRIS™</h1>
          <p className="text-white/60 text-sm mt-1">Social Media Manager</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-px w-16 bg-[#D4AF37]/30" />
            <span className="text-[#D4AF37]/50 text-xs">JACKPOT, NEVADA</span>
            <div className="h-px w-16 bg-[#D4AF37]/30" />
          </div>
        </div>

        {/* Login card */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm shadow-2xl">
          <CardHeader className="pb-2 pt-6 px-6">
            <h2 className="text-lg font-semibold text-white text-center">Sign in to continue</h2>
            <p className="text-white/50 text-sm text-center">Enter your credentials to access the dashboard</p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-white/80 text-sm">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-[#D4AF37]/60 focus:ring-[#D4AF37]/20"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-white/80 text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-[#D4AF37]/60 focus:ring-[#D4AF37]/20"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Turnstile CAPTCHA */}
              {TURNSTILE_SITE_KEY && (
                <div className="flex flex-col items-center gap-2">
                  <div ref={turnstileContainerRef} className="cf-turnstile" />
                  {turnstileToken && (
                    <div className="flex items-center gap-1.5 text-green-400/80 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Security check passed</span>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2.5">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loginMutation.isPending || !turnstileReady || (!turnstileToken && !!TURNSTILE_SITE_KEY)}
                className="w-full bg-[#D4AF37] hover:bg-[#B8962E] text-black font-bold h-11 text-base shadow-lg hover:shadow-[#D4AF37]/20 transition-all mt-2 disabled:opacity-50"
              >
                {loginMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : !turnstileReady ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Loading security check...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-white/30 text-xs mt-6">
          © {new Date().getFullYear()} Sopris Taqueria · 4 Jacks Casino, Jackpot NV
        </p>
      </div>
    </div>
  );
}
