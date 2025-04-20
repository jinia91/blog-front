import React from 'react'

interface TOCProps {
  tocData: string
}

const getHeadingForTOC = (source: string): Array<{ level: number, text: string, id: string }> => {
  const idMap = new Map<string, number>()
  return source.split('\n')
    .filter((line) => {
      const match = line.match(/^#+/)
      return /^#+\s/.test(line) && match !== null && match[0].length <= 2
    })
    .map((line) => {
      const match = line.match(/^#+/)
      if (match == null) return null
      const level = match[0].length
      const text = line.replace(/^#+\s*/, '').trim()
      let id = text.toLowerCase()
        .replace(/[^\w\sㄱ-힣-]/g, '')
        .replace(/\s+/g, '-')

      if (idMap.has(id)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const count = idMap.get(id)! + 1
        idMap.set(id, count)
        id = `${id}-${count - 1}`
      } else {
        idMap.set(id, 1)
      }

      return { level, text, id }
    }).filter((item): item is { level: number, text: string, id: string } => item !== null)
}
export const TOC = ({ tocData }: TOCProps): React.ReactElement => {
  const toc = getHeadingForTOC(tocData)
  return (
    <nav className="p-5 bg-gray-700 border border-gray-600 rounded-lg shadow-2xl">
      <h2 className="text-xl font-bold text-green-400 mb-3 border-b border-gray-700">Table of Contents</h2>
      <ul className="text-gray-300 space-y-2">
        {toc.map(({ level, text, id }) => (
          <li key={id} style={{ marginLeft: `${(level - 1) * 20}px` }}>
            <a href={`#${id}`} className="text-green-300 hover:text-green-500 transition-colors duration-200">
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
