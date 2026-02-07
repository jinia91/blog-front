'use client'

import { ForceGraph2D } from 'react-force-graph'
import { type LinkObject, type NodeObject } from 'force-graph'
import { folderManager } from '../../(domain)/folder'
import React, { useEffect } from 'react'
import { useFolderAndMemo } from '../../(usecase)/memo-folder-usecases'
import { useRouter } from 'next/navigation'
import { useMemoSystem } from '../../(usecase)/memo-system-usecases'
import { FOLDER_MEMO_GROUP_SEPARATOR, memoGraphUtils } from './memo-graph-utils'

interface MemoGraphProps {
  onToggleView?: () => void
}

export default function MemoGraph ({ onToggleView }: MemoGraphProps): React.ReactElement | null {
  const { folders } = useFolderAndMemo()
  const { setMemoEditorSharedContext } = useMemoSystem()
  const router = useRouter()

  useEffect(() => {
    setMemoEditorSharedContext({ id: '', title: '' })
  }, [])

  if (folders === null) {
    return null
  }

  const flattenFolders = folders.flatMap(folder => folderManager.flattenFolder(folder))
  const folderNodes: NodeObject[] = memoGraphUtils.buildFolderNodes(flattenFolders)
  const memoNodes: NodeObject[] = memoGraphUtils.buildMemoNodes(flattenFolders)
  const nodes: NodeObject[] = [...folderNodes, ...memoNodes]

  const memoLinks: LinkObject[] = memoGraphUtils.buildMemoLinks(flattenFolders)
  const folderLinks: LinkObject[] = memoGraphUtils.buildFolderLinks(flattenFolders)
  const folderMemoLinks: LinkObject[] = memoGraphUtils.buildFolderMemoLinks(flattenFolders)
  const links: LinkObject[] = [...memoLinks, ...folderLinks, ...folderMemoLinks]

  const graphData = { nodes, links }

  function isFolder (node: any): boolean {
    return node.group < FOLDER_MEMO_GROUP_SEPARATOR
  }

  const nodeCanvasObject = (node: any, ctx: CanvasRenderingContext2D, globalScale: number): void => {
    const label = node.name
    const fontSize = 12 / globalScale
    ctx.font = `${fontSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'white'

    if (isFolder(node)) {
      const size = 10
      ctx.fillStyle = node.color
      ctx.fillRect(node.x as number - size / 2, node.y as number - size / 2, size, size)
      if (globalScale > 1) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        ctx.fillText(label, node.x as number, (node.y as number) + size)
      }
    } else {
      const radius = 5
      ctx.beginPath()
      ctx.arc(node.x as number, node.y as number, radius, 0, 2 * Math.PI, false)
      ctx.fillStyle = node.color
      ctx.fill()
      if (globalScale > 1) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        ctx.fillText(label, node.x as number, (node.y as number) + radius + fontSize)
      }
    }
  }

  const handleNodeClick = (node: any): void => {
    if (isFolder(node)) return
    router.push(`/memo/${node.id}`)
  }

  return (
    <div className="w-full h-full flex flex-col bg-black dos-font">
      {/* Header */}
      <div className="border-b border-green-400/50 bg-black px-2 py-1 dos-font shrink-0 flex items-center gap-2 relative z-10">
        <button
          onClick={onToggleView}
          className="text-green-400 hover:bg-green-400 hover:text-black text-xs border border-green-400/50 px-2 py-0.5 transition-colors shrink-0"
          title="챗봇으로 전환"
          type="button"
        >
          [챗봇]
        </button>
        <span className="text-green-400 terminal-glow">■</span>
        <span className="text-green-400 terminal-glow text-sm">메모 그래프</span>
      </div>
      {/* Graph */}
      <div className="flex-1 overflow-hidden" style={{ position: 'relative' }}>
        <ForceGraph2D
          graphData={graphData}
          nodeId="id"
          nodeLabel="name"
          nodeAutoColorBy="group"
          linkColor={() => 'red'}
          linkWidth={1}
          linkCurvature={0}
          linkDirectionalParticles={2}
          linkDirectionalArrowLength={3}
          nodeCanvasObject={nodeCanvasObject}
          onNodeClick={handleNodeClick}
        />
      </div>
    </div>
  )
}
