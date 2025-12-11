import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { tavily } from '@tavily/core';

export const webSearchTool = createTool({
  id: 'webSearchTool',
  description: 'Search the web for information using Tavily API. Returns relevant results with sources.',
  inputSchema: z.object({
    query: z.string().describe('The search query'),
    maxResults: z.number().optional().default(5).describe('Maximum number of results to return (1-10)'),
    searchDepth: z.enum(['basic', 'advanced']).optional().default('basic').describe('Search depth: basic for quick results, advanced for comprehensive search'),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        content: z.string(),
        score: z.number().optional(),
      })
    ),
    query: z.string(),
    answer: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const apiKey = process.env.TAVILY_API_KEY;

      if (!apiKey) {
        throw new Error(
          'TAVILY_API_KEY is not set. Please add it to your .env file. ' +
          'Get your free API key at https://tavily.com'
        );
      }

      const tvly = tavily({ apiKey });

      const response = await tvly.search(context.query, {
        maxResults: Math.min(context.maxResults || 5, 10),
        searchDepth: context.searchDepth || 'basic',
        includeAnswer: true,
        includeRawContent: false,
      });

      return {
        results: response.results.map((result: any) => ({
          title: result.title || '',
          url: result.url || '',
          content: result.content || '',
          score: result.score,
        })),
        query: context.query,
        answer: response.answer,
      };
    } catch (error) {
      throw new Error(
        `Failed to search web: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
});
