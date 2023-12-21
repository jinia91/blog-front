import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { getCodeString } from 'rehype-rewrite'
import mermaid from 'mermaid'

function randomId (): string {
  return parseInt(String(Math.random() * 1e15), 10).toString(36)
}

export const Code = ({ inline, children = [], className, ...props }: any): React.JSX.Element => {
  const id = useRef(`dome${randomId()}`)
  const [container, setContainer] = useState<HTMLLIElement | null>(null)
  const [copied, setCopied] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const isMermaid = className != null && /^language-mermaid/.test(className.toLocaleLowerCase())
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const code = children != null ? getCodeString(props.node.children) : ''

  // Mermaid 초기화 및 다크 모드 스타일 설정
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark'
    })
  }, [])

  useEffect(() => {
    if ((container != null) && isMermaid && (id.current !== '') && (code !== '')) {
      mermaid
        .render(id.current, code)
        .then(({ svg, bindFunctions }) => {
          console.log('svg:', svg)
          container.innerHTML = svg
          if (bindFunctions != null) {
            bindFunctions(container)
          }
        })
        .catch((error) => {
          console.log('error:', error)
        })
    }
  }, [container, isMermaid, code, id])

  const handleCopyClick = (): void => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
    }).catch((err) => {
      console.error('Error copying text: ', err)
    })
  }

  const language = className?.split('-')[1] !== 'highlight' ? className == null ? '' : className.split('-')[1] : ''

  const refElement = useCallback((node: any) => {
    if (node !== null) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      setContainer(node)
    }
  }, [])

  if (isMermaid) {
    return (
      <Fragment>
        <code id={id.current} style={{ display: 'none' }}/>
        <code className={className} ref={refElement} data-name="mermaid"/>
      </Fragment>
    )
  }
  return <Fragment>
    <div className="code-block relative my-4">
      <div className="code-header flex justify-between bg-gray-300 border-b border-gray-500 py-1 px-4 rounded-t">
        <span className="code-language text-sm font-pixel text-gray-700">{language}</span>
        <button
          onClick={handleCopyClick}
          className="copy-button bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 border border-gray-600 rounded-2xl"
        >
          {copied ? '복사됨' : '코드 복사'}
        </button>
      </div>
      <div className={'p-4'}>
        <code className={`${className}`}>
          {children}
        </code>
      </div>
    </div>
  </Fragment>
}
