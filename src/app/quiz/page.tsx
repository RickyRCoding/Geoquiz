import { Quiz } from '@/components/Quiz';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Swords } from 'lucide-react';

export default function QuizPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-body flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <Card className="w-full shadow-lg border-2 border-primary/10">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-3 mb-2">
              <Swords className="w-8 h-8 text-primary" />
              <CardTitle className="text-4xl font-headline font-bold text-primary tracking-tight">
                Quiz Time!
              </CardTitle>
            </div>
            <CardDescription className="text-lg text-muted-foreground">
              Let's see what you've learned. Good luck!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Quiz />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
