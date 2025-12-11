import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const createEmailTool = createTool({
  id: 'createEmailTool',
  description: 'Generate professional emails from meeting content. Creates formatted emails with subject, body, and action items.',
  inputSchema: z.object({
    emailType: z.enum(['summary', 'action_items', 'follow_up']).describe('Type of email: summary (meeting overview), action_items (tasks notification), follow_up (next steps)'),
    subject: z.string().describe('Email subject line'),
    body: z.string().describe('Main email content - meeting summary, context, or message'),
    actionItemsText: z.string().optional().describe('Action items as formatted text (e.g., "1. Task A - Assignee: John, Deadline: 12/15\\n2. Task B - Assignee: Jane")'),
    nextSteps: z.string().optional().describe('Next steps or closing remarks'),
  }),
  outputSchema: z.object({
    email: z.string(),
    subject: z.string(),
    wordCount: z.number(),
  }),
  execute: async ({ context, input }) => {
    try {
      const { emailType, subject, body, actionItemsText, nextSteps } = input;

      // Build email
      let email = '';

      // Subject
      email += `Subject: ${subject}\n\n`;

      // Greeting
      email += 'お疲れ様です\n\n';

      // Body based on email type
      switch (emailType) {
        case 'summary':
          email += '## 会議サマリー\n\n';
          email += `${body}\n\n`;
          break;

        case 'action_items':
          email += '## アクションアイテムのご連絡\n\n';
          email += `${body}\n\n`;
          if (actionItemsText) {
            email += '### 対応が必要なタスク\n\n';
            email += `${actionItemsText}\n\n`;
          }
          break;

        case 'follow_up':
          email += '## フォローアップ\n\n';
          email += `${body}\n\n`;
          break;
      }

      // Next steps
      if (nextSteps) {
        email += '## 次のステップ\n\n';
        email += `${nextSteps}\n\n`;
      }

      // Closing
      email += 'よろしくお願いします。\n';

      const wordCount = email.length;

      return {
        email,
        subject,
        wordCount,
      };
    } catch (error) {
      throw new Error(
        `Failed to create email: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  },
});
