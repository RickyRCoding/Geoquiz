'use client';

import { generateMemoryCue } from '@/ai/flows/generate-memory-cue';
import { COUNTRIES, type Country } from '@/lib/countries';
import { cn } from '@/lib/utils';
import { Lightbulb, LoaderCircle, Sparkles, Wand } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useToast } from '@/hooks/use-toast';

type CountryListItemData = Country & { memorized: boolean };
const LOCAL_STORAGE_KEY = 'geoquiz-memorized';

export function CountryList() {
  const [countries, setCountries] = useState<CountryListItemData[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [hint, setHint] = useState<{ country: string; capital: string; cue: string | null }>({ country: '', capital: '', cue: null });
  const [isHintLoading, setIsHintLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    const storedMemorized: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const initialCountries = COUNTRIES.map((c) => ({
      ...c,
      memorized: storedMemorized.includes(c.code),
    }));
    setCountries(initialCountries);
  }, []);

  useEffect(() => {
    if (isClient) {
      const memorizedCodes = countries.filter((c) => c.memorized).map((c) => c.code);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(memorizedCodes));
    }
  }, [countries, isClient]);

  const sortedCountries = useMemo(() => {
    return [...countries].sort((a, b) => Number(b.memorized) - Number(a.memorized));
  }, [countries]);

  const handleToggleMemorized = (code: string) => {
    setCountries((prev) =>
      prev.map((c) => (c.code === code ? { ...c, memorized: !c.memorized } : c))
    );
  };

  const handleShowHint = async (country: Country) => {
    setHint({ country: country.name, capital: country.capital, cue: null });
    setIsHintLoading(true);
    try {
      const result = await generateMemoryCue({ country: country.name, capital: country.capital });
      setHint({ ...hint, cue: result.cue });
    } catch (error) {
      console.error('Failed to generate hint:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate a hint. Please try again later.',
      });
      setHint({ country: '', capital: '', cue: null });
    } finally {
      setIsHintLoading(false);
    }
  };
  
  const memorizedCount = countries.filter(c => c.memorized).length;

  return (
    <div className="flex flex-col gap-6">
      <ScrollArea className="h-96 w-full rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="w-12 text-center">
                <span className="sr-only">Memorized</span>
              </TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Capital</TableHead>
              <TableHead className="w-12 text-center">Hint</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isClient ? (
              sortedCountries.map((country) => (
                <TableRow
                  key={country.code}
                  className={cn('transition-colors duration-300', country.memorized && 'bg-accent/20 hover:bg-accent/30')}
                >
                  <TableCell className="text-center">
                    <Checkbox
                      id={`check-${country.code}`}
                      checked={country.memorized}
                      onCheckedChange={() => handleToggleMemorized(country.code)}
                      aria-label={`Mark ${country.name} as memorized`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{country.name}</TableCell>
                  <TableCell>{country.capital}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleShowHint(country)} aria-label={`Get hint for ${country.name}`}>
                      <Lightbulb className="h-5 w-5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-5 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-3/4 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-2/3 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      
      <div className="text-center">
        <Button 
          size="lg" 
          asChild
          disabled={memorizedCount === 0}
          className="shadow-lg"
        >
          <Link href="/quiz">
            <Sparkles className="mr-2 h-5 w-5" />
            Start Quiz ({memorizedCount} Memorized)
          </Link>
        </Button>
        {memorizedCount === 0 && isClient && (
          <p className="text-sm text-muted-foreground mt-2">
            Check some countries you've memorized to start a quiz!
          </p>
        )}
      </div>

      <Dialog open={!!hint.country} onOpenChange={(isOpen) => !isOpen && setHint({ country: '', capital: '', cue: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Wand className="text-primary" /> Memory Cue
            </DialogTitle>
            <DialogDescription>
              For {hint.country} &mdash; {hint.capital}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isHintLoading ? (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                <span>Generating a creative hint...</span>
              </div>
            ) : (
              <p className="text-lg text-center font-medium p-4 bg-accent/20 rounded-md">
                {hint.cue}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
