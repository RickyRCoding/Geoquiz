'use client';

import { COUNTRIES, type Country } from '@/lib/countries';
import { cn } from '@/lib/utils';
import { Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Skeleton } from './ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

type CountryListItemData = Country & { memorized: boolean };
const LOCAL_STORAGE_KEY = 'geoquiz-memorized';

export function CountryList() {
  const [countries, setCountries] = useState<CountryListItemData[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredCountries = useMemo(() => {
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.capital.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [countries, searchTerm]);

  const sortedCountries = useMemo(() => {
    return [...filteredCountries].sort((a, b) => {
      if (a.memorized && !b.memorized) return -1;
      if (!a.memorized && b.memorized) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [filteredCountries]);

  const handleToggleMemorized = (code: string) => {
    setCountries((prev) =>
      prev.map((c) => (c.code === code ? { ...c, memorized: !c.memorized } : c))
    );
  };
  
  const memorizedCount = countries.filter(c => c.memorized).length;

  return (
    <div className="flex flex-col gap-6 h-full">
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for a country or capital..."
          className="pl-10 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <ScrollArea className="flex-1 w-full rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="w-12 text-center">
                <span className="sr-only">Memorized</span>
              </TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Capital</TableHead>
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
                </TableRow>
              ))
            ) : (
              Array.from({ length: 15 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-5 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-3/4 rounded" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-2/3 rounded" /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
