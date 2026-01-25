export interface WikiLinkTrigger {
  triggered: boolean
  searchText: string
  startPosition: number
  endPosition: number
}

export function detectWikiLinkTrigger (text: string, cursorPosition: number): WikiLinkTrigger {
  // Find the last [[ before cursor
  const textBeforeCursor = text.substring(0, cursorPosition)
  const lastOpenBracket = textBeforeCursor.lastIndexOf('[[')

  if (lastOpenBracket === -1) {
    return { triggered: false, searchText: '', startPosition: -1, endPosition: -1 }
  }

  // Check if there's a ]] between [[ and cursor (meaning link is already closed)
  const textBetween = textBeforeCursor.substring(lastOpenBracket + 2)
  if (textBetween.includes(']]')) {
    return { triggered: false, searchText: '', startPosition: -1, endPosition: -1 }
  }

  // Extract search text (everything after [[)
  const searchText = textBetween

  return {
    triggered: true,
    searchText,
    startPosition: lastOpenBracket,
    endPosition: cursorPosition
  }
}

export function insertWikiLink (
  text: string,
  startPosition: number,
  endPosition: number,
  memoId: string,
  memoTitle: string
): string {
  const title = memoTitle !== '' ? memoTitle : 'Untitled'
  const linkText = `[[${title}]]<!-- reference: ${memoId} -->`
  return text.substring(0, startPosition) + linkText + text.substring(endPosition)
}
