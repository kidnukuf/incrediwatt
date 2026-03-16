import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Circle, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// Posting days: Mon=1, Tue=2, Thu=4, Sat=6
const POSTING_DAYS = new Set([1, 2, 4, 6]);

const POST_TYPE_COLORS: Record<string, string> = {
  menu_item: "bg-amber-500",
  special: "bg-green-500",
  event: "bg-purple-500",
  promotion: "bg-orange-500",
  taco_tuesday: "bg-red-500",
  manual: "bg-blue-500",
  borderline_brew: "bg-teal-500",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "text-gray-500",
  scheduled: "text-blue-600",
  published: "text-green-600",
  cancelled: "text-red-500",
};

type ViewMode = "plan" | "month";

/** Get the next 4 weeks of posting slots starting from today */
function getFourWeekSlots(): Date[] {
  const slots: Date[] = [];
  const cursor = new Date();
  cursor.setHours(13, 0, 0, 0); // 1 PM
  // Start from today
  for (let i = 0; i < 28 && slots.length < 16; i++) {
    if (POSTING_DAYS.has(cursor.getDay())) {
      slots.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return slots;
}

export default function Calendar() {
  const [, navigate] = useLocation();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewMode, setViewMode] = useState<ViewMode>("plan");

  // For month view
  const monthStart = useMemo(() => new Date(viewYear, viewMonth, 1).getTime(), [viewYear, viewMonth]);
  const monthEnd = useMemo(() => new Date(viewYear, viewMonth + 1, 0, 23, 59, 59).getTime(), [viewYear, viewMonth]);

  // For 4-week plan view: load 4 weeks from today
  const planStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);
  const planEnd = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 28);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }, []);

  const { data: monthPosts } = trpc.posts.inRange.useQuery(
    { from: monthStart, to: monthEnd },
    { enabled: viewMode === "month" }
  );
  const { data: planPosts } = trpc.posts.inRange.useQuery(
    { from: planStart, to: planEnd },
    { enabled: viewMode === "plan" }
  );

  // Build a map of date string → posts for plan view
  const planPostsByDate = useMemo(() => {
    const map: Record<string, typeof planPosts> = {};
    if (!planPosts) return map;
    planPosts.forEach((post) => {
      const d = post.scheduledAt ? new Date(post.scheduledAt) : new Date(post.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key]!.push(post);
    });
    return map;
  }, [planPosts]);

  // Month view helpers
  const postsByDay = useMemo(() => {
    const map: Record<number, typeof monthPosts> = {};
    if (!monthPosts) return map;
    monthPosts.forEach((post) => {
      const d = post.scheduledAt ? new Date(post.scheduledAt) : new Date(post.createdAt);
      const day = d.getDate();
      if (!map[day]) map[day] = [];
      map[day]!.push(post);
    });
    return map;
  }, [monthPosts]);

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

  const fourWeekSlots = useMemo(() => getFourWeekSlots(), []);

  // Group slots by week
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < fourWeekSlots.length; i += 4) {
      result.push(fourWeekSlots.slice(i, i + 4));
    }
    return result;
  }, [fourWeekSlots]);

  const totalSlots = fourWeekSlots.length;
  const filledSlots = fourWeekSlots.filter((slot) => {
    const key = `${slot.getFullYear()}-${slot.getMonth()}-${slot.getDate()}`;
    return (planPostsByDate[key]?.length ?? 0) > 0;
  }).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Content Calendar</h1>
            <p className="text-muted-foreground text-sm mt-1">Plan and schedule your social media posts</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border overflow-hidden">
              <button
                onClick={() => setViewMode("plan")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "plan" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                4-Week Plan
              </button>
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === "month" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`}
              >
                Month View
              </button>
            </div>
            <Button onClick={() => navigate("/generate")} className="gap-2" size="sm">
              <Sparkles size={14} /> Generate Post
            </Button>
          </div>
        </div>

        {/* ── 4-Week Plan View ── */}
        {viewMode === "plan" && (
          <>
            {/* Progress summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground">Slots Filled</p>
                  <p className="text-2xl font-bold mt-1">{filledSlots}<span className="text-sm font-normal text-muted-foreground">/{totalSlots}</span></p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground">Slots Remaining</p>
                  <p className="text-2xl font-bold mt-1 text-amber-600">{totalSlots - filledSlots}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground">Posting Days</p>
                  <p className="text-sm font-semibold mt-1">Mon · Tue · Thu · Sat</p>
                  <p className="text-xs text-muted-foreground">1:00 PM MST</p>
                </CardContent>
              </Card>
            </div>

            {/* Week-by-week plan */}
            <div className="space-y-4">
              {weeks.map((weekSlots, weekIdx) => {
                const weekStart = weekSlots[0];
                const weekEnd = weekSlots[weekSlots.length - 1];
                const weekLabel = weekStart && weekEnd
                  ? `Week ${weekIdx + 1} · ${SHORT_MONTHS[weekStart.getMonth()]} ${weekStart.getDate()} – ${SHORT_MONTHS[weekEnd.getMonth()]} ${weekEnd.getDate()}`
                  : `Week ${weekIdx + 1}`;

                return (
                  <Card key={weekIdx}>
                    <CardHeader className="pb-2 pt-4">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <CalendarDays size={14} className="text-primary" />
                        {weekLabel}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {weekSlots.map((slot) => {
                          const key = `${slot.getFullYear()}-${slot.getMonth()}-${slot.getDate()}`;
                          const slotPosts = planPostsByDate[key] ?? [];
                          const isFilled = slotPosts.length > 0;
                          const isToday =
                            slot.getDate() === today.getDate() &&
                            slot.getMonth() === today.getMonth() &&
                            slot.getFullYear() === today.getFullYear();
                          const isPast = slot < today;
                          const dayName = DAYS[slot.getDay()];
                          const dateLabel = `${SHORT_MONTHS[slot.getMonth()]} ${slot.getDate()}`;

                          return (
                            <div
                              key={key}
                              className={`rounded-lg border p-3 space-y-2 transition-colors ${
                                isFilled
                                  ? "border-green-500/40 bg-green-50/50 dark:bg-green-950/20"
                                  : isPast
                                  ? "border-border/30 bg-muted/20 opacity-60"
                                  : isToday
                                  ? "border-primary/50 bg-primary/5"
                                  : "border-border/50 hover:border-border"
                              }`}
                            >
                              {/* Slot header */}
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className={`text-xs font-semibold ${isToday ? "text-primary" : ""}`}>{dayName}</p>
                                  <p className="text-xs text-muted-foreground">{dateLabel}</p>
                                </div>
                                {isFilled ? (
                                  <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                                ) : (
                                  <Circle size={16} className={`flex-shrink-0 ${isPast ? "text-muted-foreground/30" : "text-muted-foreground/50"}`} />
                                )}
                              </div>

                              {/* Posts in this slot */}
                              {isFilled ? (
                                <div className="space-y-1">
                                  {slotPosts.slice(0, 2).map((post) => (
                                    <div key={post.id} className="space-y-0.5">
                                      <p className="text-xs line-clamp-2 leading-tight">{post.captionEn}</p>
                                      <div className="flex items-center gap-1 flex-wrap">
                                        <span className={`text-xs font-medium ${STATUS_COLORS[post.status] ?? ""}`}>
                                          {post.status}
                                        </span>
                                        <span className="text-xs text-muted-foreground">·</span>
                                        <span className="text-xs text-muted-foreground">{post.platform}</span>
                                      </div>
                                    </div>
                                  ))}
                                  {slotPosts.length > 2 && (
                                    <p className="text-xs text-muted-foreground">+{slotPosts.length - 2} more</p>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => navigate("/generate")}
                                  className={`w-full text-xs py-1 rounded border border-dashed transition-colors ${
                                    isPast
                                      ? "border-border/20 text-muted-foreground/40 cursor-default"
                                      : "border-primary/30 text-primary/70 hover:border-primary hover:text-primary hover:bg-primary/5"
                                  }`}
                                  disabled={isPast}
                                >
                                  {isPast ? "Missed" : "+ Add post"}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-green-500" />
                <span>Slot filled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Circle size={13} className="text-muted-foreground/50" />
                <span>Slot empty — needs content</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Circle size={13} className="text-muted-foreground/20" />
                <span>Past slot</span>
              </div>
            </div>
          </>
        )}

        {/* ── Month View ── */}
        {viewMode === "month" && (
          <>
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setViewMonth(today.getMonth()); setViewYear(today.getFullYear()); }}
                      className="h-8 text-xs"
                    >
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
                    <div key={d} className={`text-center text-xs font-semibold py-1 ${
                      POSTING_DAYS.has(DAYS.indexOf(d)) ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {d}
                      {POSTING_DAYS.has(DAYS.indexOf(d)) && (
                        <span className="block w-1 h-1 rounded-full bg-primary mx-auto mt-0.5" />
                      )}
                    </div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((day, idx) => {
                    if (!day) return <div key={`empty-${idx}`} className="min-h-[80px]" />;
                    const isToday =
                      day === today.getDate() &&
                      viewMonth === today.getMonth() &&
                      viewYear === today.getFullYear();
                    const dayOfWeek = new Date(viewYear, viewMonth, day).getDay();
                    const isPostingDay = POSTING_DAYS.has(dayOfWeek);
                    const dayPosts = postsByDay[day] ?? [];
                    const isFilled = isPostingDay && dayPosts.length > 0;
                    const isEmpty = isPostingDay && dayPosts.length === 0;

                    return (
                      <div
                        key={day}
                        className={`min-h-[80px] p-1.5 rounded-lg border transition-colors ${
                          isToday
                            ? "border-primary bg-primary/5"
                            : isFilled
                            ? "border-green-500/30 bg-green-50/30 dark:bg-green-950/10"
                            : isEmpty
                            ? "border-amber-400/30 bg-amber-50/20 dark:bg-amber-950/10"
                            : "border-border/30 hover:border-border/60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-semibold ${isToday ? "text-primary" : ""}`}>
                            {day}
                          </span>
                          {isPostingDay && (
                            isFilled
                              ? <CheckCircle2 size={10} className="text-green-500" />
                              : <Circle size={10} className="text-amber-400" />
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
                            <div className="text-xs text-muted-foreground pl-1">+{dayPosts.length - 3}</div>
                          )}
                          {isEmpty && (
                            <button
                              onClick={() => navigate("/generate")}
                              className="text-xs text-amber-600/70 hover:text-amber-600 w-full text-left pl-0.5"
                            >
                              + fill
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Legend */}
            <div className="flex flex-wrap gap-4">
              {Object.entries(POST_TYPE_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded-sm ${color}`} />
                  <span className="text-xs text-muted-foreground capitalize">{type.replace("_", " ")}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-green-500" />
                <span className="text-xs text-muted-foreground">Posting day — filled</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Circle size={12} className="text-amber-400" />
                <span className="text-xs text-muted-foreground">Posting day — needs content</span>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
