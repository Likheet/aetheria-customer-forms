import React from 'react';
import { Quote, Sparkles, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

interface FeedbackWelcomePageProps {
  onStart: () => void;
}

const FeedbackWelcomePage: React.FC<FeedbackWelcomePageProps> = ({ onStart }) => {
  return (
    <div className="luxury-shell">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-10 top-32 h-64 w-64 rounded-full bg-gradient-to-br from-[hsla(40,58%,62%,0.18)] to-transparent blur-[120px]" />
        <div className="absolute right-12 top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[hsla(266,32%,26%,0.22)] to-transparent blur-[140px]" />
        <div className="absolute inset-x-0 bottom-0 h-80 bg-gradient-to-t from-[rgba(8,9,13,0.75)] to-transparent" />
      </div>

      <div className="luxury-page items-center text-center">
        <Badge className="bg-primary/15 text-primary" variant="primary">
          Guest Reflections
        </Badge>
        <h1 className="text-gradient-gold">Thank you for choosing Aetheria</h1>
        <p className="max-w-2xl text-base text-muted-foreground/85 md:text-lg">
          We cherish your perspective. Share the moments that delighted you so we can continue elevating every ritual.
        </p>

        <div className="grid w-full gap-6 pt-6 md:grid-cols-3">
          {[{
            title: 'Two blissful minutes',
            description: 'A refined set of prompts curated to respect your time.'
          }, {
            title: 'Attentive listening',
            description: 'Your words flow directly to the specialists who cared for you.'
          }, {
            title: 'Elegant privacy',
            description: 'Securely captured, never shared beyond your trusted consultant.'
          }].map((item) => (
            <Card key={item.title} className="border-border/40 bg-surface/70">
              <CardContent className="flex h-full flex-col gap-3 px-6 py-6 text-left">
                <div className="flex items-center gap-3 text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-[0.28em] text-muted-foreground/80">Aetheria Promise</span>
                </div>
                <h3 className="font-serif text-[20px] text-foreground/90">{item.title}</h3>
                <p className="text-sm text-muted-foreground/85">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4 pt-10">
          <Button onClick={onStart} size="lg" className="px-12">
            Begin The Reflection
          </Button>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.32em] text-muted-foreground/70">
            <Clock className="h-3.5 w-3.5" />
            <span>Approximately 2 minutes</span>
          </div>
        </div>

        <blockquote className="mt-12 max-w-xl text-sm text-muted-foreground/75">
          <Quote className="mx-auto mb-4 h-6 w-6 text-primary" />
          "Luxury is in the details. Thank you for helping us keep every detail inspired."
        </blockquote>
      </div>
    </div>
  );
};

export default FeedbackWelcomePage;
