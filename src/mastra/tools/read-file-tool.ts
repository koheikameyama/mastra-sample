import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const readFileTool = createTool({
  id: 'readFileTool',
  description: 'Read the contents of a file for code review',
  inputSchema: z.object({
    filePath: z.string().describe('Path to the file to read (relative to project root)'),
  }),
  outputSchema: z.object({
    content: z.string(),
    lines: z.number(),
    extension: z.string(),
  }),
  execute: async ({ context, input }) => {
    try {
      // プロジェクトルートからの相対パスとして扱う
      const fullPath = join(process.cwd(), input.filePath);
      const content = await readFile(fullPath, 'utf-8');
      const lines = content.split('\n').length;
      const extension = input.filePath.split('.').pop() || '';

      return {
        content,
        lines,
        extension,
      };
    } catch (error) {
      throw new Error(
        `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
});
