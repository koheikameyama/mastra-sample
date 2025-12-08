import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { readdir, access } from 'fs/promises';
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

export const listFilesTool = createTool({
  id: 'listFilesTool',
  description: 'List files in a directory for code review. Supports both absolute and relative paths.',
  inputSchema: z.object({
    directory: z
      .string()
      .describe('Directory path to list files from (absolute or relative to project root)')
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
      let fullPath: string;

      // 絶対パスの場合はそのまま使用
      if (isAbsolute(input.directory)) {
        fullPath = input.directory;
      } else {
        // 相対パスの場合はプロジェクトルートから解決
        const projectRoot = findProjectRoot();
        fullPath = join(projectRoot, input.directory);
      }

      // ディレクトリの存在確認
      await access(fullPath);

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
        `Failed to list files in "${input.directory}": ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
});
