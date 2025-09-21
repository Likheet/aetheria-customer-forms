import React from "react";
import { Droplets, Sparkles, FlaskRound, Shield, Sun } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ProductRecommendation } from "../services/recommendationEngine";

type RitualStep = {
  id: keyof ProductRecommendation;
  title: string;
  icon: React.ElementType;
  timing: string;
  narrative: string;
  optional?: boolean;
};

const STEPS: RitualStep[] = [
  {
    id: "cleanser",
    title: "Cleanse",
    icon: Droplets,
    timing: "AM & PM",
    narrative: "Sweep away impurities and balance the skin for treatment.",
  },
  {
    id: "coreSerum",
    title: "Target",
    icon: FlaskRound,
    timing: "AM & PM",
    narrative: "Apply the hero active that addresses the priority concern.",
  },
  {
    id: "secondarySerum",
    title: "Support",
    icon: Sparkles,
    timing: "Alternate",
    narrative: "Introduce complementary treatment on evenings that invite it.",
    optional: true,
  },
  {
    id: "moisturizer",
    title: "Fortify",
    icon: Shield,
    timing: "AM & PM",
    narrative: "Seal the ritual with barrier replenishment and lasting comfort.",
  },
  {
    id: "sunscreen",
    title: "Protect",
    icon: Sun,
    timing: "AM only",
    narrative: "Finish with daily UV defense to preserve results.",
  },
];

interface RecommendationDisplayProps {
  recommendation: ProductRecommendation;
  userName?: string;
}

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="rounded-full border border-border/60 bg-surface/80 px-3 py-1 text-xs uppercase tracking-[0.32em] text-muted-foreground/70">
    {children}
  </span>
);

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ recommendation, userName = "Guest" }) => {
  const ritual = STEPS.map((step) => {
    const product = recommendation[step.id];
    return { ...step, product: product?.trim() }; 
  });

  return (
    <div className="space-y-10">
      <header className="space-y-3 text-center md:text-left">
        <Badge className="bg-primary/15 text-primary" variant="primary">
          Personalised Ritual
        </Badge>
        <div className="space-y-2">
          <h2 className="text-gradient-gold text-3xl font-semibold md:text-4xl">
            {userName.split(" ")[0]}'s curated regimen
          </h2>
          <p className="text-sm text-muted-foreground/75 md:max-w-2xl md:text-base">
            Layer each moment with intention. This sequence reflects your diagnostic priorities and lifestyle rhythm.
          </p>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {ritual.map(({ id, title, icon: Icon, timing, narrative, product, optional }) => (
          <Card
            key={id}
            className="group border-border/50 bg-surface/85 transition-transform duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
          >
            <CardHeader className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-foreground/90">{title}</CardTitle>
                    <CardDescription className="text-xs uppercase tracking-[0.28em] text-muted-foreground/60">
                      {timing}
                    </CardDescription>
                  </div>
                </div>
                {optional ? <Pill>Optional</Pill> : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground/80">
              <div className="rounded-[18px] border border-border/40 bg-surface/70 px-4 py-3 text-foreground/90">
                {product ? (
                  <span className="font-medium">{product}</span>
                ) : (
                  <span className="text-muted-foreground/60">Tailor on the fly—no hero selected yet.</span>
                )}
              </div>
              <p>{narrative}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="border-border/50 bg-surface/90">
          <CardHeader className="gap-2">
            <CardTitle className="text-sm uppercase tracking-[0.3em] text-muted-foreground/60">Prologue Tips</CardTitle>
            <CardDescription className="text-muted-foreground/70">
              Small refinements to help the ritual settle effortlessly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground/75">
            <ul className="space-y-2">
              <li>Introduce one new formula at a time and observe for 48 hours.</li>
              <li>Apply textures from the lightest viscosity to the richest.</li>
              <li>Pause 2 minutes between treatment layers to allow absorption.</li>
              <li>Massage along the natural lymph flow to soften puffiness.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-surface/90">
          <CardHeader className="gap-2">
            <CardTitle className="text-sm uppercase tracking-[0.3em] text-muted-foreground/60">Considerations</CardTitle>
            <CardDescription className="text-muted-foreground/70">
              Guardrails that keep the complexion calm and responsive.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground/75">
            <ul className="space-y-2">
              <li>Adjust frequency if you notice stinging, flushing, or tightness.</li>
              <li>Anchor every AM ritual with broad-spectrum SPF before daylight exposure.</li>
              <li>Schedule a professional review if concerns persist beyond 6–8 weeks.</li>
              <li>Store actives away from humidity and direct light to protect potency.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecommendationDisplay;
