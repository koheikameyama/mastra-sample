import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { readFile, access } from 'fs/promises';
import { join, resolve, isAbsolute } from 'path';

// プロジェクトルートを見つける関数
function findProjectRoot(): string {
  // Mastraは.mastra/outputディレクトリで実行されるため、2つ上に戻る
  const cwd = process.cwd();
  if (cwd.includes('.mastra/output')) {
    return resolve(cwd, '../..');
  }
  return cwd;
}

export const readFileTool = createTool({
  id: 'readFileTool',
  description: 'Read the contents of a file for code review. Supports both absolute and relative paths.',
  inputSchema: z.object({
    filePath: z.string().describe('Path to the file to read (absolute or relative to project root)'),
  }),
  outputSchema: z.object({
    content: z.string(),
    lines: z.number(),
    extension: z.string(),
  }),
  execute: async ({ context, input }) => {
    try {
      let fullPath: string;

      // 絶対パスの場合はそのまま使用
      if (isAbsolute(input.filePath)) {
        fullPath = input.filePath;
      } else {
        // 相対パスの場合はプロジェクトルートから解決
        const projectRoot = findProjectRoot();
        fullPath = join(projectRoot, input.filePath);
      }

      // ファイルの存在確認
      await access(fullPath);

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
        `Failed to read file "${input.filePath}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
});
