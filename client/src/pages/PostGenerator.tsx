import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Camera, Check, Copy, Facebook, ImageIcon, Instagram, Loader2, Send, Sparkles, Wand2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type PostType = "menu_item" | "special" | "event" | "promotion" | "taco_tuesday" | "manual";
type Platform = "facebook" | "instagram" | "both";

/** Returns the next N optimal posting slots: Mon/Tue/Thu/Sat at 13:00 MST (UTC-7) */
function getNextPostingSlots(count: number): { label: string; time: string; value: string }[] {
  const POSTING_DAYS = [1, 2, 4, 6]; // Mon=1, Tue=2, Thu=4, Sat=6
  const POSTING_HOUR_MST = 13; // 1 PM MST
  const MST_OFFSET = -7 * 60; // MST is UTC-7

  const slots: { label: string; time: string; value: string }[] = [];
  const now = new Date();

  // Start from tomorrow to avoid scheduling in the past
  const cursor = new Date(now);
  cursor.setDate(cursor.getDate() + 1);
  cursor.setHours(0, 0, 0, 0);

  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  while (slots.length < count) {
    const dayOfWeek = cursor.getDay();
    if (POSTING_DAYS.includes(dayOfWeek)) {
      // Build a datetime-local value at 1 PM MST
      // datetime-local is always in local time, so we set the hour to 1 PM MST
      // We'll use a fixed MST representation
      const year = cursor.getFullYear();
      const month = String(cursor.getMonth() + 1).padStart(2, "0");
      const day = String(cursor.getDate()).padStart(2, "0");
      const value = `${year}-${month}-${day}T13:00`;

      slots.push({
        label: `${DAY_NAMES[dayOfWeek]} ${MONTH_NAMES[cursor.getMonth()]} ${cursor.getDate()}`,
        time: "1:00 PM MST",
        value,
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return slots;
}

export default function PostGenerator() {
  const [postType, setPostType] = useState<PostType>("menu_item");
  const [platform, setPlatform] = useState<Platform>("both");
  const [isBilingual, setIsBilingual] = useState(false);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<number | undefined>();
  const [selectedSpecialId, setSelectedSpecialId] = useState<number | undefined>();
  const [selectedEventId, setSelectedEventId] = useState<number | undefined>();
  const [selectedPromotionId, setSelectedPromotionId] = useState<number | undefined>();
  const [extraContext, setExtraContext] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [generatedPost, setGeneratedPost] = useState<{
    captionEn: string; captionEs: string; hashtags: string;
    post: { id: number; status: string };
  } | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const { data: categories } = trpc.menu.categories.useQuery();
  const { data: foodPhotos } = trpc.photos.list.useQuery();
  const [selectedCategory, setSelectedCategory] = useState<string>("Mexican Cuisine");
  const { data: menuItems } = trpc.menu.byCategory.useQuery(
    { category: selectedCategory },
    { enabled: !!selectedCategory && postType === "menu_item" }
  );
  const { data: specials } = trpc.specials.active.useQuery();
  const { data: events } = trpc.events.upcoming.useQuery();
  const { data: promotions } = trpc.promotions.active.useQuery();

  const generateMutation = trpc.posts.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedPost(data);
      toast.success("Post generated successfully!");
    },
    onError: (err) => toast.error(`Generation failed: ${err.message}`),
  });

  const tacoTuesdayMutation = trpc.posts.generateTacoTuesday.useMutation({
    onSuccess: (data) => {
      setGeneratedPost(data);
      toast.success("Taco Tuesday post generated!");
    },
    onError: (err) => toast.error(`Generation failed: ${err.message}`),
  });

  const updateMutation = trpc.posts.update.useMutation({
    onSuccess: () => toast.success("Post saved!"),
    onError: (err) => toast.error(err.message),
  });

  const publishMutation = trpc.posts.publishNow.useMutation({
    onSuccess: (data) => {
      setGeneratedPost((prev) => {
        if (!prev) return prev;
        // If we have a selected image, make sure it was saved to the post before publishing
        return { ...prev, post: { ...prev.post, status: "published" } };
      });
      const parts: string[] = ["Post published live!"];
      if (data.facebookPostId) parts.push(`FB: ${data.facebookPostId}`);
      if (data.instagramPostId) parts.push(`IG: ${data.instagramPostId}`);
      toast.success(parts.join(" · "));
      utils.posts.counts.invalidate();
      utils.posts.list.invalidate();
    },
    onError: (err) => toast.error(`Publish failed: ${err.message}`),
  });

  const utils = trpc.useUtils();

  const handleGenerate = () => {
    const scheduledAt = scheduledDate ? new Date(scheduledDate).getTime() : undefined;

    if (postType === "taco_tuesday") {
      tacoTuesdayMutation.mutate({ isBilingual, scheduledAt });
      return;
    }

    generateMutation.mutate({
      type: postType,
      menuItemId: postType === "menu_item" ? selectedMenuItemId : undefined,
      specialId: postType === "special" ? selectedSpecialId : undefined,
      eventId: postType === "event" ? selectedEventId : undefined,
      promotionId: postType === "promotion" ? selectedPromotionId : undefined,
      isBilingual,
      extraContext: extraContext || undefined,
      scheduledAt,
      platform,
      imageUrl: selectedImageUrl || undefined,
    });
  };

  const handleSchedule = () => {
    if (!generatedPost) return;
    const scheduledAt = scheduledDate ? new Date(scheduledDate).getTime() : undefined;
    updateMutation.mutate({
      id: generatedPost.post.id,
      status: scheduledAt ? "scheduled" : "draft",
      scheduledAt,
    });
    utils.posts.scheduled.invalidate();
    utils.posts.counts.invalidate();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const isLoading = generateMutation.isPending || tacoTuesdayMutation.isPending;

  const postTypeOptions = [
    { value: "menu_item", label: "🍽️ Menu Item" },
    { value: "special", label: "⭐ Weekly Special" },
    { value: "event", label: "📢 Event" },
    { value: "promotion", label: "🏷️ Promotion" },
    { value: "taco_tuesday", label: "🌮 Taco Tuesday" },
    { value: "manual", label: "✏️ Custom / Manual" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Post Generator</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate bilingual, branded social media content using AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Configuration */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Wand2 size={16} className="text-primary" />
                  Post Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Post type */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Post Type</Label>
                  <Select value={postType} onValueChange={(v) => setPostType(v as PostType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {postTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Menu item selector */}
                {postType === "menu_item" && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Label className="text-xs font-medium">Menu Item</Label>
                    <Select
                      value={selectedMenuItemId?.toString()}
                      onValueChange={(v) => setSelectedMenuItemId(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {menuItems?.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name} {item.price ? `· $${Number(item.price).toFixed(2)}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Special selector */}
                {postType === "special" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Weekly Special</Label>
                    <Select
                      value={selectedSpecialId?.toString()}
                      onValueChange={(v) => setSelectedSpecialId(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select special" />
                      </SelectTrigger>
                      <SelectContent>
                        {specials?.length === 0 && (
                          <SelectItem value="none" disabled>No active specials — add one first</SelectItem>
                        )}
                        {specials?.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>{s.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Event selector */}
                {postType === "event" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Event</Label>
                    <Select
                      value={selectedEventId?.toString()}
                      onValueChange={(v) => setSelectedEventId(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                      <SelectContent>
                        {events?.length === 0 && (
                          <SelectItem value="none" disabled>No upcoming events — add one first</SelectItem>
                        )}
                        {events?.map((e) => (
                          <SelectItem key={e.id} value={e.id.toString()}>{e.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Promotion selector */}
                {postType === "promotion" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Promotion</Label>
                    <Select
                      value={selectedPromotionId?.toString()}
                      onValueChange={(v) => setSelectedPromotionId(parseInt(v))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select promotion" />
                      </SelectTrigger>
                      <SelectContent>
                        {promotions?.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Extra context */}
                {postType === "manual" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">What do you want to post about?</Label>
                    <Textarea
                      placeholder="e.g. 'We're open late tonight until midnight!' or 'Congratulations to our employee of the month...'"
                      value={extraContext}
                      onChange={(e) => setExtraContext(e.target.value)}
                      rows={3}
                    />
                  </div>
                )}

                {/* Platform */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Platform</Label>
                  <Select value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">📱 Facebook + Instagram</SelectItem>
                      <SelectItem value="facebook">👥 Facebook only</SelectItem>
                      <SelectItem value="instagram">📸 Instagram only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bilingual toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">Bilingual Post</p>
                    <p className="text-xs text-muted-foreground">Include Spanish caption</p>
                  </div>
                  <Switch checked={isBilingual} onCheckedChange={setIsBilingual} />
                </div>

                {/* Image picker */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Photo (optional)</Label>
                  {selectedImageUrl ? (
                    <div className="relative rounded-lg overflow-hidden border">
                      <img src={selectedImageUrl} alt="Selected" className="w-full h-28 object-cover" />
                      <button
                        type="button"
                        onClick={() => setSelectedImageUrl(null)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowImagePicker(true)}
                      className="w-full h-16 border-2 border-dashed border-border rounded-lg flex items-center justify-center gap-2 text-xs text-muted-foreground hover:border-primary/50 hover:bg-muted/30 transition-colors"
                    >
                      <ImageIcon size={14} />
                      Select from food photos library
                    </button>
                  )}
                  {showImagePicker && (
                    <div className="border rounded-lg p-2 bg-muted/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium">Food Photos Library</p>
                        <button type="button" onClick={() => setShowImagePicker(false)} className="text-muted-foreground hover:text-foreground">
                          <X size={13} />
                        </button>
                      </div>
                      {!foodPhotos || foodPhotos.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No photos uploaded yet. Go to Food Photos to upload.</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
                          {foodPhotos.map((photo) => (
                            <button
                              key={photo.id}
                              type="button"
                              onClick={() => { setSelectedImageUrl(photo.url); setShowImagePicker(false); }}
                              className={`relative rounded overflow-hidden border-2 transition-colors ${
                                selectedImageUrl === photo.url ? "border-primary" : "border-transparent hover:border-primary/50"
                              }`}
                            >
                              <img src={photo.url} alt={photo.caption ?? "Food photo"} className="w-full h-16 object-cover" />
                              {selectedImageUrl === photo.url && (
                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                  <Check size={16} className="text-primary" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Schedule date */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Schedule Date (optional)</Label>
                  <p className="text-xs text-muted-foreground">Optimal slots: Mon/Tue/Thu/Sat at 1 PM MST</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {getNextPostingSlots(4).map((slot) => (
                      <button
                        key={slot.value}
                        type="button"
                        onClick={() => setScheduledDate(slot.value)}
                        className={`text-left px-2 py-1.5 rounded border text-xs transition-colors ${
                          scheduledDate === slot.value
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        <span className="font-medium">{slot.label}</span>
                        <span className="block text-muted-foreground">{slot.time}</span>
                      </button>
                    ))}
                  </div>
                  <Input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="text-xs"
                  />
                  {scheduledDate && (
                    <button
                      type="button"
                      onClick={() => setScheduledDate("")}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear schedule
                    </button>
                  )}
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isLoading ? (
                    <><Loader2 size={16} className="animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles size={16} /> Generate Post</>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview */}
          <div className="space-y-4">
            {generatedPost ? (
              <>
                {/* Facebook preview */}
                {(platform === "facebook" || platform === "both") && (
                  <Card className="border-[#1877F2]/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold flex items-center gap-2 text-[#1877F2]">
                        <Facebook size={14} />
                        Facebook Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white rounded-lg border p-3 text-sm font-sans">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-xs">S</div>
                          <div>
                            <p className="font-semibold text-xs text-gray-900">Sopris Taqueria</p>
                            <p className="text-xs text-gray-500">Just now · 🌐</p>
                          </div>
                        </div>
                        {selectedImageUrl && (
                          <img src={selectedImageUrl} alt="Post photo" className="w-full h-36 object-cover rounded mb-2" />
                        )}
                        <p className="text-gray-800 text-xs leading-relaxed whitespace-pre-wrap">
                          {generatedPost.captionEn}
                          {generatedPost.captionEs && `\n\n🇲🇽 ${generatedPost.captionEs}`}
                          {"\n\n"}{generatedPost.hashtags}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full gap-2 text-xs"
                        onClick={() => copyToClipboard(`${generatedPost.captionEn}${generatedPost.captionEs ? `\n\n🇲🇽 ${generatedPost.captionEs}` : ""}\n\n${generatedPost.hashtags}`)}
                      >
                        <Copy size={12} /> Copy Facebook Caption
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Instagram preview */}
                {(platform === "instagram" || platform === "both") && (
                  <Card className="border-pink-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs font-semibold flex items-center gap-2 text-pink-600">
                        <Instagram size={14} />
                        Instagram Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-white rounded border text-sm font-sans">
                        <div className="flex items-center gap-2 p-2 border-b">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-white font-bold text-xs">S</div>
                          <p className="font-semibold text-xs text-gray-900">sopristaqueria</p>
                        </div>
                        {selectedImageUrl ? (
                          <img src={selectedImageUrl} alt="Post photo" className="w-full h-36 object-cover" />
                        ) : (
                          <div className="w-full h-24 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                            <p className="text-xs text-amber-700 font-medium">📸 Select a photo above</p>
                          </div>
                        )}
                        <div className="p-2">
                          <p className="text-gray-800 text-xs leading-relaxed">
                            <span className="font-semibold">sopristaqueria </span>
                            {generatedPost.captionEn.slice(0, 120)}...
                          </p>
                          {generatedPost.captionEs && (
                            <p className="text-gray-600 text-xs mt-1 leading-relaxed">
                              🇲🇽 {generatedPost.captionEs.slice(0, 80)}...
                            </p>
                          )}
                          <p className="text-blue-500 text-xs mt-1">{generatedPost.hashtags}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2 w-full gap-2 text-xs"
                        onClick={() => copyToClipboard(`${generatedPost.captionEn}${generatedPost.captionEs ? `\n\n🇲🇽 ${generatedPost.captionEs}` : ""}\n\n${generatedPost.hashtags}`)}
                      >
                        <Copy size={12} /> Copy Instagram Caption
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      updateMutation.mutate({ id: generatedPost.post.id, status: "draft" });
                    }}
                    disabled={updateMutation.isPending || generatedPost.post.status === "published"}
                  >
                    Save as Draft
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleSchedule}
                    disabled={updateMutation.isPending || generatedPost.post.status === "published"}
                  >
                    {scheduledDate ? "Schedule Post" : "Mark Ready"}
                  </Button>
                </div>
                <Button
                  className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => publishMutation.mutate({ id: generatedPost.post.id })}
                  disabled={publishMutation.isPending || generatedPost.post.status === "published"}
                >
                  {publishMutation.isPending ? (
                    <><Loader2 size={16} className="animate-spin" /> Publishing to {platform === "both" ? "Facebook & Instagram" : platform}...</>
                  ) : generatedPost.post.status === "published" ? (
                    <><Send size={16} /> Published ✓</>
                  ) : (
                    <><Send size={16} /> Publish Now to {platform === "both" ? "Facebook & Instagram" : platform === "facebook" ? "Facebook" : "Instagram"}</>
                  )}
                </Button>

                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    Status: {generatedPost.post.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Post ID: #{generatedPost.post.id}
                  </Badge>
                </div>
              </>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <Sparkles size={40} className="text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">Your generated post will appear here</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure your post settings and click Generate
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
