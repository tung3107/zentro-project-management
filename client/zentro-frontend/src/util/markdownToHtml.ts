/**
 * Convert markdown text to HTML
 * This is used for AI-generated markdown content to be compatible with JoditEditor
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return ''

  let html = markdown

  // Convert headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

  // Convert bold
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')

  // Convert italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')

  // Convert inline code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>')

  // Convert blockquotes
  html = html.replace(/^\> (.+$)/gim, '<blockquote>$1</blockquote>')

  // Convert unordered lists
  html = html.replace(/^\* (.+$)/gim, '<li>$1</li>')
  html = html.replace(/^- (.+$)/gim, '<li>$1</li>')

  // Wrap consecutive <li> tags in <ul>
  html = html.replace(/(<li>.*<\/li>(\n|$))+/g, (match) => {
    return '<ul>' + match + '</ul>'
  })

  // Convert ordered lists
  html = html.replace(/^\d+\. (.+$)/gim, '<li>$1</li>')

  // Wrap numbered list items in <ol>
  html = html.replace(/(<li>.*<\/li>(\n|$))+/g, (match) => {
    // Check if it's not already wrapped in ul
    if (!match.includes('<ul>')) {
      return '<ol>' + match + '</ol>'
    }
    return match
  })

  // Convert line breaks to <br> (double newline to paragraph)
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')

  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<h') && !html.startsWith('<ul') && !html.startsWith('<ol') && !html.startsWith('<blockquote')) {
    html = '<p>' + html + '</p>'
  }

  // Clean up multiple paragraph tags
  html = html.replace(/<\/p><p>/g, '</p>\n<p>')

  return html
}
