import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const createTaskListTool = createTool({
  id: 'createTaskListTool',
  description: 'Generate organized task lists from action items. Supports multiple formats and grouping options.',
  inputSchema: z.object({
    title: z.string().optional().default('タスクリスト').describe('Task list title'),
    tasks: z.array(z.object({
      task: z.string().describe('Task description'),
      assignee: z.string().optional().describe('Person responsible'),
      deadline: z.string().optional().describe('Due date'),
      priority: z.enum(['high', 'medium', 'low']).optional().describe('Task priority'),
      status: z.enum(['pending', 'in_progress', 'completed']).optional().default('pending').describe('Current status'),
      tags: z.array(z.string()).optional().describe('Task tags or categories'),
      estimatedTime: z.string().optional().describe('Estimated time to complete'),
      dependencies: z.array(z.string()).optional().describe('Tasks that must be completed first'),
    })).describe('List of tasks'),
    groupBy: z.enum(['none', 'priority', 'assignee', 'status', 'deadline']).optional().default('priority').describe('How to group tasks'),
    format: z.enum(['markdown', 'checklist', 'kanban']).optional().default('markdown').describe('Output format'),
    includeMetadata: z.boolean().optional().default(true).describe('Include task metadata (assignee, deadline, etc.)'),
  }),
  outputSchema: z.object({
    taskList: z.string(),
    format: z.string(),
    totalTasks: z.number(),
    tasksByStatus: z.object({
      pending: z.number(),
      in_progress: z.number(),
      completed: z.number(),
    }),
  }),
  execute: async ({ context, input }) => {
    try {
      const { title, tasks, groupBy, format, includeMetadata } = input;

      let taskList = '';
      let tasksByStatus = {
        pending: tasks.filter(t => t.status === 'pending').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        completed: tasks.filter(t => t.status === 'completed').length,
      };

      // Helper function to render a single task
      const renderTask = (task: typeof tasks[0], index: number, useCheckbox: boolean = false) => {
        const statusIcon = task.status === 'completed' ? '✅' : task.status === 'in_progress' ? '🔄' : '⏳';
        const priorityIcon = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : task.priority === 'low' ? '🟢' : '';
        const checkbox = useCheckbox ? (task.status === 'completed' ? '[x]' : '[ ]') : '';

        let taskLine = '';

        if (format === 'checklist') {
          taskLine += `${checkbox} ${priorityIcon} ${task.task}`;
        } else {
          taskLine += `${index}. ${statusIcon} ${priorityIcon} **${task.task}**`;
        }

        taskLine += '\n';

        if (includeMetadata) {
          if (task.assignee) taskLine += `   - 👤 担当: ${task.assignee}\n`;
          if (task.deadline) taskLine += `   - 📅 期限: ${task.deadline}\n`;
          if (task.estimatedTime) taskLine += `   - ⏱️ 見積時間: ${task.estimatedTime}\n`;
          if (task.tags && task.tags.length > 0) {
            taskLine += `   - 🏷️ タグ: ${task.tags.join(', ')}\n`;
          }
          if (task.dependencies && task.dependencies.length > 0) {
            taskLine += `   - 🔗 依存: ${task.dependencies.join(', ')}\n`;
          }
        }

        return taskLine + '\n';
      };

      // Title
      taskList += `# ${title}\n\n`;

      // Summary
      taskList += '## 📊 サマリー\n\n';
      taskList += `- 総タスク数: ${tasks.length}\n`;
      taskList += `- 未着手: ${tasksByStatus.pending}\n`;
      taskList += `- 進行中: ${tasksByStatus.in_progress}\n`;
      taskList += `- 完了: ${tasksByStatus.completed}\n\n`;

      // Group and render tasks
      if (format === 'kanban') {
        // Kanban style - grouped by status
        taskList += '## 📋 タスクボード\n\n';

        taskList += '### ⏳ 未着手\n\n';
        tasks.filter(t => t.status === 'pending').forEach((task, i) => {
          taskList += renderTask(task, i + 1);
        });

        taskList += '### 🔄 進行中\n\n';
        tasks.filter(t => t.status === 'in_progress').forEach((task, i) => {
          taskList += renderTask(task, i + 1);
        });

        taskList += '### ✅ 完了\n\n';
        tasks.filter(t => t.status === 'completed').forEach((task, i) => {
          taskList += renderTask(task, i + 1);
        });

      } else if (groupBy === 'priority') {
        taskList += '## 📋 タスク一覧（優先度別）\n\n';

        const highTasks = tasks.filter(t => t.priority === 'high');
        const mediumTasks = tasks.filter(t => t.priority === 'medium');
        const lowTasks = tasks.filter(t => t.priority === 'low');
        const noTasks = tasks.filter(t => !t.priority);

        if (highTasks.length > 0) {
          taskList += '### 🔴 優先度: 高\n\n';
          highTasks.forEach((task, i) => {
            taskList += renderTask(task, i + 1, format === 'checklist');
          });
        }

        if (mediumTasks.length > 0) {
          taskList += '### 🟡 優先度: 中\n\n';
          mediumTasks.forEach((task, i) => {
            taskList += renderTask(task, i + 1, format === 'checklist');
          });
        }

        if (lowTasks.length > 0) {
          taskList += '### 🟢 優先度: 低\n\n';
          lowTasks.forEach((task, i) => {
            taskList += renderTask(task, i + 1, format === 'checklist');
          });
        }

        if (noTasks.length > 0) {
          taskList += '### その他\n\n';
          noTasks.forEach((task, i) => {
            taskList += renderTask(task, i + 1, format === 'checklist');
          });
        }

      } else if (groupBy === 'assignee') {
        taskList += '## 📋 タスク一覧（担当者別）\n\n';

        const assigneeGroups = tasks.reduce((acc, task) => {
          const assignee = task.assignee || '未割り当て';
          if (!acc[assignee]) acc[assignee] = [];
          acc[assignee].push(task);
          return acc;
        }, {} as Record<string, typeof tasks>);

        Object.entries(assigneeGroups).forEach(([assignee, assigneeTasks]) => {
          taskList += `### 👤 ${assignee}\n\n`;
          assigneeTasks.forEach((task, i) => {
            taskList += renderTask(task, i + 1, format === 'checklist');
          });
        });

      } else if (groupBy === 'status') {
        taskList += '## 📋 タスク一覧（ステータス別）\n\n';

        const pendingTasks = tasks.filter(t => t.status === 'pending');
        const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
        const completedTasks = tasks.filter(t => t.status === 'completed');

        if (pendingTasks.length > 0) {
          taskList += '### ⏳ 未着手\n\n';
          pendingTasks.forEach((task, i) => {
            taskList += renderTask(task, i + 1, format === 'checklist');
          });
        }

        if (inProgressTasks.length > 0) {
          taskList += '### 🔄 進行中\n\n';
          inProgressTasks.forEach((task, i) => {
            taskList += renderTask(task, i + 1, format === 'checklist');
          });
        }

        if (completedTasks.length > 0) {
          taskList += '### ✅ 完了\n\n';
          completedTasks.forEach((task, i) => {
            taskList += renderTask(task, i + 1, format === 'checklist');
          });
        }

      } else {
        // No grouping
        taskList += '## 📋 タスク一覧\n\n';
        tasks.forEach((task, i) => {
          taskList += renderTask(task, i + 1, format === 'checklist');
        });
      }

      // Footer
      taskList += '---\n\n';
      taskList += `*最終更新: ${new Date().toLocaleString('ja-JP')}*\n`;

      return {
        taskList,
        format: format || 'markdown',
        totalTasks: tasks.length,
        tasksByStatus,
      };
    } catch (error) {
      throw new Error(
        `Failed to create task list: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
});
