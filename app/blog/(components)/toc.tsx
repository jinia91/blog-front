import React from 'react'

interface TOCProps {
  tocData: string
}

const getHeadingForTOC = (source: string): Array<{ level: number, text: string, id: string }> => {
  const idMap = new Map<string, number>()
  return source.split('\n')
    .filter((line) => line.match(/^#+\s/))
    .map((line) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const level = line.match(/^#+/)[0].length
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
    })
}
export const TOC = ({ tocData }: TOCProps): React.ReactElement => {
  const toc = getHeadingForTOC(tocData)
  return (
    <nav className="p-5 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl">
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
