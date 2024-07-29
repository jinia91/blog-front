export const restoreTabsFromLocalStorage = (path: string): any => {
  const savedTabs = localStorage.getItem('tabs')
  const tabsList = (savedTabs != null) ? JSON.parse(savedTabs) : null
  if (path.startsWith('/login/oauth2')) {
    if (tabsList == null || tabsList.length === 0) {
      return [{ name: '/', context: '/' }]
    } else {
      return tabsList
    }
  }
  if (tabsList == null || (tabsList.length === 0 && path !== '/empty')) {
    return path === '/empty' ? [] : [{ name: path, context: path }]
  }
  if ((tabsList.length === 0 && path === '/empty') || (tabsList.length !== 0 && path === '/empty')) {
    return []
  }
  return tabsList
}
