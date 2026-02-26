import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export default function Menu() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data: categories } = trpc.menu.categories.useQuery();
  const { data: allItems } = trpc.menu.list.useQuery();

  type MenuItem = NonNullable<typeof allItems>[number];
  const filtered: MenuItem[] = allItems?.filter((item) => {
    const matchesSearch = !search || 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.nameEs ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (item.description ?? "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  }) ?? [];

  const grouped = filtered.reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category]!.push(item);
    return acc;
  }, {});

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Menu Database</h1>
          <p className="text-muted-foreground text-sm mt-1">
            All {allItems?.length ?? 0} menu items — the AI draws from this to generate posts
          </p>
        </div>

        {/* Search + filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu items..."
              className="pl-8 h-9"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Button
              variant={activeCategory === null ? "default" : "outline"}
              size="sm"
              className="h-9 text-xs"
              onClick={() => setActiveCategory(null)}
            >
              All
            </Button>
            {categories?.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                className="h-9 text-xs"
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu by category */}
        {Object.entries(grouped).map(([category, items]) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center justify-between">
                {category}
                <Badge variant="outline" className="text-xs">{items.length} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-2.5 rounded-lg border border-border/40 hover:border-border transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{item.name}</p>
                        {item.nameEs && (
                          <span className="text-xs text-muted-foreground">· {item.nameEs}</span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                      )}
                      {item.price && (
                        <p className="text-xs font-semibold text-primary mt-0.5">
                          ${Number(item.price).toFixed(2)}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                      onClick={() => navigate(`/generate?type=menu_item&id=${item.id}`)}
                      title="Generate post for this item"
                    >
                      <Sparkles size={13} className="text-primary" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground">No items match your search</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
