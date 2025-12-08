import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { readdir } from 'fs/promises';
import { join } from 'path';

export const listFilesTool = createTool({
  id: 'listFilesTool',
  description: 'List files in a directory for code review',
  inputSchema: z.object({
    directory: z
      .string()
      .describe('Directory path to list files from (relative to project root)')
      .default('.'),
    extension: z
      .string()
      .optional()
      .describe('Filter by file extension (e.g., "ts", "js")'),
  }),
  outputSchema: z.object({
    files: z.array(z.string()),
    count: z.number(),
  }),
  execute: async ({ context, input }) => {
    try {
      const fullPath = join(process.cwd(), input.directory);
      const entries = await readdir(fullPath, { withFileTypes: true });

      let files = entries
        .filter((entry) => entry.isFile())
        .map((entry) => join(input.directory, entry.name));

      // 拡張子でフィルタ
      if (input.extension) {
        files = files.filter((file) =>
          file.endsWith(`.${input.extension}`)
        );
      }

      return {
        files,
        count: files.length,
      };
    } catch (error) {
      throw new Error(
        `Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
});
