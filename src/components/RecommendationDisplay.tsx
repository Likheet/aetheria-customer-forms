import React, { useCallback, useEffect, useState } from "react";
import {
  Droplets,
  Sparkles,
  FlaskRound,
  Shield,
  Sun,
  Target,
  Info,
  CalendarDays,
  Moon,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge, badgeVariants } from "./ui/badge";
import { Button } from "./ui/button";
import { RoutineOptionsResponse, RoutineVariant } from "../services/recommendationEngine";
import { PRODUCT_DATABASE, type ProductOption } from "../data/productDatabase";
import { buildFacialProtocol, type FacialProfile, type FacialStep } from "../data/facialProtocol";
import { cn } from "@/lib/utils";
import type { BandColor } from "../data/concernMatrix";

// Types and Constants
type RoutineStepKey = "cleanser" | "coreSerum" | "secondarySerum" | "moisturizer" | "sunscreen";
type PriceMode = "budget" | "luxury";
type ViewMode = "routine" | "facial";

const DAY_LABELS: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };
const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const BAND_BADGE_STYLES: Record<BandColor, string> = {
  blue: "bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-900/60 dark:text-blue-100 dark:border-blue-500/60",
  green: "bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-100 dark:border-emerald-500/60",
  yellow: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/60 dark:text-amber-100 dark:border-amber-500/60",
  red: "bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-900/60 dark:text-rose-100 dark:border-rose-500/60",
};

const getBandBadgeClasses = (band: BandColor) => BAND_BADGE_STYLES[band] ?? BAND_BADGE_STYLES.blue;
const formatBandLabel = (band: BandColor) => `${band.charAt(0).toUpperCase()}${band.slice(1)}`;

// Main Component
interface RecommendationDisplayProps {
  recommendation: RoutineOptionsResponse;
  userName?: string;
  onComplete?: () => void;
  onSubmit?: () => void;
  submitting?: boolean;
  onBackToEdit?: () => void;
  onRoutineSelect?: (routine: RoutineVariant, index: number) => void;
  clientProfile?: FacialProfile;
}

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({
  recommendation,
  userName = "Guest",
  onComplete,
  onSubmit,
  submitting,
  onBackToEdit,
  onRoutineSelect,
  clientProfile,
}) => {
  const routines = recommendation.routines;
  const initialIndex = routines.length ? Math.min(recommendation.selectedIndex ?? 0, routines.length - 1) : 0;

  const [priceMode, setPriceMode] = useState<PriceMode>("budget");
  const [viewMode, setViewMode] = useState<ViewMode>("routine");
  const [expandedIndex, setExpandedIndex] = useState(initialIndex);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  useEffect(() => {
    if (!routines.length) return;
    const nextIndex = Math.min(recommendation.selectedIndex ?? 0, routines.length - 1);
    setSelectedIndex(nextIndex);
    setExpandedIndex(nextIndex);
  }, [recommendation.selectedIndex, routines.length]);

  useEffect(() => {
    if (!routines.length || selectedIndex < 0 || selectedIndex >= routines.length) return;
    if (recommendation.selectedIndex === selectedIndex) return;
    onRoutineSelect?.(routines[selectedIndex], selectedIndex);
  }, [recommendation.selectedIndex, onRoutineSelect, routines, selectedIndex]);

  const activeRoutine = routines[selectedIndex] ?? routines[0];
  const facialSteps = clientProfile ? buildFacialProtocol(clientProfile) : [];

  if (!routines.length || !activeRoutine) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>No Routines Available</CardTitle>
          <CardDescription>No routines could be generated for this consultation.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleToggleExpand = (index: number) => setExpandedIndex(prev => (prev === index ? -1 : index));
  const handleSelectRoutine = (index: number) => {
    const routine = routines[index];
    if (!routine || !routine.available) return;
    setSelectedIndex(index);
    setExpandedIndex(index);
  };

  return (
    <div className="space-y-8">
      <RecommendationTabs
        mode={priceMode}
        onModeChange={setPriceMode}
        viewMode={viewMode}
        onViewChange={setViewMode}
      />
      <RecommendationHeader routine={activeRoutine} userName={userName} />

      {viewMode === "facial" ? (
        facialSteps.length > 0 ? (
          <FacialProtocolPanel steps={facialSteps} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Facial Treatment Products</CardTitle>
              <CardDescription>No facial protocol available for this consultation.</CardDescription>
            </CardHeader>
          </Card>
        )
      ) : (
        <div className="space-y-4">
          {routines.map((routine, index) => (
            <RoutineCard
              key={routine.type}
              routine={routine}
              priceMode={priceMode}
              isExpanded={expandedIndex === index}
              isSelected={selectedIndex === index}
              onToggleExpand={() => handleToggleExpand(index)}
              onSelect={() => handleSelectRoutine(index)}
            />
          ))}
        </div>
      )}

      {viewMode === "routine" && <GeneralAdvice />}

      <ActionButtons
        onSubmit={onSubmit}
        onComplete={onComplete}
        onBackToEdit={onBackToEdit}
        submitting={submitting}
      />
    </div>
  );
};

// Sub-components
const RecommendationTabs: React.FC<{
  mode: PriceMode;
  onModeChange: (mode: PriceMode) => void;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}> = ({ mode, onModeChange, viewMode, onViewChange }) => {
  const buildVariant = (tab: ViewMode | PriceMode) => {
    if (tab === 'facial') return viewMode === 'facial' ? 'default' : 'ghost';
    const isSelected = viewMode === 'routine' && mode === tab;
    return isSelected ? 'default' : 'ghost';
  };

  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex rounded-full bg-muted p-1">
        <Button
          variant={buildVariant('budget')}
          size="sm"
          className="rounded-full px-4"
          onClick={() => {
            onViewChange('routine');
            onModeChange('budget');
          }}
        >
          Budget-Friendly
        </Button>
        <Button
          variant={buildVariant('luxury')}
          size="sm"
          className="rounded-full px-4"
          onClick={() => {
            onViewChange('routine');
            onModeChange('luxury');
          }}
        >
          Luxury
        </Button>
        <Button
          variant={buildVariant('facial')}
          size="sm"
          className="rounded-full px-4"
          onClick={() => onViewChange('facial')}
        >
          Facial
        </Button>
      </div>
    </div>
  );
};

const RecommendationHeader: React.FC<{ routine: RoutineVariant; userName: string }> = ({ routine, userName }) => {
  const hasAlsoConsidered = Boolean(routine.alsoConsidered?.length);
  const fallbackRationale = hasAlsoConsidered ? undefined : routine.rationale;

  return (
    <header className="space-y-2 text-center">
      <h1 className="text-3xl font-bold tracking-tight">
        {userName.split(" ")[0]}'s Recommendations
      </h1>
      <p className="text-muted-foreground">
        Selected: <span className="font-semibold text-primary">{routine.label}</span>
      </p>
      {(hasAlsoConsidered || fallbackRationale) && (
        <div className="mx-auto max-w-3xl">
          <Card className="bg-muted border-border text-muted-foreground dark:bg-surface-900 dark:border-border/40">
            <CardContent className="pt-1.5 pb-1 px-4">
              <div className="flex items-center gap-3 text-left min-h-[40px]">
                <Info className="h-4 w-4 text-muted-foreground/70 flex-shrink-0 self-center" />
                <div className="flex-1">
                  {hasAlsoConsidered && (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                        Also considered
                      </p>
                      <div className="flex flex-wrap gap-2 mt-0.5">
                        {routine.alsoConsidered!.map(concern => (
                          <span
                            key={`${concern.concern}-${concern.band}-${concern.subtype ?? "none"}`}
                            className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground border-border")}
                          >
                            {concern.label}
                            <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                              {formatBandLabel(concern.band)}
                            </span>
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                  {fallbackRationale && <p className="text-sm mt-1">{fallbackRationale}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </header>
  );
};

const RoutineCard: React.FC<{
  routine: RoutineVariant;
  priceMode: PriceMode;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
}> = ({ routine, priceMode, isExpanded, isSelected, onToggleExpand, onSelect }) => {
  const isUnavailable = !routine.available;

  return (
    <Card className={cn("transition-all", isExpanded && "shadow-lg", isUnavailable && "opacity-60")}>
      <CardHeader className="cursor-pointer" onClick={onToggleExpand}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <CardTitle>{routine.label}</CardTitle>
              {routine.recommended && <Badge variant="secondary" className="gap-1"><Star className="h-3 w-3" /> Recommended</Badge>}
              {isSelected && <Badge variant="default">Selected</Badge>}
            </div>
            <CardDescription>{routine.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant="outline">Serums: {routine.serumCount}</Badge>
            <IrritationBadge risk={routine.irritationRisk} />
            {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
          </div>
        </div>
        {isUnavailable && routine.conflictReason && (
          <p className="text-sm text-destructive pt-2">{routine.conflictReason}</p>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6 pt-4 border-t">
          <RitualDisplay routine={routine} priceMode={priceMode} />
          {routine.schedule && <ScheduleDisplay schedule={routine.schedule} />}
          {routine.additionalSerums?.length && <AdditionalSerumsDisplay serums={routine.additionalSerums} serumCount={routine.serumCount} />}
          <div className="pt-2">
            <Button onClick={onSelect} disabled={isUnavailable}>
              {isSelected ? "Currently Selected" : "Use this Routine"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const IrritationBadge: React.FC<{ risk: RoutineVariant["irritationRisk"] }> = ({ risk }) => {
  const variant = {
    low: "success",
    moderate: "warning",
    higher: "destructive",
  }[risk] as "success" | "warning" | "destructive";

  return <Badge variant={variant}>Irritation: {risk}</Badge>;
};

const RitualDisplay: React.FC<{ routine: RoutineVariant; priceMode: PriceMode }> = ({ routine, priceMode }) => {
  const displayRoutine = projectRoutine(routine, priceMode);
  const ritualSteps = buildRitualSteps(routine, displayRoutine);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {ritualSteps.map(({ id, title, icon: Icon, timing, product, optional }) => (
        <Card key={id} className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <CardDescription>{timing}</CardDescription>
                </div>
              </div>
              {optional && <Badge variant="outline">Optional</Badge>}
            </div>
          </CardHeader>
          <CardContent className="flex-grow text-sm">
            <p className="font-medium text-foreground">{product || "Not specified"}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ScheduleDisplay: React.FC<{ schedule: RoutineVariant['schedule'] }> = ({ schedule }) => {
  if (!schedule) return null;
  const pmFirst = schedule.pmByDay?.[DAY_ORDER[0]];
  const pmUniform = schedule.pmByDay && pmFirst ? DAY_ORDER.every(day => stepsEqual(schedule.pmByDay[day], pmFirst)) : false;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Schedule</CardTitle>
        <CardDescription>
          {pmUniform ? "AM and PM routines are the same each day." : "AM is daily; PM alternates through the week."}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-2">
        <RoutineList title="AM (Daily)" icon={Sun} steps={schedule.am} />
        {pmUniform && pmFirst ? (
          <RoutineList title="PM (Daily)" icon={Moon} steps={pmFirst} />
        ) : (
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Moon className="h-4 w-4 text-primary" /> PM (By Day)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DAY_ORDER.map(day => {
                const steps = schedule.pmByDay[day];
                const isRest = !steps.some(s => s.label === "Serum");
                return (
                  <div key={day} className="p-3 rounded-md border bg-muted/50">
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-semibold text-xs">{DAY_LABELS[day]}</p>
                      {isRest && <Badge variant="warning" className="text-xs">Rest</Badge>}
                    </div>
                    <ol className="space-y-1.5 text-sm">
                      {steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">{step.step}</span>
                          <span className="flex-1">{step.label}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const RoutineList: React.FC<{ title: string; icon: React.ElementType; steps: any[] }> = ({ title, icon: Icon, steps }) => (
  <div className="space-y-4">
    <h3 className="font-semibold flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /> {title}</h3>
    <ol className="space-y-2 text-sm">
      {steps.map((step, idx) => (
        <li key={idx} className="flex items-start gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{step.step}</span>
          <div>
            <p className="font-medium text-foreground">{step.label}</p>
            {step.product && <p className="text-muted-foreground">{step.product}</p>}
          </div>
        </li>
      ))}
    </ol>
  </div>
);

const AdditionalSerumsDisplay: React.FC<{ serums: string[], serumCount: number }> = ({ serums, serumCount }) => (
  <Card className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-200">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4" /> Additional Options</CardTitle>
      <CardDescription className="text-amber-700 dark:text-amber-300">
        Since this plan uses {serumCount} serums, consider alternating with:
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-2">
      {serums.map((serum, idx) => (
        <div key={idx} className="flex items-center gap-2 text-sm font-medium">
          <Droplets className="h-4 w-4" />
          <span>{serum}</span>
        </div>
      ))}
    </CardContent>
  </Card>
);

const GeneralAdvice: React.FC = () => (
  <div className="grid gap-6 md:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle>Prologue Tips</CardTitle>
        <CardDescription>Small refinements to help the ritual settle effortlessly.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Introduce one new formula at a time and observe for 48 hours.</li>
          <li>Apply textures from the lightest viscosity to the richest.</li>
          <li>Pause 2 minutes between treatment layers to allow absorption.</li>
          <li>Massage along the natural lymph flow to soften puffiness.</li>
        </ul>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Considerations</CardTitle>
        <CardDescription>Guardrails that keep the complexion calm and responsive.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Adjust frequency if you notice stinging, flushing, or tightness.</li>
          <li>Anchor every AM ritual with broad-spectrum SPF before daylight exposure.</li>
          <li>Schedule a professional review if concerns persist beyond 6–8 weeks.</li>
          <li>Store actives away from humidity and direct light to protect potency.</li>
        </ul>
      </CardContent>
    </Card>
  </div>
);

const FacialProtocolPanel: React.FC<{ steps: FacialStep[] }> = ({ steps }) => (
  <section className="space-y-6">
    <Card className="border-primary/10 bg-card">
      <CardHeader>
        <CardTitle>Facial Treatment Products</CardTitle>
        <CardDescription>Exactly what we’ll use in the cabin facial, tailored from the intake.</CardDescription>
      </CardHeader>
    </Card>
    <div className="grid gap-4 md:grid-cols-2">
      {steps.map(step => (
        <div
          key={step.step}
          className={cn(
            "rounded-2xl border bg-gradient-to-br from-white to-muted/30 p-5 shadow-sm transition hover:shadow-md",
            step.skipped && "opacity-60"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Step {step.step} · {step.title}
              </p>
              <h3 className="mt-1 text-xl font-semibold leading-tight text-foreground">{step.product}</h3>
              <p className="text-sm text-muted-foreground">{step.productType}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="secondary" className="rounded-full">
                {step.productType}
              </Badge>
              {step.skipped && (
                <span className="text-xs font-semibold uppercase tracking-wide text-amber-600">Skip</span>
              )}
            </div>
          </div>
          {step.remarks && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.remarks}</p>
          )}
        </div>
      ))}
    </div>
  </section>
);

const ActionButtons: React.FC<Pick<RecommendationDisplayProps, 'onSubmit' | 'onComplete' | 'onBackToEdit' | 'submitting'>> = ({
  onSubmit,
  onComplete,
  onBackToEdit,
  submitting,
}) => {
  if (!onSubmit && !onComplete && !onBackToEdit) return null;
  return (
    <div className="flex flex-col items-center justify-center gap-3 pt-6 sm:flex-row">
      {onSubmit && <Button size="lg" onClick={onSubmit} disabled={submitting}>{submitting ? "Saving..." : "Submit Consultation"}</Button>}
      {onBackToEdit && <Button size="lg" variant="outline" onClick={onBackToEdit}>Back to Edit</Button>}
      {onComplete && <Button size="lg" variant="secondary" onClick={onComplete}>Back to Staff Portal</Button>}
    </div>
  );
};

// Helper functions (to be moved to a separate file ideally)
const formatProduct = (product?: ProductOption) => (product ? `${product.name} (${product.brand})` : "");

const pickByMode = (options: ProductOption[] | undefined, mode: PriceMode) => {
  if (!options || options.length === 0) return undefined;
  const byTier = (tier: ProductOption["tier"]) => options.find(option => option.tier === tier);
  if (mode === "budget") {
    return byTier("affordable") || byTier("mid-range") || byTier("premium") || options[0];
  }
  return byTier("premium") || byTier("mid-range") || byTier("affordable") || options[0];
};

const projectRoutine = (routine: RoutineVariant, priceMode: PriceMode): RoutineVariant => {
  const keys = routine._keys ?? {};
  const projected: RoutineVariant = { ...routine };
  const getProduct = (key: string | undefined, db: Record<string, ProductOption[]>) => {
    if (key && db[key]) return pickByMode(db[key], priceMode);
    return undefined;
  };

  try {
    projected.cleanser = formatProduct(getProduct(keys.cleanserType, PRODUCT_DATABASE.cleanser)) || routine.cleanser;
    projected.coreSerum = formatProduct(getProduct(keys.core, PRODUCT_DATABASE.serum)) || routine.coreSerum;
    projected.secondarySerum = formatProduct(getProduct(keys.secondary, PRODUCT_DATABASE.serum)) || routine.secondarySerum;
    projected.tertiarySerum = formatProduct(getProduct(keys.tertiary, PRODUCT_DATABASE.serum)) || routine.tertiarySerum;
    projected.moisturizer = formatProduct(getProduct(keys.moisturizerType, PRODUCT_DATABASE.moisturizer)) || routine.moisturizer;
    projected.sunscreen = formatProduct(getProduct("general", PRODUCT_DATABASE.sunscreen)) || routine.sunscreen;
  } catch (e) {
    console.warn('Error projecting routine:', e);
  }
  return projected;
};

const buildRitualSteps = (routine: RoutineVariant, displayRoutine: RoutineVariant) => {
  const coreKey = routine._keys?.core;
  const dynamicCoreTiming = (() => {
    if (!coreKey) return "AM & PM";
    if (coreKey === "adapalene" || coreKey === "retinol") return "PM only";
    if (coreKey === "vitamin-c") return "AM only";
    return "AM & PM";
  })();

  const RITUAL_STEPS = [
    { id: "cleanser", title: "Cleanser", icon: Droplets, timing: "AM & PM" },
    { id: "coreSerum", title: "Treatment Serum", icon: FlaskRound, timing: dynamicCoreTiming },
    { id: "secondarySerum", title: "Alternate Serum", icon: Sparkles, timing: "Alternate", optional: true },
    { id: "moisturizer", title: "Moisturizer", icon: Shield, timing: "AM & PM" },
    { id: "sunscreen", title: "Sunscreen", icon: Sun, timing: "AM only" },
  ];

  return RITUAL_STEPS.map(step => ({
    ...step,
    product: displayRoutine[step.id as RoutineStepKey]?.trim(),
  })).filter(step => step.product);
};

const stepsEqual = (a: any[], b: any[]) => {
  if (a.length !== b.length) return false;
  return a.every((step, idx) => {
    const other = b[idx];
    return step.step === other.step && step.label === other.label && (step.product || "") === (other.product || "");
  });
};

export default RecommendationDisplay;
