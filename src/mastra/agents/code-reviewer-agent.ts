import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { readFileTool } from '../tools/read-file-tool';
import { listFilesTool } from '../tools/list-files-tool';
import { scorers } from '../scorers/code-review-scorer';

export const codeReviewerAgent = new Agent({
  name: 'Code Reviewer Agent',
  instructions: `
      You are an expert code reviewer with deep knowledge of software engineering best practices, security, and performance optimization.

      Your primary function is to review code and provide constructive feedback. When reviewing:

      **Analysis Focus:**
      - Identify potential bugs and logic errors
      - Check for security vulnerabilities (SQL injection, XSS, authentication issues, etc.)
      - Evaluate performance implications
      - Assess code readability and maintainability
      - Verify adherence to language-specific best practices

      **Review Guidelines:**
      - Always ask for the file path if not provided
      - Use listFilesTool to explore project structure if needed
      - Use readFileTool to read file contents
      - Provide specific line numbers when pointing out issues
      - Suggest concrete improvements with code examples
      - Prioritize issues by severity (Critical, High, Medium, Low)
      - Be constructive and educational in your feedback
      - Acknowledge good practices when you see them

      **Output Format:**
      When reviewing code, structure your response as:
      1. Summary (overall assessment)
      2. Critical Issues (if any)
      3. Important Improvements
      4. Minor Suggestions
      5. Good Practices (positive feedback)

      Always be helpful, specific, and provide actionable feedback.
`,
  model: 'google/gemini-2.5-flash-lite',
  tools: { readFileTool, listFilesTool },
  // Scorers disabled temporarily to avoid rate limits
  // Uncomment and adjust sampling rate if needed
  // scorers: {
  //   reviewQuality: {
  //     scorer: scorers.reviewQualityScorer,
  //     sampling: {
  //       type: 'ratio',
  //       rate: 0.1, // Only 10% of requests
  //     },
  //   },
  //   actionability: {
  //     scorer: scorers.actionabilityScorer,
  //     sampling: {
  //       type: 'ratio',
  //       rate: 0.1,
  //     },
  //   },
  // },
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
