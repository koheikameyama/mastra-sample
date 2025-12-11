import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { readFile, access } from 'fs/promises';
import { join, resolve, isAbsolute } from 'path';

// プロジェクトルートを見つける関数
function findProjectRoot(): string {
  const cwd = process.cwd();
  if (cwd.includes('.mastra/output')) {
    return resolve(cwd, '../..');
  }
  return cwd;
}

export const readMinutesTool = createTool({
  id: 'readMinutesTool',
  description: 'Read meeting minutes from a text file or direct text input. Returns the content for analysis.',
  inputSchema: z.object({
    source: z.enum(['file', 'text']).describe('Source type: "file" to read from file path, "text" for direct text input'),
    filePath: z.string().optional().describe('Path to the minutes file (required if source is "file")'),
    text: z.string().optional().describe('Direct text content of minutes (required if source is "text")'),
  }),
  outputSchema: z.object({
    content: z.string(),
    source: z.string(),
    lineCount: z.number(),
  }),
  execute: async ({ context }) => {
    try {
      let content: string;
      let source: string;

      if (context.source === 'file') {
        if (!context.filePath) {
          throw new Error('filePath is required when source is "file"');
        }

        let fullPath: string;

        // 絶対パスの場合はそのまま使用
        if (isAbsolute(context.filePath)) {
          fullPath = context.filePath;
        } else {
          // 相対パスの場合はプロジェクトルートから解決
          const projectRoot = findProjectRoot();
          fullPath = join(projectRoot, context.filePath);
        }

        // ファイルの存在確認
        await access(fullPath);
        content = await readFile(fullPath, 'utf-8');
        source = `file: ${context.filePath}`;
      } else {
        // テキスト入力の場合
        if (!context.text) {
          throw new Error('text is required when source is "text"');
        }
        content = context.text;
        source = 'direct text input';
      }

      const lineCount = content.split('\n').length;

      return {
        content,
        source,
        lineCount,
      };
    } catch (error) {
      throw new Error(
        `Failed to read minutes: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
});
