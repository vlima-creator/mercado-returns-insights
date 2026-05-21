import { Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface InfoTooltipProps {
  title: string;
  description: string;
  calculation?: string;
  meaning?: string;
  className?: string;
}

/**
 * Overlay informativo padronizado: explica o que é o card, qual o cálculo
 * usado e o que aquilo representa na operação.
 */
export function InfoTooltip({ title, description, calculation, meaning, className }: InfoTooltipProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Sobre ${title}`}
          className={`inline-flex items-center justify-center rounded-full p-0.5 text-muted-foreground hover:text-foreground transition-colors ${className ?? ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-80 text-xs space-y-2.5 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">O que é</p>
          <p className="text-foreground font-semibold text-sm">{title}</p>
          <p className="text-muted-foreground mt-1 leading-relaxed">{description}</p>
        </div>
        {calculation && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">Como é calculado</p>
            <p className="text-muted-foreground leading-relaxed font-mono text-[11px]">{calculation}</p>
          </div>
        )}
        {meaning && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1">O que representa</p>
            <p className="text-muted-foreground leading-relaxed">{meaning}</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
