import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { Sparkles, Tag } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Promotions() {
  const [, navigate] = useLocation();
  const { data: promotions, refetch } = trpc.promotions.list.useQuery();
  const toggleMutation = trpc.promotions.toggle.useMutation({
    onSuccess: () => { toast.success("Promotion updated"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const PROMO_ICONS: Record<string, string> = {
    review: "⭐",
    cdl: "🚛",
    honor_roll: "🎓",
    educator: "📚",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Promotions</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage active promotions — toggle on/off and generate posts
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {promotions?.map((promo) => {
            const icon = Object.entries(PROMO_ICONS).find(([k]) => promo.type?.includes(k))?.[1] ?? "🏷️";
            return (
              <Card key={promo.id} className={`border-2 transition-all ${promo.isActive ? "border-primary/30 bg-primary/5" : "border-border/40 opacity-70"}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <CardTitle className="text-sm font-semibold">{promo.title}</CardTitle>
                        {promo.titleEs && <p className="text-xs text-muted-foreground">{promo.titleEs}</p>}
                      </div>
                    </div>
                    <Switch
                      checked={promo.isActive}
                      onCheckedChange={(v) => toggleMutation.mutate({ id: promo.id, isActive: v })}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-muted-foreground leading-relaxed">{promo.description}</p>
                  {promo.descriptionEs && (
                    <p className="text-xs text-muted-foreground/70 leading-relaxed italic">🇲🇽 {promo.descriptionEs}</p>
                  )}
                  {promo.discountValue && (
                    <Badge variant="outline" className="text-xs">{promo.discountValue}</Badge>
                  )}
                  {promo.requirements && (
                    <p className="text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded">
                      📋 {promo.requirements}
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs h-7"
                      disabled={!promo.isActive}
                      onClick={() => navigate(`/generate?type=promotion&id=${promo.id}`)}
                    >
                      <Sparkles size={12} /> Generate Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Tag size={28} className="text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">More promotions coming soon</p>
            <p className="text-xs text-muted-foreground mt-1">
              Border Boost and Brew™ promotions will appear here when the coffee shop launches
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
