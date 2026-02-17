import { marked } from 'marked'

export function renderMarkdown(content: string | null | undefined): string {
  if (!content) return ''
  return marked.parse(content, { async: false }) as string
}
