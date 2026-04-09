import { useAppData } from '@/context/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';
import type { IdentificadorProduto } from '@/lib/types';

export function FilterBar() {
  const { filters, setFilters, data } = useAppData();
  if (!data) return null;

  return (
    <div className="glass-static px-5 py-3 flex flex-wrap items-center gap-4">
      <Filter className="h-4 w-4 text-muted-foreground" />

      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Janela</Label>
        <Select value={String(filters.janela)} onValueChange={v => setFilters({ janela: Number(v) })}>
          <SelectTrigger className="w-24 h-8 text-xs bg-background/50 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[30, 60, 90, 120, 150, 180].map(d => (
              <SelectItem key={d} value={String(d)}>{d} dias</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Canal</Label>
        <Select value={filters.canal} onValueChange={v => setFilters({ canal: v as 'Todos' | 'Matriz' | 'Full' })}>
          <SelectTrigger className="w-24 h-8 text-xs bg-background/50 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Matriz">Matriz</SelectItem>
            <SelectItem value="Full">Full</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={filters.somenteAds}
          onCheckedChange={v => setFilters({ somenteAds: v })}
          className="data-[state=checked]:bg-primary"
        />
        <Label className="text-xs text-muted-foreground">Só Ads</Label>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={filters.top10Skus}
          onCheckedChange={v => setFilters({ top10Skus: v })}
          className="data-[state=checked]:bg-primary"
        />
        <Label className="text-xs text-muted-foreground">Top 10</Label>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Agrupar por</Label>
        <Select value={filters.identificador} onValueChange={v => setFilters({ identificador: v as IdentificadorProduto })}>
          <SelectTrigger className="w-24 h-8 text-xs bg-background/50 border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SKU">SKU</SelectItem>
            <SelectItem value="MLB">MLB</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
