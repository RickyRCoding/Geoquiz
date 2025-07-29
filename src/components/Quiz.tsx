'use client';

import { COUNTRIES, type Country } from '@/lib/countries';
import { cn } from '@/lib/utils';
import { CheckCircle2, Home, Redo, Trophy, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Skeleton } from './ui/skeleton';

const LOCAL_STORAGE_KEY = 'geoquiz-memorized';
const QUIZ_LENGTH = 20;
const NUM_OPTIONS = 6;

type QuizQuestion = {
  countryName: string;
  correctCapital: string;
  options: string[];
};

export function Quiz() {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizOver, setQuizOver] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedMemorizedCodes: string[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const memorizedCountries = COUNTRIES.filter((c) => storedMemorizedCodes.includes(c.code));

    if (memorizedCountries.length === 0) {
      setIsLoading(false);
      return;
    }

    const shuffled = memorizedCountries.sort(() => 0.5 - Math.random());
    const quizCountries = shuffled.slice(0, QUIZ_LENGTH);
    const allCapitals = COUNTRIES.map((c) => c.capital);

    const generatedQuestions = quizCountries.map((country) => {
      const otherCapitals = allCapitals.filter((c) => c !== country.capital);
      const shuffledOptions = otherCapitals.sort(() => 0.5 - Math.random());
      const incorrectOptions = shuffledOptions.slice(0, NUM_OPTIONS - 1);
      const options = [country.capital, ...incorrectOptions].sort(() => 0.5 - Math.random());
      return {
        countryName: country.name,
        correctCapital: country.capital,
        options,
      };
    });

    setQuestions(generatedQuestions);
    setIsLoading(false);
  }, []);

  const handleAnswerSubmit = () => {
    if (!selectedAnswer) return;
    if (selectedAnswer === questions[currentQuestionIndex].correctCapital) {
      setScore(score + 1);
    }
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizOver(true);
    }
  };

  const handleRestart = () => {
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <div className="space-y-4">
          {[...Array(NUM_OPTIONS)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
        </div>
        <Skeleton className="h-12 w-1/3 mx-auto" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold">No Memorized Countries</h3>
        <p className="text-muted-foreground">You need to mark some countries as memorized to start a quiz.</p>
        <Button asChild>
          <Link href="/"><Home className="mr-2 h-4 w-4" /> Go Back</Link>
        </Button>
      </div>
    );
  }

  if (quizOver) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <Card className="text-center p-6 border-none shadow-none">
        <CardHeader>
          <div className="flex justify-center items-center gap-3 mb-2">
            <Trophy className="w-12 h-12 text-yellow-500" />
            <CardTitle className="text-3xl font-bold">Quiz Complete!</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">You scored</p>
          <p className="text-6xl font-bold text-primary">{percentage}%</p>
          <p className="text-muted-foreground">({score} out of {questions.length} correct)</p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button onClick={handleRestart}><Redo className="mr-2 h-4 w-4" /> Play Again</Button>
          <Button variant="outline" asChild>
            <Link href="/"><Home className="mr-2 h-4 w-4" /> Back to List</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-center text-sm font-medium text-muted-foreground">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
        <Progress value={progress} />
      </div>

      <h3 className="text-2xl font-bold text-center">
        What is the capital of {currentQuestion.countryName}?
      </h3>

      <RadioGroup
        value={selectedAnswer ?? ''}
        onValueChange={setSelectedAnswer}
        disabled={isAnswered}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {currentQuestion.options.map((option) => {
          const isCorrect = option === currentQuestion.correctCapital;
          const isSelected = option === selectedAnswer;
          return (
            <div key={option}>
              <RadioGroupItem value={option} id={option} className="peer sr-only" />
              <Label
                htmlFor={option}
                className={cn(
                  "flex items-center justify-between p-4 rounded-md border-2 border-muted bg-popover hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all",
                  isAnswered && isCorrect && "border-green-500 bg-green-500/10 text-green-700",
                  isAnswered && isSelected && !isCorrect && "border-red-500 bg-red-500/10 text-red-700"
                )}
              >
                {option}
                {isAnswered && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-500" />}
              </Label>
            </div>
          );
        })}
      </RadioGroup>

      <div className="text-center">
        {isAnswered ? (
          <Button size="lg" onClick={handleNextQuestion}>
            {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </Button>
        ) : (
          <Button size="lg" onClick={handleAnswerSubmit} disabled={!selectedAnswer}>
            Submit Answer
          </Button>
        )}
      </div>
    </div>
  );
}
