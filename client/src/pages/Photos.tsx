import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Camera, Loader2, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function Photos() {
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: photos, refetch } = trpc.photos.list.useQuery();
  const { data: categories } = trpc.menu.categories.useQuery();
  const [selectedCategory, setSelectedCategory] = useState("Mexican Cuisine");
  const { data: menuItems } = trpc.menu.byCategory.useQuery({ category: selectedCategory });

  const uploadMutation = trpc.photos.upload.useMutation({
    onSuccess: () => { toast.success("Photo uploaded!"); refetch(); setCaption(""); setSelectedMenuItemId(""); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.photos.delete.useMutation({
    onSuccess: () => { toast.success("Photo deleted"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast.error("File must be under 10MB");

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1];
        uploadMutation.mutate({
          filename: file.name,
          contentType: file.type,
          base64Data: base64 ?? "",
          caption: caption || undefined,
          menuItemId: selectedMenuItemId && selectedMenuItemId !== "none" ? parseInt(selectedMenuItemId) : undefined,
        });
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setUploading(false);
      toast.error("Upload failed");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Photo Library</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload and manage food photos for social media posts</p>
        </div>

        {/* Upload section */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Link to Menu Item (optional)</Label>
                <Select value={selectedMenuItemId} onValueChange={setSelectedMenuItemId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No specific item</SelectItem>
                    {menuItems?.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>{item.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Caption / Notes</Label>
                <Input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Street tacos — hero shot"
                  className="h-9"
                />
              </div>
            </div>
            <div className="mt-4">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                onClick={() => fileRef.current?.click()}
                disabled={uploading || uploadMutation.isPending}
                className="gap-2"
              >
                {uploading || uploadMutation.isPending ? (
                  <><Loader2 size={16} className="animate-spin" /> Uploading...</>
                ) : (
                  <><Upload size={16} /> Upload Photo</>
                )}
              </Button>
              <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WEBP · Max 10MB</p>
            </div>
          </CardContent>
        </Card>

        {/* Photo grid */}
        {!photos || photos.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Camera size={40} className="text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No photos yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Upload food photos to attach them to social media posts
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative rounded-lg overflow-hidden border border-border/60 bg-muted/30">
                <img
                  src={photo.url}
                  alt={photo.caption ?? "Food photo"}
                  className="w-full aspect-square object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                  <p className="text-white text-xs truncate">{photo.caption ?? "No caption"}</p>
                  {photo.menuItemId && (
                    <Badge className="text-xs mt-1 w-fit bg-amber-500">Linked to menu</Badge>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => deleteMutation.mutate({ id: photo.id })}
                  >
                    <Trash2 size={11} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
