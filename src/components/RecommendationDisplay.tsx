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
  AlertTriangle,
  Star,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { RoutineOptionsResponse, RoutineVariant } from "../services/recommendationEngine";
import { PRODUCT_DATABASE, type ProductOption } from "../data/productDatabase";

type RoutineStepKey = "cleanser" | "coreSerum" | "secondarySerum" | "moisturizer" | "sunscreen";

type RitualStep = {
  id: RoutineStepKey;
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

type PriceMode = "budget" | "luxury";

const DAY_LABELS: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const RISK_BADGE_STYLES: Record<RoutineVariant["irritationRisk"], string> = {
  low: "bg-emerald-100 text-emerald-700",
  moderate: "bg-amber-100 text-amber-700",
  higher: "bg-rose-100 text-rose-700",
};

type ScheduleStep = { step: number; label: string; product?: string };

const hasSerumStep = (steps: ScheduleStep[]) => steps.some(step => step.label === "Serum");

const stepsEqual = (a: ScheduleStep[], b: ScheduleStep[]) => {
  if (a.length !== b.length) return false;
  return a.every((step, idx) => {
    const other = b[idx];
    return step.step === other.step && step.label === other.label && (step.product || "") === (other.product || "");
  });
};

interface RecommendationDisplayProps {
  recommendation: RoutineOptionsResponse;
  userName?: string;
  onComplete?: () => void;
  onSubmit?: () => void;
  submitting?: boolean;
  onBackToEdit?: () => void;
  onRoutineSelect?: (routine: RoutineVariant, index: number) => void;
}

const RecommendationDisplay: React.FC<RecommendationDisplayProps> = ({
  recommendation,
  userName = "Guest",
  onComplete,
  onSubmit,
  submitting,
  onBackToEdit,
  onRoutineSelect,
}) => {
  const routines = recommendation.routines;
  const initialIndex = routines.length
    ? Math.min(recommendation.selectedIndex ?? 0, routines.length - 1)
    : 0;

  const [priceMode, setPriceMode] = useState<PriceMode>("budget");
  const [expandedIndex, setExpandedIndex] = useState(initialIndex);
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  useEffect(() => {
    if (!routines.length) return;
    const nextIndex = Math.min(recommendation.selectedIndex ?? 0, routines.length - 1);
    setSelectedIndex(nextIndex);
    setExpandedIndex(nextIndex);
  }, [recommendation.selectedIndex, routines.length, routines]);

  useEffect(() => {
    if (!routines.length) return;
    if (selectedIndex < 0 || selectedIndex >= routines.length) return;
    if (onRoutineSelect) {
      onRoutineSelect(routines[selectedIndex], selectedIndex);
    }
  }, [onRoutineSelect, routines, selectedIndex]);

  const pickByMode = useCallback((options: ProductOption[] | undefined, mode: PriceMode) => {
    if (!options || options.length === 0) return undefined;
    const byTier = (tier: ProductOption["tier"]) => options.find(option => option.tier === tier);
    if (mode === "budget") {
      return byTier("affordable") || byTier("mid-range") || byTier("premium") || options[0];
    }
    return byTier("premium") || byTier("mid-range") || byTier("affordable") || options[0];
  }, []);

  const formatProduct = (product?: ProductOption) => (product ? `${product.name} (${product.brand})` : "");

  const projectRoutine = useCallback(
    (routine: RoutineVariant): RoutineVariant => {
      const keys = routine._keys ?? {};
      const projected: RoutineVariant = { ...routine };

      try {
        if (keys.cleanserType && PRODUCT_DATABASE.cleanser[keys.cleanserType]) {
          const product = pickByMode(PRODUCT_DATABASE.cleanser[keys.cleanserType], priceMode);
          if (product) projected.cleanser = formatProduct(product);
        }
        if (keys.core && PRODUCT_DATABASE.serum[keys.core]) {
          const product = pickByMode(PRODUCT_DATABASE.serum[keys.core], priceMode);
          if (product) projected.coreSerum = formatProduct(product);
        }
        if (keys.secondary && PRODUCT_DATABASE.serum[keys.secondary]) {
          const product = pickByMode(PRODUCT_DATABASE.serum[keys.secondary], priceMode);
          if (product) projected.secondarySerum = formatProduct(product);
        }
        if (keys.tertiary && PRODUCT_DATABASE.serum[keys.tertiary]) {
          const product = pickByMode(PRODUCT_DATABASE.serum[keys.tertiary], priceMode);
          if (product) projected.tertiarySerum = formatProduct(product);
        }
        if (keys.moisturizerType && PRODUCT_DATABASE.moisturizer[keys.moisturizerType]) {
          const product = pickByMode(PRODUCT_DATABASE.moisturizer[keys.moisturizerType], priceMode);
          if (product) projected.moisturizer = formatProduct(product);
        }
        if (PRODUCT_DATABASE.sunscreen["general"]) {
          const product = pickByMode(PRODUCT_DATABASE.sunscreen["general"], priceMode);
          if (product) projected.sunscreen = formatProduct(product);
        }
      } catch {
        // Fail soft: keep original strings
      }

      return projected;
    },
    [pickByMode, priceMode]
  );

  const buildRitualSteps = useCallback(
    (routine: RoutineVariant, displayRoutine: RoutineVariant) => {
      const coreKey = routine._keys?.core;
      const dynamicCoreTiming = (() => {
        if (!coreKey) return "AM & PM";
        if (coreKey === "adapalene" || coreKey === "retinol") return "PM only";
        if (coreKey === "vitamin-c") return "AM only";
        return "AM & PM";
      })();

      return STEPS.map(step => {
        const product = displayRoutine[step.id as RoutineStepKey];
        const timing = step.id === "coreSerum" ? dynamicCoreTiming : step.timing;
        return { ...step, product: product?.trim(), timing };
      });
    },
    []
  );

  const activeRoutine = routines[selectedIndex] ?? routines[0];

  if (!routines.length || !activeRoutine) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-surface/70 p-6 text-center text-muted-foreground">
        No routines available for this consultation.
      </div>
    );
  }

  const handleToggleExpand = (index: number) => {
    setExpandedIndex(prev => (prev === index ? -1 : index));
  };

  const handleSelectRoutine = (index: number) => {
    const routine = routines[index];
    if (!routine || !routine.available) return;
    setSelectedIndex(index);
    setExpandedIndex(index);
    if (onRoutineSelect) onRoutineSelect(routine, index);
  };

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-center gap-2">
        <div className="inline-flex overflow-hidden rounded-lg border border-border/60 bg-surface/80">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${priceMode === "budget" ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted/30"}`}
            onClick={() => setPriceMode("budget")}
          >
            Budget-friendly
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${priceMode === "luxury" ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-muted/30"}`}
            onClick={() => setPriceMode("luxury")}
          >
            Luxury
          </button>
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
            Currently selected: <span className="font-semibold text-primary">{activeRoutine.label}</span> · Primary focus: {activeRoutine.primaryConcern}
          </p>
          {activeRoutine.rationale && (
            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/10 p-4">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">{activeRoutine.rationale}</p>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="space-y-6">
        {routines.map((routine, index) => {
          const displayRoutine = projectRoutine(routine);
          const ritual = buildRitualSteps(routine, displayRoutine);
          const schedule = routine.schedule;
          const isExpanded = expandedIndex === index;
          const isSelected = selectedIndex === index;
          const isUnavailable = !routine.available;

          const pmFirst = schedule?.pmByDay ? schedule.pmByDay[DAY_ORDER[0]] : undefined;
          const pmUniform = schedule?.pmByDay && pmFirst
            ? DAY_ORDER.every(day => stepsEqual(schedule.pmByDay[day], pmFirst))
            : false;

          return (
            <Card
              key={routine.type}
              className={`border-border/60 bg-surface/90 transition-shadow duration-300 ${isExpanded ? "shadow-glow" : ""} ${isUnavailable ? "opacity-70" : ""}`}
            >
              <CardHeader className="p-0">
                <button
                  type="button"
                  onClick={() => handleToggleExpand(index)}
                  className="flex w-full flex-col gap-3 px-6 py-5 text-left"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg text-foreground/90">{routine.label}</CardTitle>
                        {routine.recommended && (
                          <Badge className="flex items-center gap-1 bg-primary/15 text-primary" variant="outline">
                            <Star className="h-3 w-3" /> Recommended
                          </Badge>
                        )}
                        {isSelected && (
                          <Badge className="bg-emerald-100 text-emerald-700">
                            Selected
                          </Badge>
                        )}
                        {isUnavailable && (
                          <Badge className="bg-rose-100 text-rose-700">
                            Unavailable
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm text-muted-foreground/70">
                        {routine.description}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-muted/40 text-foreground/80">
                        Serums: {routine.serumCount}
                      </Badge>
                      <Badge className={RISK_BADGE_STYLES[routine.irritationRisk]}>
                        Irritation: {routine.irritationRisk}
                      </Badge>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                    </div>
                  </div>
                  {isUnavailable && routine.conflictReason && (
                    <p className="text-sm text-rose-600">
                      {routine.conflictReason}
                    </p>
                  )}
                </button>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-8">
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
                            {optional ? <span className="rounded-full border border-border/60 bg-surface/80 px-3 py-1 text-xs uppercase tracking-[0.32em] text-muted-foreground/70">Optional</span> : null}
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
                          <CalendarDays className="h-5 w-5 text-primary" />
                          <CardTitle className="text-sm uppercase tracking-[0.3em] text-muted-foreground/60">
                            Routine Summary
                          </CardTitle>
                        </div>
                        <CardDescription className="text-muted-foreground/70">
                          {pmUniform ? "AM and PM are the same each day." : "AM is daily; PM alternates through the week."}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-5 lg:grid-cols-2">
                          <Card className="border-border/50 bg-surface">
                            <CardHeader className="gap-2">
                              <div className="flex items-center gap-2">
                                <Sun className="h-4 w-4 text-primary" />
                                <CardTitle className="text-sm uppercase tracking-[0.3em] text-muted-foreground/60">
                                  AM (Daily)
                                </CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <ol className="space-y-2 text-sm text-muted-foreground/80">
                                {schedule.am.map((step, idx) => (
                                  <li key={idx} className="flex items-start gap-3">
                                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{step.step}</span>
                                    <div>
                                      <span className="font-medium text-foreground/90">{step.label}</span>
                                      {step.product && <span className="text-muted-foreground/70">: {step.product}</span>}
                                    </div>
                                  </li>
                                ))}
                              </ol>
                            </CardContent>
                          </Card>

                          <Card className="border-border/50 bg-surface">
                            <CardHeader className="gap-2">
                              <div className="flex items-center gap-2">
                                <Moon className="h-4 w-4 text-primary" />
                                <CardTitle className="text-sm uppercase tracking-[0.3em] text-muted-foreground/60">
                                  {pmUniform ? "PM (Daily)" : "PM (By Day)"}
                                </CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {pmUniform && pmFirst ? (
                                <div className="space-y-3 text-sm text-muted-foreground/80">
                                  <div className="flex items-center justify-between rounded-xl bg-muted/30 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">
                                    <span>PM Routine</span>
                                    <span className="text-primary/80">
                                      {typeof schedule.nightlyCost?.[DAY_ORDER[0]] === "number"
                                        ? `${schedule.nightlyCost?.[DAY_ORDER[0]]} units`
                                        : "—"}
                                    </span>
                                  </div>
                                  <ol className="space-y-2">
                                    {pmFirst.map((step, idx) => (
                                      <li key={idx} className="flex items-start gap-3">
                                        <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted/40 text-xs text-muted-foreground">{step.step}</span>
                                        <div>
                                          <span className="font-medium text-foreground/90">{step.label}</span>
                                          {step.product && <span className="text-muted-foreground/70">: {step.product}</span>}
                                        </div>
                                      </li>
                                    ))}
                                  </ol>
                                  {schedule.nightlyNotes?.[DAY_ORDER[0]]?.length ? (
                                    <ul className="list-disc space-y-1 rounded-lg bg-muted/20 px-4 py-2 text-xs text-muted-foreground/70">
                                      {schedule.nightlyNotes[DAY_ORDER[0]].map((note, idx) => (
                                        <li key={idx}>{note}</li>
                                      ))}
                                    </ul>
                                  ) : null}
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  {DAY_ORDER.map(day => {
                                    const steps = schedule.pmByDay[day];
                                    const serumNight = hasSerumStep(steps);
                                    const nightlyCost = typeof schedule.nightlyCost?.[day] === "number" ? schedule.nightlyCost?.[day] : undefined;
                                    const nightlyNotes = schedule.nightlyNotes?.[day] ?? [];
                                    return (
                                      <div
                                        key={day}
                                        className={`rounded-[18px] border px-4 py-3 ${serumNight ? "border-border/40 bg-surface/70" : "border-amber-200 bg-amber-50/60"}`}
                                      >
                                        <div className="mb-2 flex items-center justify-between">
                                          <span className="text-xs font-semibold tracking-wide text-muted-foreground/80">{DAY_LABELS[day]}</span>
                                          <div className="flex items-center gap-2 text-[11px] font-semibold text-primary/80">
                                            {typeof nightlyCost === "number" && (
                                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary/80">{nightlyCost} units</span>
                                            )}
                                            {!serumNight && (
                                              <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                                Rest night
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <ol className="space-y-1 text-sm">
                                          {steps.map((step, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-muted-foreground/80">
                                              <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-muted/40 text-xs text-muted-foreground">{step.step}</span>
                                              <div>
                                                <span className="font-medium text-foreground/90">{step.label}</span>
                                                {step.product && <span className="text-muted-foreground/70">: {step.product}</span>}
                                              </div>
                                            </li>
                                          ))}
                                        </ol>
                                        {nightlyNotes.length ? (
                                          <ul className="mt-2 list-disc space-y-1 rounded-lg bg-muted/20 px-4 py-2 text-xs text-muted-foreground/70">
                                            {nightlyNotes.map((note, idx) => (
                                              <li key={idx}>{note}</li>
                                            ))}
                                          </ul>
                                        ) : null}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        {schedule.customerView?.notes?.length ? (
                          <div className="mt-5">
                            <Card className="border-primary/30 bg-primary/5">
                              <CardHeader className="gap-2">
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-primary" />
                                  <CardTitle className="text-sm uppercase tracking-[0.3em] text-primary/80">
                                    Why this plan
                                  </CardTitle>
                                </div>
                                <CardDescription className="text-muted-foreground/70">
                                  Key constraints from sensitivity and safety profile.
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground/80">
                                  {schedule.customerView.notes.map((note, idx) => (
                                    <li key={idx}>{note}</li>
                                  ))}
                                </ul>
                              </CardContent>
                            </Card>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  )}

                  {routine.additionalSerums && routine.additionalSerums.length > 0 && (
                    <Card className="border-primary/30 bg-primary/5">
                      <CardHeader className="gap-2">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm uppercase tracking-[0.3em] text-primary/80">
                            Additional options
                          </CardTitle>
                        </div>
                        <CardDescription className="text-muted-foreground/70">
                          Since this plan uses {routine.serumCount} serums, consider alternating with:
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {routine.additionalSerums.map((serum, idx) => (
                          <div key={idx} className="rounded-[18px] border border-primary/20 bg-surface/70 px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Droplets className="h-4 w-4 text-primary" />
                              <span className="font-medium text-foreground/90">{serum}</span>
                            </div>
                          </div>
                        ))}
                        <p className="mt-3 text-sm text-muted-foreground/75">
                          Alternate these serums on opposite evenings to keep the skin balanced.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleSelectRoutine(index)}
                      disabled={isUnavailable}
                      className={`rounded-lg px-6 py-2 text-sm font-semibold transition-all ${
                        isUnavailable
                          ? "cursor-not-allowed bg-gray-300 text-gray-600"
                          : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700"
                      }`}
                    >
                      {isUnavailable ? "Unavailable" : "Use this routine"}
                    </button>
                    {isSelected && (
                      <span className="text-sm font-medium text-primary">
                        Currently selected
                      </span>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
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

      {(onSubmit || onComplete || onBackToEdit) && (
        <div className="flex flex-col items-center justify-center gap-3 pt-6 sm:flex-row">
          {onSubmit && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!!submitting}
              className={`rounded-lg px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 ${
                submitting
                  ? "cursor-not-allowed bg-gray-400"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              }`}
            >
              {submitting ? "Saving…" : "Submit Consultation"}
            </button>
          )}
          {onBackToEdit && (
            <button
              type="button"
              onClick={onBackToEdit}
              className="rounded-lg border border-border/60 bg-surface/80 px-8 py-3 font-semibold text-foreground transition-all duration-300 hover:bg-surface"
            >
              Back to edit
            </button>
          )}
          {onComplete && (
            <button
              type="button"
              onClick={onComplete}
              className="rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:from-green-700 hover:to-emerald-700"
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
