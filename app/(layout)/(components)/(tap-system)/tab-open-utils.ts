export const tabOpen = (href: string): void => {
  const link = document.createElement('a')
  link.href = href
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
