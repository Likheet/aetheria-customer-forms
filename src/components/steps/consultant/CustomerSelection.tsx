import React, { useState, useEffect, useMemo } from "react";
import { StepProps } from "../../../types";
import FormStep from '../../form/FormStep';
import { getConsultationsWithoutInput } from "../../../services/consultantInputService";
import { ConsultationData, ConsultantInputData } from "../../../lib/supabase";
import { Badge } from "../../ui/badge";

const CustomerSelection: React.FC<StepProps & { isLoading: boolean }> = ({
  formData,
  updateFormData,
  onNext,
  onBack,
  errors,
  isLoading,
}) => {
  const [availableConsultations, setAvailableConsultations] = useState<Partial<ConsultationData>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(formData.consultation_id || null);

  useEffect(() => {
    const loadConsultations = async () => {
      const result = await getConsultationsWithoutInput();
      if (result.success && result.data) {
        setAvailableConsultations(result.data);
      } else {
        setError(result.error || "Failed to load consultations.");
      }
    };
    loadConsultations();
  }, []);

  const uniqueConsultations = useMemo(() => {
    const seen = new Set<string>();
    return availableConsultations.filter((entry) => {
      const key = entry.id ?? `${entry.name ?? ""}-${entry.phone ?? ""}`;
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [availableConsultations]);

  const handleSelect = (consultation: Partial<ConsultationData>) => {
    if (!consultation.id) {
      return;
    }
    setSelectedId(consultation.id);
    updateFormData({
      consultation_id: consultation.id,
      customer_name: consultation.name,
      customer_phone: consultation.phone,
    } as Partial<Omit<ConsultantInputData, "id" | "created_at">>);
  };

  const handleContinue = (consultation: Partial<ConsultationData>) => {
    handleSelect(consultation);
    onNext();
  };

  const initialsFor = (name?: string) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
    return initials || name[0]?.toUpperCase() || "?";
  };

  return (
    <FormStep
      title="Select a Customer"
      onNext={onNext}
      onBack={onBack}
      isValid={Boolean(selectedId)}
    >
      <div className="space-y-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground/70">Loading guests…</div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 px-5 py-4 text-sm text-destructive-foreground">
            {error}
          </div>
        ) : uniqueConsultations.length === 0 ? (
          <div className="rounded-2xl border border-border/40 bg-surface/70 px-6 py-10 text-center text-sm text-muted-foreground/80">
            No consultations are waiting for specialist input.
          </div>
        ) : (
          <div className="rounded-[28px] border border-border/40 bg-surface/75 p-4">
            <div className="flex items-center justify-between pb-4">
              <Badge variant="subtle" className="bg-primary/10 text-primary">
                Active queue
              </Badge>
              <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground/70">
                {uniqueConsultations.length} guests
              </span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {uniqueConsultations.map((consultation) => {
                const isSelected = selectedId === consultation.id;
                return (
                  <button
                    key={consultation.id ?? `${consultation.name}-${consultation.phone}`}
                    type="button"
                    onClick={() => handleSelect(consultation)}
                    onDoubleClick={() => handleContinue(consultation)}
                    className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 ${
                      isSelected
                        ? "border-primary/50 bg-primary/15 text-foreground shadow-glow"
                        : "border-border/50 bg-surface/60 text-foreground/80 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface/80"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold tracking-wide text-primary">
                        {initialsFor(consultation.name)}
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {consultation.name ?? "Unknown guest"}
                        </span>
                        <span className="text-xs text-muted-foreground/70">
                          {consultation.phone ?? "No phone recorded"}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {errors.customer && (
          <p className="text-sm text-destructive-foreground">{errors.customer}</p>
        )}
      </div>
    </FormStep>
  );
};

export default React.memo(CustomerSelection);
