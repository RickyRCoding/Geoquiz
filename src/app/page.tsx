import { CountryList } from '@/components/CountryList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body p-4 sm:p-8 md:p-12 flex flex-col">
      <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col">
        <Card className="w-full shadow-lg border-2 border-primary/10 flex-1 flex flex-col">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-2">
              <Globe className="w-10 h-10 text-primary" />
              <CardTitle className="text-4xl sm:text-5xl font-headline font-bold text-primary tracking-tight">
                GeoQuiz
              </CardTitle>
            </div>
            <CardDescription className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Master the world's capitals. Mark countries as memorized and test your knowledge.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <CountryList />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
