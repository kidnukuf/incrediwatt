import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Coffee, Calendar, CheckCircle2, Clock, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const PLANNED_FEATURES = [
  { icon: "☕", title: "Espresso Drinks", desc: "Lattes, cappuccinos, macchiatos, and more" },
  { icon: "⚡", title: "Energy Drinks", desc: "Red Bull loaded drinks, custom energy blends" },
  { icon: "🧋", title: "Specialty Beverages", desc: "Seasonal drinks, smoothies, and blended creations" },
  { icon: "🌮", title: "Sopris Combo Posts", desc: "Cross-promote coffee with Sopris food items" },
  { icon: "📅", title: "Morning Content Calendar", desc: "Dedicated morning shift social media schedule" },
  { icon: "🎨", title: "Branded Templates", desc: "Border Boost and Brew™ visual identity (blue & gold)" },
];

export default function BorderBoostAndBrew() {
  const [filling, setFilling] = useState(false);

  // Query Border Boost and Brew scheduled posts
  const { data: posts, refetch } = trpc.posts.list.useQuery();
  const brewPosts = posts?.filter(p => p.postType === "borderline_brew") ?? [];
  const scheduledBrewPosts = brewPosts.filter(p => p.status === "scheduled");
  const publishedBrewPosts = brewPosts.filter(p => p.status === "published");

  // Mutation to fill schedule with Border Boost and Brew posts
  const fillSchedule = trpc.posts.fillBrewSchedule.useMutation({
    onSuccess: (data: { created: number }) => {
      toast.success(`Created ${data.created} Border Boost and Brew™ posts across Mon/Tue/Thu/Sat slots.`);
      refetch();
      setFilling(false);
    },
    onError: (err: { message: string }) => {
      toast.error(err.message);
      setFilling(false);
    },
  });

  const handleFillSchedule = () => {
    setFilling(true);
    fillSchedule.mutate({ weeks: 4 });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Coffee size={24} className="text-amber-700" />
              Border Boost and Brew™
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Independent social media schedule for the beverage brand at 4 Jacks Casino
            </p>
          </div>
          <Badge className="bg-amber-500 text-white">Active</Badge>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Calendar size={18} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{scheduledBrewPosts.length}</p>
                  <p className="text-xs text-muted-foreground">Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{publishedBrewPosts.length}</p>
                  <p className="text-xs text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Clock size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{brewPosts.length}</p>
                  <p className="text-xs text-muted-foreground">Total Posts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hero card */}
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center max-w-md mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg">
                <Coffee size={36} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100">
                Border Boost and Brew™
              </h2>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-2 leading-relaxed">
                A full-service beverage brand offering artisan espresso drinks, Red Bull loaded
                creations, and specialty beverages — operating inside Sopris Taqueria at 4 Jacks Casino, Jackpot NV.
              </p>
              <div className="flex items-center gap-2 mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Zap size={16} className="text-amber-600" />
                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  Posts on Mon / Tue / Thu / Sat at 1 PM MST — independent of Sopris schedule
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule fill action */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">4-Week Content Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Fill all Mon/Tue/Thu/Sat slots for the next 4 weeks with Border Boost and Brew™ posts.
              Each post targets both Facebook and Instagram with bilingual captions and hashtags.
            </p>
            {scheduledBrewPosts.length > 0 ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-600 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> {scheduledBrewPosts.length} posts scheduled — auto-publish is active
                </p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {scheduledBrewPosts.slice(0, 8).map(post => (
                    <div key={post.id} className="flex items-center justify-between text-xs bg-muted/50 rounded px-3 py-2">
                      <span className="truncate max-w-[60%] text-muted-foreground">{post.captionEn.substring(0, 60)}…</span>
                      <span className="text-muted-foreground shrink-0 ml-2">
                        {post.scheduledAt ? new Date(post.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No posts scheduled yet.</p>
            )}
            <Button
              onClick={handleFillSchedule}
              disabled={filling}
              className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Calendar size={14} />
              {filling ? "Filling schedule…" : "Fill 4-Week Schedule"}
            </Button>
          </CardContent>
        </Card>

        {/* Planned features grid */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Content Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PLANNED_FEATURES.map((feature) => (
              <Card key={feature.title} className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <span className="text-xl">{feature.icon}</span>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
