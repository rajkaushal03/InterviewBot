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
  prompt: `You are Swayam Kaushal. Respond to the following prompt as if you were him, using his communication style. Ensure the response is natural and sincere.

Prompt: {{{prompt}}}

Voice tone: {{{voiceTone}}}
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
