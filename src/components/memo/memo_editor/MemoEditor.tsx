'use client'

import React, { useContext, useState } from 'react'
import { type Memo } from '@/api/models'
import { MemoEditContext } from '@/components/memo/MemoFolderContainer'
import { TitleInput } from '@/components/memo/folder_navigator/MemoTitleEditInput'
import useStompClient from '@/components/memo/memo_editor/MemoEditWebsocket'
import useFetchMemoHook from '@/components/memo/memo_editor/useFetchMemoHook'
import {
  AdmonitionDirectiveDescriptor,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  directivesPlugin,
  frontmatterPlugin,
  headingsPlugin,
  imagePlugin,
  KitchenSinkToolbar,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  quotePlugin,
  type SandpackConfig,
  sandpackPlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin
} from '@mdxeditor/editor'

export default function MemoEditor ({ pageMemoNumber }: { pageMemoNumber: string }): React.ReactElement {
  const [memo, setMemo] = useState<Memo | null>(null)
  const { underwritingTitle, setUnderwritingTitle, setUnderwritingId }: {
    underwritingTitle: string
    setUnderwritingTitle: React.Dispatch<React.SetStateAction<string>>
    setUnderwritingId: React.Dispatch<React.SetStateAction<string>>
  } = useContext(MemoEditContext)
  const [content, setContent] = useState<string>(memo?.content ?? '')
  useStompClient(pageMemoNumber, underwritingTitle, content)
  useFetchMemoHook(pageMemoNumber, setMemo, setUnderwritingTitle, setUnderwritingId, setContent)
  const defaultSnippetContent = `
export default function App() {
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
`.trim()

  const reactSandpackConfig: SandpackConfig = {
    defaultPreset: 'react',
    presets: [
      {
        label: 'React',
        name: 'react',
        meta: 'live',
        sandpackTemplate: 'react',
        sandpackTheme: 'light',
        snippetFileName: '/App.js',
        snippetLanguage: 'jsx',
        initialSnippetContent: defaultSnippetContent
      }
    ]
  }
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const allPlugins = (diffMarkdown: string) => [
    toolbarPlugin({ toolbarContents: () => <KitchenSinkToolbar/> }),
    listsPlugin(),
    quotePlugin(),
    headingsPlugin(),
    linkPlugin(),
    linkDialogPlugin(),
    imagePlugin({ imageUploadHandler: async () => '/sample-image.png' }),
    tablePlugin(),
    thematicBreakPlugin(),
    frontmatterPlugin(),
    codeBlockPlugin({ defaultCodeBlockLanguage: 'txt' }),
    sandpackPlugin({ sandpackConfig: reactSandpackConfig }),
    codeMirrorPlugin({ codeBlockLanguages: { js: 'JavaScript', css: 'CSS', txt: 'text', tsx: 'TypeScript' } }),
    directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown }),
    markdownShortcutPlugin()
  ]
  return (
    <div className={'border-4'}>
      <TitleInput title={underwritingTitle} setTitle={setUnderwritingTitle}/>
      {/* editor */}
      <div className="mb-4 flex-grow border-2">
        {content == null || memo == null
          ? <div></div>
          : <MDXEditor
            onChange={setContent}
            markdown={content}
            className="dark-theme dark-editor border-amber-600
            border-4"
            contentEditableClassName=""
            plugins={allPlugins(content)}
          />
        }
      </div>
    </div>
  )
}
