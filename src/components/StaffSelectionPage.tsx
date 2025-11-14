import React from "react";
import { Star, ClipboardList, PenSquare, Scan, Settings2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface StaffSelectionPageProps {
  onSelectFeedback: () => void;
  onSelectConsultantInput: () => void;
  onSelectUpdatedConsult: () => void;
  onSelectMachineIntake: () => void;
  onSelectAdmin: () => void;
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
  onSelectAdmin,
}) => {
  const options: Option[] = [
    {
      id: "feedback",
      label: "Client Feedback",
      description: "Collect post-service feedback and ratings",
      icon: Star,
      action: onSelectFeedback,
    },
    {
      id: "consultant",
      label: "Consultant Notes",
      description: "Record expert observations and recommendations",
      icon: ClipboardList,
      action: onSelectConsultantInput,
    },
    {
      id: "client-consult",
      label: "Client Consultation",
      description: "Start or continue client consultation sessions",
      icon: PenSquare,
      action: onSelectUpdatedConsult,
    },
    {
      id: "url-catcher",
      label: "Machine Data",
      description: "Import and process machine scan reports",
      icon: Scan,
      action: onSelectMachineIntake,
    },
    {
      id: "admin-dashboard",
      label: "Admin Dashboard",
      description: "Manage products, recommendations, and settings",
      icon: Settings2,
      action: onSelectAdmin,
    },
  ];

  return (
    <div className="luxury-shell">
      <div className="luxury-page">
        <header className="flex flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary" />
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Aetheria
            </span>
            <div className="h-1 w-1 rounded-full bg-primary" />
          </div>
          <h1 className="max-w-2xl">Select Service Module</h1>
          <p className="max-w-lg text-sm text-muted-foreground">
            Choose the appropriate workflow for today's service.
          </p>
        </header>

        <section className="grid w-full gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
                className="group flex cursor-pointer flex-col border border-border bg-surface p-6 transition-all duration-150 hover:border-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <CardHeader className="flex flex-row items-start gap-4 p-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-foreground transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-base font-semibold leading-tight">{label}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed text-muted-foreground">
                      {description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </section>

        <footer className="mt-4 flex items-center justify-center border-t border-border pt-8">
          <span className="font-mono text-xs text-muted-foreground">
            Aetheria Service Platform
          </span>
        </footer>
      </div>
    </div>
  );
};

export default StaffSelectionPage;


