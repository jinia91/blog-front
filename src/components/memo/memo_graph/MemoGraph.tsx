'use client'

import { ForceGraph2D } from 'react-force-graph'
import { type LinkObject, type NodeObject } from 'force-graph'
import { type FolderInfo } from '@/memo/application/domain/models'
import React, { useContext } from 'react'
import { ReferenceModeContext } from '@/components/memo/MemoEditContextProvider'
import { useRouter } from 'next/navigation'
import { useFolder } from '@/memo/application/usecase/folder-usecases'

export default function MemoGraph (): React.ReactElement | null {
  const { folders }: { folders: FolderInfo[] } = useFolder()
  const { isReferenceMode }: { isReferenceMode: boolean } = useContext(ReferenceModeContext)
  const router = useRouter()
  console.log('MemoGraph 렌더링 체크 1')
  if (folders == null || isReferenceMode || folders[0].id === 1) {
    return null
  }
  console.log('MemoGraph 렌더링 체크 2')
  const flattenFolder = (folder: FolderInfo): FolderInfo[] => {
    const children = folder.children.flatMap(child => flattenFolder(child))
    return [folder, ...children]
  }
  const flattenFolders = folders.flatMap(folder => flattenFolder(folder))

  const createFolderNodes = (folder: FolderInfo, group: number, nodes: any): void => {
    nodes.push({
      id: folder.id ?? -1,
      name: folder.name,
      group
    })
  }

  const folderNodes: NodeObject[] = []
  flattenFolders.filter(
    folder => folder.id !== null
  ).forEach((folder, index) => {
    createFolderNodes(folder, 6, folderNodes)
  })

  const memoNodes: NodeObject[] = flattenFolders.flatMap(folder => folder.memos.map((memo, index) => ({
    id: memo.id,
    name: memo.title,
    group: 109
  })))

  const nodes: NodeObject[] = [...folderNodes, ...memoNodes]

  const memoLinks: LinkObject[] = flattenFolders.flatMap(folder =>
    folder.memos.flatMap(memo =>
      memo.references.map(ref => ({
        source: memo.id,
        target: ref.id
      }))
    )
  )

  const folderLinks: LinkObject[] = flattenFolders.filter(
    folder => folder.id !== null
  ).flatMap(folder =>
    folder.children.map(child => ({
      source: child.id ?? -1,
      target: folder.id ?? -1
    }))
  )

  const folderMemoLinks: LinkObject[] = flattenFolders.filter(
    folder => folder.id !== null
  ).flatMap(folder =>
    folder.memos.map(memo => ({
      source: memo.id,
      target: folder.id ?? -1
    }))
  )

  const links: LinkObject[] = [...memoLinks, ...folderLinks, ...folderMemoLinks]

  const graphData = { nodes, links }

  function isFolder (node: any): boolean {
    return node.group < 100
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ctx.fillText(label, node.x as number, (node.y as number) + size)
    } else {
      const radius = 5
      ctx.beginPath()
      ctx.arc(node.x as number, node.y as number, radius, 0, 2 * Math.PI, false)
      ctx.fillStyle = node.color
      ctx.fill()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ctx.fillText(label, node.x as number, (node.y as number) + radius + fontSize)
    }
  }

  const handleNodeClick = (node: any): void => {
    if (isFolder(node)) return
    router.push(`/memo/${node.id}`)
  }
  console.log('MemoGraph 렌더링 체크 3')

  return (
    <div>
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
  )
}
