import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const createReportTool = createTool({
  id: 'createReportTool',
  description: 'Generate structured reports from meeting minutes in Markdown format. Supports meeting reports, progress reports, and executive summaries.',
  inputSchema: z.object({
    reportType: z.enum(['meeting', 'progress', 'executive_summary', 'custom']).describe('Type of report to generate'),
    title: z.string().describe('Report title'),
    metadata: z.object({
      date: z.string().optional().describe('Meeting or report date'),
      attendees: z.array(z.string()).optional().describe('List of attendees'),
      duration: z.string().optional().describe('Meeting duration'),
      location: z.string().optional().describe('Meeting location or format (e.g., "Online", "Conference Room A")'),
    }).optional().describe('Report metadata'),
    sections: z.array(z.object({
      title: z.string().describe('Section title'),
      content: z.string().describe('Section content'),
      subsections: z.array(z.object({
        title: z.string(),
        content: z.string(),
      })).optional().describe('Optional subsections'),
    })).describe('Report sections'),
    actionItems: z.array(z.object({
      task: z.string(),
      assignee: z.string().optional(),
      deadline: z.string().optional(),
      priority: z.enum(['high', 'medium', 'low']).optional(),
      status: z.enum(['pending', 'in_progress', 'completed']).optional(),
    })).optional().describe('Action items to include'),
    decisions: z.array(z.string()).optional().describe('Key decisions made'),
    nextMeeting: z.object({
      date: z.string(),
      agenda: z.string().optional(),
    }).optional().describe('Next meeting information'),
  }),
  outputSchema: z.object({
    report: z.string(),
    format: z.string(),
    sectionCount: z.number(),
  }),
  execute: async ({ context, input }) => {
    try {
      const { reportType, title, metadata, sections, actionItems, decisions, nextMeeting } = input;

      let report = '';

      // Title
      report += `# ${title}\n\n`;

      // Metadata section
      if (metadata) {
        report += '---\n\n';
        if (metadata.date) report += `**日時**: ${metadata.date}\n\n`;
        if (metadata.attendees && metadata.attendees.length > 0) {
          report += `**参加者**: ${metadata.attendees.join(', ')}\n\n`;
        }
        if (metadata.duration) report += `**所要時間**: ${metadata.duration}\n\n`;
        if (metadata.location) report += `**場所**: ${metadata.location}\n\n`;
        report += '---\n\n';
      }

      // Main sections
      sections.forEach((section, index) => {
        report += `## ${section.title}\n\n`;
        report += `${section.content}\n\n`;

        // Subsections
        if (section.subsections && section.subsections.length > 0) {
          section.subsections.forEach((subsection) => {
            report += `### ${subsection.title}\n\n`;
            report += `${subsection.content}\n\n`;
          });
        }
      });

      // Decisions section
      if (decisions && decisions.length > 0) {
        report += '## 📋 決定事項\n\n';
        decisions.forEach((decision, index) => {
          report += `${index + 1}. ${decision}\n`;
        });
        report += '\n';
      }

      // Action items section
      if (actionItems && actionItems.length > 0) {
        report += '## ✅ アクションアイテム\n\n';

        // Group by priority
        const highPriority = actionItems.filter(item => item.priority === 'high');
        const mediumPriority = actionItems.filter(item => item.priority === 'medium');
        const lowPriority = actionItems.filter(item => item.priority === 'low');
        const noPriority = actionItems.filter(item => !item.priority);

        const renderItems = (items: typeof actionItems, priorityLabel?: string) => {
          if (items.length === 0) return;

          if (priorityLabel) {
            report += `### ${priorityLabel}\n\n`;
          }

          items.forEach((item, index) => {
            const statusIcon = item.status === 'completed' ? '✅' : item.status === 'in_progress' ? '🔄' : '⏳';
            report += `${index + 1}. ${statusIcon} **${item.task}**\n`;
            if (item.assignee) report += `   - 担当: ${item.assignee}\n`;
            if (item.deadline) report += `   - 期限: ${item.deadline}\n`;
            if (item.status) report += `   - 状態: ${item.status === 'completed' ? '完了' : item.status === 'in_progress' ? '進行中' : '未着手'}\n`;
            report += '\n';
          });
        };

        renderItems(highPriority, '🔴 優先度: 高');
        renderItems(mediumPriority, '🟡 優先度: 中');
        renderItems(lowPriority, '🟢 優先度: 低');
        renderItems(noPriority);
      }

      // Next meeting section
      if (nextMeeting) {
        report += '## 📅 次回ミーティング\n\n';
        report += `**日時**: ${nextMeeting.date}\n\n`;
        if (nextMeeting.agenda) {
          report += `**議題**: ${nextMeeting.agenda}\n\n`;
        }
      }

      // Footer
      report += '---\n\n';
      report += `*このレポートは自動生成されました - ${new Date().toLocaleDateString('ja-JP')}*\n`;

      return {
        report,
        format: 'markdown',
        sectionCount: sections.length,
      };
    } catch (error) {
      throw new Error(
        `Failed to create report: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
});
