import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Copy, Facebook, Instagram, Loader2, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  scheduled: "bg-blue-100 text-blue-700",
  published: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function PostHistory() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");

  const { data: posts, isLoading, refetch } = trpc.posts.list.useQuery({ limit: 100 });
  const deleteMutation = trpc.posts.delete.useMutation({
    onSuccess: () => { toast.success("Post deleted"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.posts.update.useMutation({
    onSuccess: () => { toast.success("Status updated"); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const [publishingId, setPublishingId] = useState<number | null>(null);
  const publishMutation = trpc.posts.publishNow.useMutation({
    onSuccess: (data) => {
      const parts: string[] = ["Published live!"];
      if (data.facebookPostId) parts.push("FB ✓");
      if (data.instagramPostId) parts.push("IG ✓");
      toast.success(parts.join(" · "));
      setPublishingId(null);
      refetch();
    },
    onError: (e) => { toast.error(`Publish failed: ${e.message}`); setPublishingId(null); },
  });

  const filtered = posts?.filter((p) => {
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (filterPlatform !== "all" && p.platform !== filterPlatform) return false;
    return true;
  }) ?? [];

  const copyCaption = (post: typeof filtered[0]) => {
    const text = `${post.captionEn}${post.captionEs ? `\n\n🇲🇽 ${post.captionEs}` : ""}${post.hashtags ? `\n\n${post.hashtags}` : ""}`;
    navigator.clipboard.writeText(text);
    toast.success("Caption copied!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Post History</h1>
            <p className="text-muted-foreground text-sm mt-1">All generated and published content</p>
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32 h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPlatform} onValueChange={setFilterPlatform}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                <SelectItem value="both">Both</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-muted-foreground">No posts found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((post) => (
              <Card key={post.id} className="border-border/60">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Meta row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[post.status] ?? ""}`}>
                          {post.status}
                        </span>
                        <Badge variant="outline" className="text-xs h-5 gap-1">
                          {post.platform === "facebook" ? <Facebook size={10} /> : post.platform === "instagram" ? <Instagram size={10} /> : null}
                          {post.platform}
                        </Badge>
                        <Badge variant="outline" className="text-xs h-5 capitalize">
                          {post.postType.replace("_", " ")}
                        </Badge>
                        {post.captionEs && (
                          <Badge variant="outline" className="text-xs h-5">🇲🇽 Bilingual</Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {post.scheduledAt
                            ? `Scheduled: ${new Date(post.scheduledAt).toLocaleString()}`
                            : `Created: ${new Date(post.createdAt).toLocaleDateString()}`}
                        </span>
                      </div>

                      {/* Caption */}
                      <p className="text-sm text-foreground leading-relaxed line-clamp-3">{post.captionEn}</p>
                      {post.captionEs && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">🇲🇽 {post.captionEs}</p>
                      )}
                      {post.hashtags && (
                        <p className="text-xs text-blue-600">{post.hashtags}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1.5 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => copyCaption(post)}
                        title="Copy caption"
                      >
                        <Copy size={13} />
                      </Button>
                      {(post.status === "draft" || post.status === "scheduled") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50 px-2 gap-1"
                          onClick={() => { setPublishingId(post.id); publishMutation.mutate({ id: post.id }); }}
                          disabled={publishingId === post.id}
                          title="Publish live to Facebook & Instagram"
                        >
                          {publishingId === post.id ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <Send size={11} />
                          )}
                          {publishingId === post.id ? "Posting..." : "Publish Now"}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deleteMutation.mutate({ id: post.id })}
                        title="Delete post"
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
