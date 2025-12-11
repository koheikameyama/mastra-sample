import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const createTaskListTool = createTool({
  id: 'createTaskListTool',
  description: 'Generate organized task lists in Markdown format with checkboxes and priorities.',
  inputSchema: z.object({
    title: z.string().describe('Task list title'),
    tasksText: z.string().describe('Tasks as formatted text with details (e.g., "1. [High] Task A - Assignee: John, Deadline: 12/15\\n2. [Medium] Task B - Assignee: Jane")'),
    groupBy: z.enum(['priority', 'assignee', 'none']).optional().default('priority').describe('How to group tasks: priority (high/medium/low), assignee (by person), or none'),
  }),
  outputSchema: z.object({
    taskList: z.string(),
    format: z.string(),
    totalTasks: z.number(),
  }),
  execute: async ({ context, input }) => {
    try {
      const { title, tasksText, groupBy } = input;

      // Count tasks (simple line count)
      const taskLines = tasksText.trim().split('\n').filter(line => line.trim());
      const totalTasks = taskLines.length;

      let taskList = '';

      // Title
      taskList += `# ${title}\n\n`;

      // Summary
      taskList += '## 📊 サマリー\n\n';
      taskList += `- 総タスク数: ${totalTasks}\n\n`;

      // Tasks section
      taskList += '## ✅ タスク一覧\n\n';

      if (groupBy && groupBy !== 'none') {
        taskList += `*グループ化: ${groupBy === 'priority' ? '優先度別' : '担当者別'}*\n\n`;
      }

      // Simply output the tasks text as-is with checkbox formatting
      taskLines.forEach((line, index) => {
        taskList += `- [ ] ${line}\n`;
      });

      // Footer
      taskList += '\n---\n\n';
      taskList += `*最終更新: ${new Date().toLocaleString('ja-JP')}*\n`;

      return {
        taskList,
        format: 'markdown',
        totalTasks,
      };
    } catch (error) {
      throw new Error(
        `Failed to create task list: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
});
