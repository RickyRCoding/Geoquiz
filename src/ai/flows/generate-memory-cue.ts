'use server';

/**
 * @fileOverview AI flow to generate a memory cue for a country and its capital.
 *
 * - generateMemoryCue - A function that generates a memory cue for a given country and capital.
 * - GenerateMemoryCueInput - The input type for the generateMemoryCue function.
 * - GenerateMemoryCueOutput - The return type for the generateMemoryCue function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMemoryCueInputSchema = z.object({
  country: z.string().describe('The country for which to generate a memory cue.'),
  capital: z.string().describe('The capital city of the country.'),
});
export type GenerateMemoryCueInput = z.infer<typeof GenerateMemoryCueInputSchema>;

const GenerateMemoryCueOutputSchema = z.object({
  cue: z.string().describe('A short associative phrase or imagery suggestion.'),
});
export type GenerateMemoryCueOutput = z.infer<typeof GenerateMemoryCueOutputSchema>;

export async function generateMemoryCue(input: GenerateMemoryCueInput): Promise<GenerateMemoryCueOutput> {
  return generateMemoryCueFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateMemoryCuePrompt',
  input: {schema: GenerateMemoryCueInputSchema},
  output: {schema: GenerateMemoryCueOutputSchema},
  prompt: `You are a memory aid assistant. Generate a short, creative, and memorable cue to help memorize the capital of a given country.

Country: {{{country}}}
Capital: {{{capital}}}

Cue:`,
});

const generateMemoryCueFlow = ai.defineFlow(
  {
    name: 'generateMemoryCueFlow',
    inputSchema: GenerateMemoryCueInputSchema,
    outputSchema: GenerateMemoryCueOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
