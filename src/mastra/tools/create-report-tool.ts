import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const createReportTool = createTool({
  id: 'createReportTool',
  description: 'Generate structured meeting reports in Markdown format with sections, decisions, and action items.',
  inputSchema: z.object({
    title: z.string().describe('Report title'),
    date: z.string().optional().describe('Meeting date'),
    attendees: z.string().optional().describe('Attendees as comma-separated text (e.g., "John, Jane, Bob")'),
    summary: z.string().describe('Meeting summary or main content'),
    decisions: z.string().optional().describe('Key decisions as formatted text (one per line)'),
    actionItems: z.string().optional().describe('Action items as formatted text (e.g., "1. Task A - Assignee: John, Deadline: 12/15")'),
    nextMeeting: z.string().optional().describe('Next meeting information'),
  }),
  outputSchema: z.object({
    report: z.string(),
    format: z.string(),
    sectionCount: z.number(),
  }),
  execute: async ({ context, input }) => {
    try {
      const { title, date, attendees, summary, decisions, actionItems, nextMeeting } = input;

      let report = '';
      let sectionCount = 0;

      // Title
      report += `# ${title}\n\n`;

      // Metadata section
      report += '---\n\n';
      if (date) report += `**日時**: ${date}\n\n`;
      if (attendees) report += `**参加者**: ${attendees}\n\n`;
      report += '---\n\n';

      // Summary section
      report += '## 📋 サマリー\n\n';
      report += `${summary}\n\n`;
      sectionCount++;

      // Decisions section
      if (decisions) {
        report += '## ✅ 決定事項\n\n';
        report += `${decisions}\n\n`;
        sectionCount++;
      }

      // Action items section
      if (actionItems) {
        report += '## 📝 アクションアイテム\n\n';
        report += `${actionItems}\n\n`;
        sectionCount++;
      }

      // Next meeting section
      if (nextMeeting) {
        report += '## 📅 次回ミーティング\n\n';
        report += `${nextMeeting}\n\n`;
        sectionCount++;
      }

      // Footer
      report += '---\n\n';
      report += `*このレポートは自動生成されました - ${new Date().toLocaleDateString('ja-JP')}*\n`;

      return {
        report,
        format: 'markdown',
        sectionCount,
      };
    } catch (error) {
      throw new Error(
        `Failed to create report: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
});
