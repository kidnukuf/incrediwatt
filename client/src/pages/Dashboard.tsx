import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  FileText,
  Megaphone,
  RefreshCw,
  Settings,
  Sparkles,
  Star,
  Tag,
  TrendingUp,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data: counts } = trpc.posts.counts.useQuery();
  const { data: scheduled } = trpc.posts.scheduled.useQuery();
  const { data: promotions } = trpc.promotions.active.useQuery();
  const { data: specials } = trpc.specials.active.useQuery();
  const { data: events } = trpc.events.upcoming.useQuery();
  const { data: tokenStatus } = trpc.settings.tokenStatus.useQuery(undefined, {
    refetchInterval: 60 * 60 * 1000,
  });

  const retryFailedMutation = trpc.posts.retryFailed.useMutation({
    onSuccess: (data) => {
      if (data.total === 0) toast.info("No failed posts to retry");
      else
        toast.success(
          `Retried ${data.total} failed posts: ${data.retried} published, ${data.failed} still failed`
        );
    },
    onError: (e) => toast.error(`Retry failed: ${e.message}`),
  });

  const quickActions = [
    { icon: Sparkles, label: "Generate Post", path: "/generate", color: "bg-amber-500", desc: "AI-powered bilingual content" },
    { icon: Calendar, label: "View Calendar", path: "/calendar", color: "bg-blue-500", desc: "Plan your content schedule" },
    { icon: Star, label: "Add Special", path: "/specials", color: "bg-green-500", desc: "This week's featured dishes" },
    { icon: Megaphone, label: "Add Event", path: "/events", color: "bg-purple-500", desc: "Upcoming promotions & events" },
    { icon: Camera, label: "Upload Photos", path: "/photos", color: "bg-rose-500", desc: "Food photography library" },
    { icon: Tag, label: "Promotions", path: "/promotions", color: "bg-orange-500", desc: "CDL, honor roll & more" },
  ];

  const nextScheduled = scheduled?.slice(0, 3) ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Sopris Taqueria · Inside 4 Jacks Casino, Jackpot NV
            </p>
          </div>
          <Button onClick={() => navigate("/generate")} className="gap-2">
            <Sparkles size={16} />
            Generate Post
          </Button>
        </div>

        {/* Token status alert */}
        {tokenStatus && (
          tokenStatus.valid === false ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800">
              <AlertTriangle size={18} className="flex-shrink-0 text-red-500" />
              <div className="flex-1 text-sm">
                <span className="font-semibold">Facebook token invalid:</span>{" "}
                {tokenStatus.error ?? "Token has expired or been revoked. Posts will not publish."}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-red-700 border-red-300 hover:bg-red-100 gap-1 flex-shrink-0"
                onClick={() => navigate("/settings")}
              >
                <Settings size={13} /> Fix Now
              </Button>
            </div>
          ) : tokenStatus.daysLeft <= 7 ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800">
              <AlertTriangle size={18} className="flex-shrink-0 text-amber-500" />
              <div className="flex-1 text-sm">
                <span className="font-semibold">Facebook token expiring soon:</span>{" "}
                {tokenStatus.daysLeft} day{tokenStatus.daysLeft !== 1 ? "s" : ""} left. Reconnect before it expires.
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-amber-700 border-amber-300 hover:bg-amber-100 gap-1 flex-shrink-0"
                onClick={() => navigate("/settings")}
              >
                <Settings size={13} /> Update Token
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800">
              <CheckCircle size={18} className="flex-shrink-0 text-green-500" />
              <div className="flex-1 text-sm">
                <span className="font-semibold">Facebook token active</span> —{" "}
                {(tokenStatus as { permanent?: boolean }).permanent
                  ? "Permanent token — never expires."
                  : tokenStatus.daysLeft >= 60
                  ? "Long-lived token, no expiry concern."
                  : `${tokenStatus.daysLeft} days remaining.`}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-green-700 gap-1 flex-shrink-0"
                onClick={() => retryFailedMutation.mutate()}
                disabled={retryFailedMutation.isPending}
              >
                {retryFailedMutation.isPending ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <RefreshCw size={13} />
                )}
                Retry Failed Posts
              </Button>
            </div>
          )
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Posts</p>
                  <p className="text-2xl font-bold mt-1">{counts?.total ?? 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText size={18} className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Scheduled</p>
                  <p className="text-2xl font-bold mt-1">{counts?.scheduled ?? 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Clock size={18} className="text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Published</p>
                  <p className="text-2xl font-bold mt-1">{counts?.published ?? 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp size={18} className="text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Drafts</p>
                  <p className="text-2xl font-bold mt-1">{counts?.draft ?? 0}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <FileText size={18} className="text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.path}
                  className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 border-border/60"
                  onClick={() => navigate(action.path)}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={16} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{action.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{action.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Upcoming scheduled posts */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                Upcoming Scheduled Posts
                <Button variant="ghost" size="sm" onClick={() => navigate("/calendar")} className="text-xs h-7">
                  View all
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextScheduled.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Clock size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No scheduled posts yet</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/generate")}>
                    Generate your first post
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {nextScheduled.map((post) => (
                    <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{post.captionEn.slice(0, 80)}...</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs h-5">{post.platform}</Badge>
                          <Badge variant="outline" className="text-xs h-5">{post.postType.replace("_", " ")}</Badge>
                          {post.scheduledAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(post.scheduledAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active items summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Active Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-green-600" />
                  <span className="text-sm">Promotions</span>
                </div>
                <Badge className="bg-green-500 text-white text-xs">{promotions?.length ?? 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10">
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-amber-600" />
                  <span className="text-sm">Specials</span>
                </div>
                <Badge className="bg-amber-500 text-white text-xs">{specials?.length ?? 0}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-purple-500/10">
                <div className="flex items-center gap-2">
                  <Megaphone size={14} className="text-purple-600" />
                  <span className="text-sm">Events</span>
                </div>
                <Badge className="bg-purple-500 text-white text-xs">{events?.length ?? 0}</Badge>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  🌮 Taco Tuesday auto-posts every week
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
