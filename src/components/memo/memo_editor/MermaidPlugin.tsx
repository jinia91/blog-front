import React, {Fragment, useCallback, useEffect, useRef, useState} from "react";
import {getCodeString} from "rehype-rewrite";
import mermaid from "mermaid";
import {padding} from "polished";

const randomid = () => parseInt(String(Math.random() * 1e15), 10).toString(36);
export const Code = ({inline, children = [], className, ...props}: any) => {
  const demoid = useRef(`dome${randomid()}`);
  const [container, setContainer] = useState<HTMLLIElement | null>(null);
  const [copied, setCopied] = useState(false);
  const isMermaid =
    className && /^language-mermaid/.test(className.toLocaleLowerCase());
  const code = children
    ? getCodeString(props.node.children)
    : children[0] || "";
  
  // Mermaid 초기화 및 다크 모드 스타일 설정
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
    });
  }, []);
  
  useEffect(() => {
    if (container && isMermaid && demoid.current && code) {
      mermaid
        .render(demoid.current, code)
        .then(({svg, bindFunctions}) => {
          console.log("svg:", svg);
          container.innerHTML = svg;
          if (bindFunctions) {
            bindFunctions(container);
          }
        })
        .catch((error) => {
          console.log("error:", error);
        });
    }
  }, [container, isMermaid, code, demoid]);
  
  const handleCopyClick = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
    }).catch((err) => {
      console.error('Error copying text: ', err);
    });
  };
  
  const language = className.split("-")[1] == "highlight" ? "" : className.split("-")[1]
  
  const refElement = useCallback((node: any) => {
    if (node !== null) {
      setContainer(node);
    }
  }, []);
  
  if (isMermaid) {
    return (
      <Fragment>
        <code id={demoid.current} style={{display: "none"}}/>
        <code className={className} ref={refElement} data-name="mermaid"/>
      </Fragment>
    );
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
      <div className={"p-4"}>
        <code className={`${className}`}>
        {children}
        </code>
      </div>
    </div>
  </Fragment>;
};
