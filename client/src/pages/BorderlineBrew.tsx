import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coffee, Zap } from "lucide-react";

const PLANNED_FEATURES = [
  { icon: "☕", title: "Espresso Drinks", desc: "Lattes, cappuccinos, macchiatos, and more" },
  { icon: "⚡", title: "Energy Drinks", desc: "Red Bull loaded drinks, custom energy blends" },
  { icon: "🧋", title: "Specialty Beverages", desc: "Seasonal drinks, smoothies, and blended creations" },
  { icon: "🌮", title: "Sopris Combo Posts", desc: "Cross-promote coffee with Sopris food items" },
  { icon: "📅", title: "Morning Content Calendar", desc: "Dedicated morning shift social media schedule" },
  { icon: "🎨", title: "Branded Templates", desc: "Borderline Brew & Boost visual identity" },
];

export default function BorderlineBrew() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Coffee size={24} className="text-amber-700" />
              Borderline Brew & Boost
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Coffee shop module — coming soon to Sopris Taqueria
            </p>
          </div>
          <Badge className="bg-amber-500 text-white">Coming Soon</Badge>
        </div>

        {/* Hero card */}
        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center max-w-md mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg">
                <Coffee size={36} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-100">
                Borderline Brew & Boost
              </h2>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-2 leading-relaxed">
                A full-service beverage company offering everything from artisan espresso drinks to 
                Red Bull loaded creations — launching inside Sopris Taqueria at 4 Jacks Casino.
              </p>
              <div className="flex items-center gap-2 mt-4 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Zap size={16} className="text-amber-600" />
                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                  This module will activate automatically when coffee shop details are provided
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Planned features grid */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Planned Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {PLANNED_FEATURES.map((feature) => (
              <Card key={feature.title} className="border-border/50 opacity-75">
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

        {/* Activation instructions */}
        <Card className="border-dashed border-2">
          <CardContent className="pt-5 pb-5">
            <h3 className="text-sm font-semibold mb-2">How to activate this module</h3>
            <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
              <li>Provide the full Borderline Brew & Boost menu (drinks, sizes, prices)</li>
              <li>Share the brand colors, logo, and visual identity</li>
              <li>Confirm the launch date and operating hours</li>
              <li>Decide whether to use a separate Instagram account or post on Sopris's account</li>
              <li>This module will be fully unlocked with its own content calendar and post generator</li>
            </ol>
            <Button variant="outline" size="sm" className="mt-4 gap-2" disabled>
              <Coffee size={14} />
              Module Locked — Details Pending
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
