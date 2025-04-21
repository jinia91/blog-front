'use client'
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

export const TOC = ({ tocData }: TOCProps): React.ReactElement | null => {
  const [expanded, setExpanded] = React.useState(true)
  const toc = getHeadingForTOC(tocData)
  React.useEffect(() => {
    const handleResize = (): void => {
      if (window.innerWidth < 1024) {
        setExpanded(true)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className={`relative transition-all duration-500 ease-in-out ${expanded ? '2xl:w-72' : '2xl:w-20'} w-full`}>
      <button
        onClick={() => {
          setExpanded(!expanded)
        }}
        className="absolute right-0 text-gray-300 hover:text-green-300 text-sm hidden 2xl:block"
        aria-label="Toggle TOC"
      >
        {expanded ? 'TOC 접기 ▲' : 'TOC 열기 ▼'}
      </button>
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded ? 'max-h-[1000px]' : 'max-h-0'}`}
      >
        <nav className="p-5 bg-gray-700 border border-gray-600 rounded-lg shadow-2xl mt-8">
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
      </div>
    </div>
  )
}
