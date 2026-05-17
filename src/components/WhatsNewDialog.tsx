import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const STORAGE_KEY = 'analyticalx_seen_version';

export function WhatsNewDialog() {
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState<string>('');
  const [whatsNew, setWhatsNew] = useState<string>('');

  useEffect(() => {
    fetch(`/version.json?ts=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { version: string; whatsNew: string }) => {
        if (!data?.version || !data?.whatsNew) return;
        const seen = localStorage.getItem(STORAGE_KEY);
        if (seen !== data.version) {
          setVersion(data.version);
          setWhatsNew(data.whatsNew);
          setOpen(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleClose = () => {
    if (version) localStorage.setItem(STORAGE_KEY, version);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>O que há de novo</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-xs text-muted-foreground">
            Versão {version}
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
          {whatsNew}
        </p>
        <DialogFooter>
          <Button onClick={handleClose}>Entendi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
