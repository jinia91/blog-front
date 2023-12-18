import React, {Fragment, useCallback, useEffect, useRef, useState} from "react";
import {getCodeString} from "rehype-rewrite";
import mermaid from "mermaid";

const randomid = () => parseInt(String(Math.random() * 1e15), 10).toString(36);
export const Code = ({ inline, children = [], className, ...props }: any) => {
  const demoid = useRef(`dome${randomid()}`);
  const [container, setContainer] = useState<HTMLLIElement | null>(null);
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
        .then(({ svg, bindFunctions }) => {
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
  
  const refElement = useCallback((node:any) => {
    if (node !== null) {
      setContainer(node);
    }
  }, []);
  
  if (isMermaid) {
    return (
      <Fragment>
        <code id={demoid.current} style={{ display: "none" }} />
        <code className={className} ref={refElement} data-name="mermaid" />
      </Fragment>
    );
  }
  return <code className={className}>{children}</code>;
};
