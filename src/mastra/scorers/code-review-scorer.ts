import { z } from 'zod';
import { createScorer } from '@mastra/core/scores';

// レビューの品質を評価するスコアラー
export const reviewQualityScorer = createScorer({
  name: 'Review Quality',
  description:
    'Evaluates the quality and completeness of code review feedback',
  type: 'agent',
  judge: {
    model: 'google/gemini-2.5-flash-lite',
    instructions:
      'You are an expert evaluator of code review quality. ' +
      'Assess whether the review provides specific, actionable feedback with clear examples. ' +
      'Check if it identifies real issues and provides constructive suggestions. ' +
      'Return structured JSON matching the provided schema.',
  },
})
  .preprocess(({ run }) => {
    const userText = (run.input?.inputMessages?.[0]?.content as string) || '';
    const reviewText = (run.output?.[0]?.content as string) || '';
    return { userText, reviewText };
  })
  .analyze({
    description: 'Analyze review quality and completeness',
    outputSchema: z.object({
      hasSpecificFeedback: z.boolean(),
      hasCodeExamples: z.boolean(),
      identifiesIssues: z.boolean(),
      isConstructive: z.boolean(),
      confidence: z.number().min(0).max(1).default(1),
      explanation: z.string().default(''),
    }),
    createPrompt: ({ results }) => `
            Evaluate the quality of this code review:

            User request:
            """
            ${results.preprocessStepResult.userText}
            """

            Review provided:
            """
            ${results.preprocessStepResult.reviewText}
            """

            Tasks:
            1) Check if the review provides specific, detailed feedback (not generic)
            2) Verify if code examples or specific line references are included
            3) Assess if actual issues or improvements are identified
            4) Evaluate if the tone is constructive and educational

            Return JSON with fields:
            {
              "hasSpecificFeedback": boolean,
              "hasCodeExamples": boolean,
              "identifiesIssues": boolean,
              "isConstructive": boolean,
              "confidence": number, // 0-1
              "explanation": string
            }
        `,
  })
  .generateScore(({ results }) => {
    const r = (results as any)?.analyzeStepResult || {};
    let score = 0;
    if (r.hasSpecificFeedback) score += 0.3;
    if (r.hasCodeExamples) score += 0.3;
    if (r.identifiesIssues) score += 0.2;
    if (r.isConstructive) score += 0.2;
    return Math.max(0, Math.min(1, score * (r.confidence ?? 1)));
  })
  .generateReason(({ results, score }) => {
    const r = (results as any)?.analyzeStepResult || {};
    return `Review quality: specific=${r.hasSpecificFeedback ?? false}, examples=${r.hasCodeExamples ?? false}, issues=${r.identifiesIssues ?? false}, constructive=${r.isConstructive ?? false}. Score=${score}. ${r.explanation ?? ''}`;
  });

// フィードバックの実行可能性を評価するスコアラー
export const actionabilityScorer = createScorer({
  name: 'Actionability',
  description: 'Checks if the review provides actionable recommendations',
  type: 'agent',
  judge: {
    model: 'google/gemini-2.5-flash-lite',
    instructions:
      'You are an expert evaluator of code review actionability. ' +
      'Determine if the feedback can be immediately acted upon by a developer. ' +
      'Check for clear next steps, specific changes suggested, and practical advice. ' +
      'Return structured JSON matching the provided schema.',
  },
})
  .preprocess(({ run }) => {
    const reviewText = (run.output?.[0]?.content as string) || '';
    return { reviewText };
  })
  .analyze({
    description: 'Evaluate if feedback is actionable',
    outputSchema: z.object({
      hasClearNextSteps: z.boolean(),
      hasPracticalSuggestions: z.boolean(),
      isImplementable: z.boolean(),
      confidence: z.number().min(0).max(1).default(1),
      explanation: z.string().default(''),
    }),
    createPrompt: ({ results }) => `
            Evaluate the actionability of this code review:

            Review:
            """
            ${results.preprocessStepResult.reviewText}
            """

            Tasks:
            1) Check if there are clear next steps or action items
            2) Verify if suggestions are practical and can be implemented
            3) Assess if a developer could act on this feedback immediately

            Return JSON with fields:
            {
              "hasClearNextSteps": boolean,
              "hasPracticalSuggestions": boolean,
              "isImplementable": boolean,
              "confidence": number, // 0-1
              "explanation": string
            }
        `,
  })
  .generateScore(({ results }) => {
    const r = (results as any)?.analyzeStepResult || {};
    let score = 0;
    if (r.hasClearNextSteps) score += 0.4;
    if (r.hasPracticalSuggestions) score += 0.3;
    if (r.isImplementable) score += 0.3;
    return Math.max(0, Math.min(1, score * (r.confidence ?? 1)));
  })
  .generateReason(({ results, score }) => {
    const r = (results as any)?.analyzeStepResult || {};
    return `Actionability: nextSteps=${r.hasClearNextSteps ?? false}, practical=${r.hasPracticalSuggestions ?? false}, implementable=${r.isImplementable ?? false}. Score=${score}. ${r.explanation ?? ''}`;
  });

export const scorers = {
  reviewQualityScorer,
  actionabilityScorer,
};
