import { describe, it, expect } from 'vitest'
import { renderMarkdown } from './markdown'

describe('renderMarkdown', () => {
  it('returns empty string for null', () => {
    expect(renderMarkdown(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(renderMarkdown(undefined)).toBe('')
  })

  it('returns empty string for empty string', () => {
    expect(renderMarkdown('')).toBe('')
  })

  it('renders a paragraph', () => {
    const result = renderMarkdown('Hello world')
    expect(result).toContain('<p>Hello world</p>')
  })

  it('renders bold text', () => {
    const result = renderMarkdown('**bold text**')
    expect(result).toContain('<strong>bold text</strong>')
  })

  it('renders italic text', () => {
    const result = renderMarkdown('*italic text*')
    expect(result).toContain('<em>italic text</em>')
  })

  it('renders links', () => {
    const result = renderMarkdown('[link](https://example.com)')
    expect(result).toContain('<a href="https://example.com">link</a>')
  })

  it('renders headings', () => {
    const result = renderMarkdown('# Heading 1')
    expect(result).toContain('<h1>Heading 1</h1>')
  })

  it('renders code blocks', () => {
    const result = renderMarkdown('```\nconst x = 1\n```')
    expect(result).toContain('<code>')
    expect(result).toContain('const x = 1')
  })

  it('renders inline code', () => {
    const result = renderMarkdown('Use `console.log`')
    expect(result).toContain('<code>console.log</code>')
  })

  it('renders unordered lists', () => {
    const result = renderMarkdown('- item 1\n- item 2')
    expect(result).toContain('<ul>')
    expect(result).toContain('<li>item 1</li>')
    expect(result).toContain('<li>item 2</li>')
  })

  it('renders ordered lists', () => {
    const result = renderMarkdown('1. first\n2. second')
    expect(result).toContain('<ol>')
    expect(result).toContain('<li>first</li>')
    expect(result).toContain('<li>second</li>')
  })
})
