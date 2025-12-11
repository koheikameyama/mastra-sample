import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const createEmailTool = createTool({
  id: 'createEmailTool',
  description: 'Generate professional emails from meeting minutes. Supports summary emails, action item notifications, and follow-up emails.',
  inputSchema: z.object({
    emailType: z.enum(['summary', 'action_items', 'follow_up', 'custom']).describe('Type of email to generate'),
    subject: z.string().describe('Email subject line'),
    recipients: z.array(z.string()).optional().describe('List of recipients (names or roles)'),
    content: z.object({
      greeting: z.string().optional().describe('Custom greeting (default: "お疲れ様です")'),
      body: z.string().describe('Main content or context for email generation'),
      actionItems: z.array(z.object({
        task: z.string(),
        assignee: z.string().optional(),
        deadline: z.string().optional(),
        priority: z.enum(['high', 'medium', 'low']).optional(),
      })).optional().describe('Action items to include'),
      nextSteps: z.string().optional().describe('Next steps or closing remarks'),
    }).describe('Email content structure'),
    tone: z.enum(['formal', 'casual', 'neutral']).optional().default('neutral').describe('Email tone'),
  }),
  outputSchema: z.object({
    email: z.string(),
    subject: z.string(),
    wordCount: z.number(),
  }),
  execute: async ({ context, input }) => {
    try {
      const { emailType, subject, recipients, content, tone } = input;

      // Build email parts
      let email = '';

      // Recipients (if specified)
      if (recipients && recipients.length > 0) {
        email += `To: ${recipients.join(', ')}\n`;
      }
      email += `Subject: ${subject}\n\n`;

      // Greeting
      const greeting = content.greeting || (tone === 'formal' ? 'お疲れ様でございます' : 'お疲れ様です');
      email += `${greeting}\n\n`;

      // Body based on email type
      switch (emailType) {
        case 'summary':
          email += '## 会議サマリー\n\n';
          email += `${content.body}\n\n`;
          break;

        case 'action_items':
          email += '## アクションアイテムのご連絡\n\n';
          email += `${content.body}\n\n`;
          if (content.actionItems && content.actionItems.length > 0) {
            email += '### 対応が必要なタスク\n\n';
            content.actionItems.forEach((item, index) => {
              const priorityIcon = item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢';
              email += `${index + 1}. ${priorityIcon} ${item.task}\n`;
              if (item.assignee) email += `   - 担当: ${item.assignee}\n`;
              if (item.deadline) email += `   - 期限: ${item.deadline}\n`;
              email += '\n';
            });
          }
          break;

        case 'follow_up':
          email += '## フォローアップ\n\n';
          email += `${content.body}\n\n`;
          break;

        case 'custom':
          email += `${content.body}\n\n`;
          break;
      }

      // Next steps
      if (content.nextSteps) {
        email += '## 次のステップ\n\n';
        email += `${content.nextSteps}\n\n`;
      }

      // Closing
      const closing = tone === 'formal'
        ? 'よろしくお願い申し上げます。'
        : 'よろしくお願いします。';
      email += `${closing}\n`;

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
