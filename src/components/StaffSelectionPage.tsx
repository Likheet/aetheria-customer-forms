import React from "react";
import { Star, ClipboardList, PenSquare, Scan } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface StaffSelectionPageProps {
  onSelectFeedback: () => void;
  onSelectConsultantInput: () => void;
  onSelectUpdatedConsult: () => void;
  onSelectMachineIntake: () => void;
}

type Option = {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  action: () => void;
};

const StaffSelectionPage: React.FC<StaffSelectionPageProps> = ({
  onSelectFeedback,
  onSelectConsultantInput,
  onSelectUpdatedConsult,
  onSelectMachineIntake,
}) => {
  const options: Option[] = [
    {
      id: "feedback",
      label: "Client Reflections",
      description: "Collect thoughtful post-service impressions in a calm, guided space.",
      icon: Star,
      action: onSelectFeedback,
    },
    {
      id: "consultant",
      label: "Consultant Input",
      description: "Capture expert notes and craft prescriptive rituals with clarity.",
      icon: ClipboardList,
      action: onSelectConsultantInput,
    },
    {
      id: "client-consult",
      label: "Client Consult Form",
      description: "Open returning journeys, review scan data, and refine programmes.",
      icon: PenSquare,
      action: onSelectUpdatedConsult,
    },
    {
      id: "url-catcher",
      label: "Machine Scan Intake",
      description: "Launch the capture console to ingest new machine reports into Supabase.",
      icon: Scan,
      action: onSelectMachineIntake,
    },
  ];

  return (
    <div className="luxury-shell">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-luxury-linear opacity-75" />
        <div className="absolute inset-0 bg-luxury-radial opacity-55" />
      </div>

      <div className="luxury-page">
        <header className="relative z-10 flex flex-col items-center gap-4 text-center">
          <Badge className="bg-primary/12 text-primary" variant="primary">
            Aetheria Atelier
          </Badge>
          <h1 className="text-gradient-gold">Select the next experience</h1>
          <p className="max-w-xl text-sm text-muted-foreground/85 md:text-base">
            Choose the workspace that aligns with today&rsquo;s guest. Each pathway keeps the environment composed,
            focused, and ready for elevated service.
          </p>
        </header>

  <section className="relative z-10 mx-auto grid w-full max-w-none gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-stretch px-6 sm:px-10 lg:px-20">
          {options.map(({ id, label, description, icon: Icon, action }) => {
            const handleActivate = () => action();
            const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleActivate();
              }
            };

            return (
              <Card
                key={id}
                role="button"
                tabIndex={0}
                onClick={handleActivate}
                onKeyDown={handleKeyDown}
                className="h-full flex min-h-[440px] flex-col justify-between border-border/40 bg-surface/85 px-10 py-12 transition-transform duration-300 hover:-translate-y-1 hover:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
              <CardHeader className="flex flex-col items-center gap-4 p-0 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                  <Icon className="h-7 w-7" />
                </div>
                <CardTitle className="text-[24px] font-semibold text-foreground">{label}</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground/80 max-w-[18rem]">
                  {description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0" />
              <CardFooter className="justify-center p-0 pt-6">
                <Button onClick={action} size="lg" variant="primary" className="px-7">
                  Open
                </Button>
              </CardFooter>
            </Card>
            );
          })}
        </section>

        <footer className="relative z-10 mt-10 flex flex-col items-center gap-2 text-center text-xs uppercase tracking-[0.28em] text-muted-foreground/70">
          <div className="luxury-divider" />
          <span>Purposeful experiences, poised for today&apos;s guests</span>
        </footer>
      </div>
    </div>
  );
};

export default StaffSelectionPage;


