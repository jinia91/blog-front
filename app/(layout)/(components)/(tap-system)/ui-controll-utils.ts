import type React from 'react'

export function ensureFocusInHorizontalView (scrollContainerRef: React.RefObject<HTMLDivElement>, selectedIdx: number): void {
  if (scrollContainerRef.current != null) {
    const container = scrollContainerRef.current
    const selectedTabElement = container.children[selectedIdx] as HTMLDivElement

    if (selectedTabElement != null) {
      const containerWidth = container.offsetWidth
      const containerScrollLeft = container.scrollLeft
      const selectedTabOffset = selectedTabElement.offsetLeft
      const selectedTabWidth = selectedTabElement.offsetWidth

      const selectedTabEnd = selectedTabOffset + selectedTabWidth
      const containerEnd = containerScrollLeft + containerWidth

      if (selectedTabOffset < containerScrollLeft) {
        container.scrollLeft = selectedTabOffset
      } else if (selectedTabEnd > containerEnd) {
        container.scrollLeft = selectedTabOffset - (containerWidth - selectedTabWidth)
      }
    }
  }
}
