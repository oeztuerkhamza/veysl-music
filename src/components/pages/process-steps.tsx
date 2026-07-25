import { Reveal } from '@/components/motion/reveal';

interface Step {
  index: number;
  title: string;
  text: string;
}

interface ProcessStepsProps {
  steps: Step[];
}

export function ProcessSteps({ steps }: ProcessStepsProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {steps.map((step) => (
        <Reveal key={step.index}>
          <div className="flex h-full flex-col gap-3 rounded-lg border border-line bg-surface p-8">
            <span aria-hidden="true" className="font-display text-4xl text-gold">
              {String(step.index).padStart(2, '0')}
            </span>
            <h3 className="font-display text-2xl text-ink">{step.title}</h3>
            <p className="leading-relaxed text-ink-muted">{step.text}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
