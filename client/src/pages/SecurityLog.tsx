import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Ban, CheckCircle, Activity, Globe, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const EVENT_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  failed_login: { label: "Failed Login", color: "bg-red-500/15 text-red-400 border-red-500/30", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  ip_lockout: { label: "IP Locked Out", color: "bg-orange-500/15 text-orange-400 border-orange-500/30", icon: <Ban className="w-3.5 h-3.5" /> },
  captcha_failed: { label: "CAPTCHA Failed", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30", icon: <Shield className="w-3.5 h-3.5" /> },
  api_probe_blocked: { label: "API Probe Blocked", color: "bg-purple-500/15 text-purple-400 border-purple-500/30", icon: <Ban className="w-3.5 h-3.5" /> },
  successful_login: { label: "Successful Login", color: "bg-green-500/15 text-green-400 border-green-500/30", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  rate_limit_hit: { label: "Rate Limit Hit", color: "bg-blue-500/15 text-blue-400 border-blue-500/30", icon: <Activity className="w-3.5 h-3.5" /> },
};

function formatTime(date: Date | string) {
  return new Date(date).toLocaleString();
}

function timeAgo(date: Date | string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function SecurityLog() {
  const [limit, setLimit] = useState(100);
  const { data: stats, refetch: refetchStats } = trpc.security.getStats.useQuery();
  const { data: events, isLoading, refetch: refetchEvents } = trpc.security.getEvents.useQuery({ limit });

  const handleRefresh = () => {
    refetchStats();
    refetchEvents();
  };

  const threatEvents = events?.filter(e => e.eventType !== "successful_login") ?? [];
  const topIPs = Object.entries(
    threatEvents.reduce((acc, e) => { acc[e.ip] = (acc[e.ip] || 0) + 1; return acc; }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-500" />
            Security Log
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time threat monitoring for incrediwatts.com</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Failed Logins</p>
                <p className="text-3xl font-bold text-red-400 mt-1">{stats?.failedLogins ?? 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400/40" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">IPs Locked Out</p>
                <p className="text-3xl font-bold text-orange-400 mt-1">{stats?.ipLockouts ?? 0}</p>
              </div>
              <Ban className="w-8 h-8 text-orange-400/40" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Last 24 Hours</p>
                <p className="text-3xl font-bold text-blue-400 mt-1">{stats?.last24h ?? 0}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400/40" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/20 bg-purple-500/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Unique IPs</p>
                <p className="text-3xl font-bold text-purple-400 mt-1">{stats?.uniqueIPs ?? 0}</p>
              </div>
              <Globe className="w-8 h-8 text-purple-400/40" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top threat IPs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-500" />
              Top Threat IPs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topIPs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500/50" />
                No threats detected
              </div>
            ) : (
              topIPs.map(([ip, count]) => (
                <div key={ip} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/30">
                  <span className="text-sm font-mono text-foreground/80">{ip}</span>
                  <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-xs">
                    {count} events
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Event type breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              Event Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(EVENT_CONFIG).map(([type, cfg]) => {
                const count = events?.filter(e => e.eventType === type).length ?? 0;
                return (
                  <div key={type} className={`flex items-center justify-between p-3 rounded-lg border ${cfg.color}`}>
                    <div className="flex items-center gap-2">
                      {cfg.icon}
                      <span className="text-xs font-medium">{cfg.label}</span>
                    </div>
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event log table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-500" />
              Recent Events
              {events && <Badge variant="secondary" className="ml-1 text-xs">{events.length}</Badge>}
            </CardTitle>
            <div className="flex gap-2">
              {[50, 100, 200].map(n => (
                <Button
                  key={n}
                  variant={limit === n ? "default" : "outline"}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => setLimit(n)}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Loading events...
            </div>
          ) : !events || events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="w-10 h-10 mx-auto mb-3 text-green-500/40" />
              <p className="font-medium text-green-500/70">All clear — no security events recorded yet</p>
              <p className="text-xs mt-1">Events will appear here as users interact with the login page</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Time</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Event</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">IP Address</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const cfg = EVENT_CONFIG[event.eventType] ?? { label: event.eventType, color: "bg-muted text-foreground border-border", icon: null };
                    return (
                      <tr key={event.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="text-xs text-foreground/70">{timeAgo(event.createdAt)}</div>
                          <div className="text-xs text-muted-foreground">{formatTime(event.createdAt)}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge variant="outline" className={`text-xs gap-1 ${cfg.color}`}>
                            {cfg.icon}
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded">{event.ip}</span>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-muted-foreground max-w-xs truncate">
                          {event.details ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
