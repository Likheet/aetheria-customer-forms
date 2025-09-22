import React, { useMemo, useState } from "react";
import { Droplets, Sparkles, FlaskRound, Shield, Sun, Target, Info, CalendarDays, Moon, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { EnhancedRecommendation } from "../services/recommendationEngine";
import { PRODUCT_DATABASE, type ProductOption } from "../data/productDatabase";

type RitualStep = {
  id: keyof EnhancedRecommendation;
  title: string;
  icon: React.ElementType;
  timing: string;
  narrative: string;
  optional?: boolean;
};

const STEPS: RitualStep[] = [
  {
    id: "cleanser",
    title: "Cleanser",
    icon: Droplets,
    timing: "AM & PM",
    narrative: "Use a gentle cleanser.",
  },
  // coreSerum timing will be overridden dynamically based on serum family
  {
    id: "coreSerum",
    title: "Treatment serum",
    icon: FlaskRound,
    timing: "AM & PM",
    narrative: "Use your primary treatment serum.",
  },
  {
    id: "secondarySerum",
    title: "Alternate serum",
    icon: Sparkles,
    timing: "Alternate",
    narrative: "Use on alternate evenings if included.",
    optional: true,
  },
  {
    id: "moisturizer",
    title: "Moisturizer",
    icon: Shield,
    timing: "AM & PM",
    narrative: "Apply moisturizer to lock in hydration.",
  },
  {
    id: "sunscreen",
    title: "Sunscreen",
    icon: Sun,
    timing: "AM only",
    narrative: "Apply sunscreen in the morning.",
  },
];

interface RecommendationDisplayProps {
  recommendation: EnhancedRecommendation;
  userName?: string;
  onComplete?: () => void;
  onSubmit?: () => void;
  submitting?: boolean;
  onBackToEdit?: () => void;
}

const Pill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="rounded-full border border-border/60 bg-surface/80 px-3 py-1 text-xs uppercase tracking-[0.32em] text-muted-foreground/70">
    {children}
  </span>
);

type PriceMode = 'budget' | 'luxury'

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({ recommendation, userName = "Guest", onComplete, onSubmit, submitting, onBackToEdit }) => {
  const [priceMode, setPriceMode] = useState<PriceMode>('budget')

  // Helpers to pick a product by mode with fallbacks
  const pickByMode = (options: ProductOption[] | undefined, mode: PriceMode): ProductOption | undefined => {
    if (!options || options.length === 0) return undefined
    const byTier = (tier: ProductOption['tier']) => options.find(o => o.tier === tier)
    if (mode === 'budget') {
      return byTier('affordable') || byTier('mid-range') || byTier('premium') || options[0]
    } else {
      return byTier('premium') || byTier('mid-range') || byTier('affordable') || options[0]
    }
  }

  const format = (p?: ProductOption) => p ? `${p.name} (${p.brand})` : ''

  // Compute a display-layer recommendation with SKUs chosen by priceMode using engine _keys
  const displayRec = useMemo(() => {
    const keys = (recommendation as any)._keys || {}
    const out = { ...recommendation }
    try {
      // Cleanser
      if (keys.cleanserType && PRODUCT_DATABASE.cleanser[keys.cleanserType]) {
        const p = pickByMode(PRODUCT_DATABASE.cleanser[keys.cleanserType], priceMode)
        if (p) out.cleanser = format(p)
      }
      // Core serum
      if (keys.core && PRODUCT_DATABASE.serum[keys.core]) {
        const p = pickByMode(PRODUCT_DATABASE.serum[keys.core], priceMode)
        if (p) out.coreSerum = format(p)
      }
      // Secondary serum
      if (keys.secondary && PRODUCT_DATABASE.serum[keys.secondary]) {
        const p = pickByMode(PRODUCT_DATABASE.serum[keys.secondary], priceMode)
        if (p) out.secondarySerum = format(p)
      }
      // Moisturizer
      if (keys.moisturizerType && PRODUCT_DATABASE.moisturizer[keys.moisturizerType]) {
        const p = pickByMode(PRODUCT_DATABASE.moisturizer[keys.moisturizerType], priceMode)
        if (p) out.moisturizer = format(p)
      }
      // Sunscreen (general)
      if (PRODUCT_DATABASE.sunscreen['general']) {
        const p = pickByMode(PRODUCT_DATABASE.sunscreen['general'], priceMode)
        if (p) out.sunscreen = format(p)
      }
    } catch {
      // Fail soft: keep original strings
    }
    return out
  }, [recommendation, priceMode])

  // Derive dynamic timing for core serum using engine keys if available
  const coreKey = (recommendation as any)._keys?.core as string | undefined;
  const dynamicCoreTiming = (() => {
    if (!coreKey) return "AM & PM";
    if (coreKey === 'adapalene' || coreKey === 'retinol') return 'PM only';
    if (coreKey === 'vitamin-c') return 'AM only';
    return 'AM & PM';
  })();

  const ritual = STEPS.map((step) => {
    const product = (displayRec as any)[step.id] as string;
    const timing = step.id === 'coreSerum' ? dynamicCoreTiming : step.timing;
    return { ...step, product: product?.trim(), timing }; 
  });
  const schedule = recommendation.schedule;

  const DAY_LABELS: Record<string, string> = {
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    sun: 'Sun'
  };

  const hasSerum = (steps: Array<{label:string;product:string}>) => steps.some(s => s.label === 'Serum');
  const DAY_ORDER = ['mon','tue','wed','thu','fri','sat','sun'] as const;
  const stepsEqual = (a: Array<{step:number;label:string;product?:string}>, b: Array<{step:number;label:string;product?:string}>) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const x = a[i], y = b[i];
      if (x.step !== y.step) return false;
      if (x.label !== y.label) return false;
      if ((x.product || '') !== (y.product || '')) return false;
    }
    return true;
  };
  const pmFirst = schedule?.pmByDay ? schedule.pmByDay[DAY_ORDER[0]] : undefined;
  const pmUniform = schedule?.pmByDay && pmFirst
    ? DAY_ORDER.every((d) => stepsEqual(schedule.pmByDay[d], pmFirst))
    : false;

  return (
    <div className="space-y-10">
      {/* Price preference toggle */}
      <div className="flex items-center justify-center gap-2">
        <div className="inline-flex rounded-lg border border-border/60 bg-surface/80 overflow-hidden">
          <button
            className={`px-4 py-2 text-sm font-medium ${priceMode==='budget' ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-muted/30'}`}
            onClick={() => setPriceMode('budget')}
          >Budget-friendly</button>
          <button
            className={`px-4 py-2 text-sm font-medium ${priceMode==='luxury' ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-muted/30'}`}
            onClick={() => setPriceMode('luxury')}
          >Luxury</button>
        </div>
      </div>

      <header className="space-y-3 text-center md:text-left">
        <Badge className="bg-primary/15 text-primary" variant="primary">
          Recommendations
        </Badge>
        <div className="space-y-2">
          <h2 className="text-gradient-gold text-3xl font-semibold md:text-4xl">
            {userName.split(" ")[0]}'s recommendations
          </h2>
          <p className="text-sm text-muted-foreground/75 md:max-w-2xl md:text-base">
            Primary focus: <span className="font-semibold text-primary">{recommendation.primaryConcern}</span>.
          </p>
          {recommendation.rationale && (
            <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">{recommendation.rationale}</p>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        {ritual.map(({ id, title, icon: Icon, timing, narrative, product, optional }) => (
          <Card
            key={String(id)}
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

      {schedule && (
        <Card className="border-border/60 bg-surface/90">
          <CardHeader className="gap-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              <CardTitle className="text-sm uppercase tracking-[0.3em] text-muted-foreground/60">Routine Summary</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground/70">
              {pmUniform ? 'AM and PM are the same each day.' : 'AM is daily; PM alternates through the week.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 lg:grid-cols-2">
              {/* AM — always daily */}
              <Card className="border-border/50 bg-surface">
                <CardHeader className="gap-2">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm uppercase tracking-[0.3em] text-muted-foreground/60">AM (Daily)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-2 text-sm text-muted-foreground/80">
                    {schedule.am.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold">{s.step}</span>
                        <div>
                          <span className="text-foreground/90 font-medium">{s.label}</span>
                          {s.product && <span className="text-muted-foreground/70">: {s.product}</span>}
                        </div>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>

              {/* PM — daily or weekly */}
              <Card className="border-border/50 bg-surface">
                <CardHeader className="gap-2">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm uppercase tracking-[0.3em] text-muted-foreground/60">{pmUniform ? 'PM (Daily)' : 'PM (By Day)'}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {pmUniform && pmFirst ? (
                    <ol className="space-y-2 text-sm text-muted-foreground/80">
                      {pmFirst.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted/40 text-xs text-muted-foreground">{s.step}</span>
                          <div>
                            <span className="text-foreground/90 font-medium">{s.label}</span>
                            {s.product && <span className="text-muted-foreground/70">: {s.product}</span>}
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {DAY_ORDER.map((key) => {
                        const steps = schedule.pmByDay[key];
                        const serumNight = hasSerum(steps);
                        return (
                          <div key={String(key)} className={`rounded-[18px] border px-4 py-3 ${serumNight ? 'border-border/40 bg-surface/70' : 'border-amber-200 bg-amber-50/60'}`}>
                            <div className="mb-2 flex items-center justify-between">
                              <span className="text-xs font-semibold tracking-wide text-muted-foreground/80">{DAY_LABELS[String(key)]}</span>
                              {!serumNight && (
                                <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">Rest night</span>
                              )}
                            </div>
                            <ol className="space-y-1 text-sm">
                              {steps.map((s, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-muted-foreground/80">
                                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted/40 text-xs text-muted-foreground">{s.step}</span>
                                  <div>
                                    <span className="text-foreground/90 font-medium">{s.label}</span>
                                    {s.product && <span className="text-muted-foreground/70">: {s.product}</span>}
                                  </div>
                                </li>
                              ))}
                            </ol>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {schedule.customerView?.notes?.length > 0 && (
              <div className="mt-5">
                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader className="gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm uppercase tracking-[0.3em] text-primary/80">Why this plan</CardTitle>
                    </div>
                    <CardDescription className="text-muted-foreground/70">Key constraints from your sensitivity and safety profile.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground/80">
                      {schedule.customerView.notes.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Serums Section */}
      {recommendation.additionalSerums && recommendation.additionalSerums.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="gap-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm uppercase tracking-[0.3em] text-primary/80">Additional Options</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground/70">
              Since you're comfortable using {recommendation.serumCount} serums, consider alternating with:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendation.additionalSerums.map((serum, index) => (
              <div key={index} className="rounded-[18px] border border-primary/20 bg-surface/70 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground/90">{serum}</span>
                </div>
              </div>
            ))}
            <p className="text-sm text-muted-foreground/75 mt-3">
              These can be used on alternate days or evenings to address secondary concerns.
            </p>
          </CardContent>
        </Card>
      )}

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
      
      {(onSubmit || onComplete || onBackToEdit) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6">
          {onSubmit && (
            <button
              onClick={onSubmit}
              disabled={!!submitting}
              className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg text-white ${submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}
            >
              {submitting ? 'Saving…' : 'Submit Consultation'}
            </button>
          )}
          {onBackToEdit && (
            <button
              onClick={onBackToEdit}
              className="px-8 py-3 border border-border/60 rounded-lg font-semibold transition-all duration-300 bg-surface/80 hover:bg-surface text-foreground"
            >
              Back to edit
            </button>
          )}
          {onComplete && (
            <button
              onClick={onComplete}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:from-green-700 hover:to-emerald-700"
            >
              Back to Staff Portal
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RecommendationDisplay;
