import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const POST_TYPE_COLORS: Record<string, string> = {
  menu_item: "bg-amber-500",
  special: "bg-green-500",
  event: "bg-purple-500",
  promotion: "bg-orange-500",
  taco_tuesday: "bg-red-500",
  manual: "bg-blue-500",
  borderline_brew: "bg-teal-500",
};

export default function Calendar() {
  const [, navigate] = useLocation();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const monthStart = useMemo(() => new Date(viewYear, viewMonth, 1).getTime(), [viewYear, viewMonth]);
  const monthEnd = useMemo(() => new Date(viewYear, viewMonth + 1, 0, 23, 59, 59).getTime(), [viewYear, viewMonth]);

  const { data: posts } = trpc.posts.inRange.useQuery({ from: monthStart, to: monthEnd });

  const postsByDay = useMemo(() => {
    const map: Record<number, typeof posts> = {};
    if (!posts) return map;
    posts.forEach((post) => {
      const d = post.scheduledAt ? new Date(post.scheduledAt) : new Date(post.createdAt);
      const day = d.getDate();
      if (!map[day]) map[day] = [];
      map[day]!.push(post);
    });
    return map;
  }, [posts]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Content Calendar</h1>
            <p className="text-muted-foreground text-sm mt-1">Plan and schedule your social media posts</p>
          </div>
          <Button onClick={() => navigate("/generate")} className="gap-2">
            <Sparkles size={16} /> Generate Post
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold">
                {MONTHS[viewMonth]} {viewYear}
              </CardTitle>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={prevMonth} className="h-8 w-8">
                  <ChevronLeft size={14} />
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }} className="h-8 text-xs">
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8">
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, idx) => {
                if (!day) return <div key={`empty-${idx}`} className="min-h-[80px]" />;
                const isToday = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                const isTacoTuesday = new Date(viewYear, viewMonth, day).getDay() === 2;
                const dayPosts = postsByDay[day] ?? [];
                return (
                  <div
                    key={day}
                    className={`min-h-[80px] p-1.5 rounded-lg border transition-colors ${
                      isToday ? "border-primary bg-primary/5" : "border-border/40 hover:border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>
                        {day}
                      </span>
                      {isTacoTuesday && (
                        <span className="text-xs">🌮</span>
                      )}
                    </div>
                    <div className="space-y-0.5">
                      {dayPosts.slice(0, 3).map((post) => (
                        <div
                          key={post.id}
                          className={`text-xs text-white px-1 py-0.5 rounded truncate ${POST_TYPE_COLORS[post.postType] ?? "bg-gray-500"}`}
                          title={post.captionEn}
                        >
                          {post.postType.replace("_", " ")}
                        </div>
                      ))}
                      {dayPosts.length > 3 && (
                        <div className="text-xs text-muted-foreground pl-1">+{dayPosts.length - 3} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(POST_TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm ${color}`} />
              <span className="text-xs text-muted-foreground capitalize">{type.replace("_", " ")}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🌮</span>
            <span className="text-xs text-muted-foreground">Taco Tuesday</span>
          </div>
        </div>

        {/* Upcoming posts list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Posts This Month</CardTitle>
          </CardHeader>
          <CardContent>
            {!posts || posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No posts this month yet</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate("/generate")}>
                  Generate your first post
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {posts.map((post) => (
                  <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${POST_TYPE_COLORS[post.postType] ?? "bg-gray-400"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{post.captionEn}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs h-4">{post.status}</Badge>
                        <Badge variant="outline" className="text-xs h-4">{post.platform}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {post.scheduledAt
                            ? new Date(post.scheduledAt).toLocaleDateString()
                            : new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
