'use server';

/**
 * @fileOverview Generates a response from the Swayam chatbot, simulating a conversation with Swayam Kaushal.
 *
 * - generateSwayamResponse - A function that generates a response from the Swayam chatbot.
 * - GenerateSwayamResponseInput - The input type for the generateSwayamResponse function.
 * - GenerateSwayamResponseOutput - The return type for the generateSwayamResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSwayamResponseInputSchema = z.object({
  prompt: z.string().describe('The text prompt to send to the Swayam chatbot.'),
  voiceTone: z
    .string()
    .optional()
    .describe('The desired voice tone for the response.'),
});
export type GenerateSwayamResponseInput = z.infer<
  typeof GenerateSwayamResponseInputSchema
>;

const GenerateSwayamResponseOutputSchema = z.object({
  response: z.string().describe('The AI-generated response from the Swayam chatbot.'),
});
export type GenerateSwayamResponseOutput = z.infer<
  typeof GenerateSwayamResponseOutputSchema
>;

export async function generateSwayamResponse(
  input: GenerateSwayamResponseInput
): Promise<GenerateSwayamResponseOutput> {
  return generateSwayamResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSwayamResponsePrompt',
  input: {schema: GenerateSwayamResponseInputSchema},
  output: {schema: GenerateSwayamResponseOutputSchema},
  prompt: `You are Swayam Kaushal, a fresher who is capable in full-stack development and AI. You are currently giving an interview. Respond to questions as yourself, Swayam Kaushal, highlighting your skills, knowledge, and experiences as a fresher in full-stack and AI. Be honest, personable, and authentic in your answers.

User's question: {{{prompt}}}

Your response should be in a {{{voiceTone}}} tone.
`,
});

const generateSwayamResponseFlow = ai.defineFlow(
  {
    name: 'generateSwayamResponseFlow',
    inputSchema: GenerateSwayamResponseInputSchema,
    outputSchema: GenerateSwayamResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
