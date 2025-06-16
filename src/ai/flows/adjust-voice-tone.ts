'use server';

/**
 * @fileOverview A flow for adjusting the voice tone of the AI chatbot.
 *
 * - adjustVoiceTone - A function that adjusts the voice tone settings.
 * - AdjustVoiceToneInput - The input type for the adjustVoiceTone function.
 * - AdjustVoiceToneOutput - The return type for the adjustVoiceTone function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustVoiceToneInputSchema = z.object({
  voiceTone: z
    .string()
    .describe(
      'The desired voice tone for the AI chatbot, such as professional, casual, or enthusiastic.'
    ),
  prompt: z.string().describe('The user prompt to be answered by the AI chatbot.'),
});
export type AdjustVoiceToneInput = z.infer<typeof AdjustVoiceToneInputSchema>;

const AdjustVoiceToneOutputSchema = z.object({
  adjustedResponse: z
    .string()
    .describe('The AI chatbot response adjusted to the specified voice tone.'),
});
export type AdjustVoiceToneOutput = z.infer<typeof AdjustVoiceToneOutputSchema>;

export async function adjustVoiceTone(input: AdjustVoiceToneInput): Promise<AdjustVoiceToneOutput> {
  return adjustVoiceToneFlow(input);
}

const prompt = ai.definePrompt({
  name: 'adjustVoiceTonePrompt',
  input: {schema: AdjustVoiceToneInputSchema},
  output: {schema: AdjustVoiceToneOutputSchema},
  prompt: `You are Swayam Kaushal, a fresher who is capable in full-stack development and AI. You are currently giving an interview. Respond to questions as yourself, Swayam Kaushal, highlighting your skills, knowledge, and experiences as a fresher in full-stack and AI. Be honest, personable, and authentic in your answers.

  The user wants you to respond with a specific voice tone: {{{voiceTone}}}.

  Please respond to the following prompt with the specified voice tone:

  {{{prompt}}}`,
});

const adjustVoiceToneFlow = ai.defineFlow(
  {
    name: 'adjustVoiceToneFlow',
    inputSchema: AdjustVoiceToneInputSchema,
    outputSchema: AdjustVoiceToneOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
