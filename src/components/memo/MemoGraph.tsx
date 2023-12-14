"use client";

import { ForceGraph2D } from 'react-force-graph';
import {LinkObject, NodeObject} from "force-graph";
import {FolderInfo, Memo, SimpleMemoInfo} from "@/domain/Memo";

export default function MemoGraph({ folders, className }: { folders: FolderInfo[], className?: string }) {
  
  const flattenFolder = (folder: FolderInfo): FolderInfo[] => {
    const children = folder.children.flatMap(child => flattenFolder(child));
    return [folder, ...children];
  }
  
  const flattenFolders = folders.flatMap(folder => flattenFolder(folder));
  
  const createFolderNodes = (folder: FolderInfo, group: number, nodes: any): void => {
    nodes.push({
      id: folder.id || -1,
      name: folder.name,
      group: group
    });
  };
  
  const folderNodes: NodeObject[] = [];
  flattenFolders.forEach((folder, index) => createFolderNodes(folder, 6, folderNodes));
  
  const memoNodes: NodeObject[] = flattenFolders.flatMap(folder => folder.memos.map((memo, index) => ({
    id: memo.memoId,
    name: memo.title,
    group: 109
  })));
  
  const nodes: NodeObject[] = [...folderNodes, ...memoNodes];
  
  const memoLinks: LinkObject[] = flattenFolders.flatMap(folder =>
    folder.memos.flatMap(memo =>
      memo.references.map(ref => ({
        source: memo.memoId,
        target: ref.referenceId
      }))
    )
  );
  
  const folderLinks: LinkObject[] = flattenFolders.flatMap(folder =>
    folder.children.map(child => ({
      source: folder.id || -1,
      target: child.id || -1
    }))
  );
  
  const folderMemoLinks: LinkObject[] = flattenFolders.flatMap(folder =>
    folder.memos.map(memo => ({
      source: folder.id || -1,
      target: memo.memoId
    }))
  );
  
  const links: LinkObject[] = [...memoLinks, ...folderLinks, ...folderMemoLinks];
  
  const graphData = {nodes, links};
  
  const nodeCanvasObject = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name;
    const fontSize = 12 / globalScale;
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    
    if (node.group < 100) {
      const size = 10;
      ctx.fillStyle = node.color;
      ctx.fillRect(node.x as number - size / 2, node.y as number - size / 2, size, size);
      ctx.fillText(label, node.x as number, (node.y as number) + size);
    } else {
      const radius = 5;
      ctx.beginPath();
      ctx.arc(node.x as number, node.y as number, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = node.color;
      ctx.fill();
      ctx.fillText(label, node.x as number, (node.y as number) + radius + fontSize);
    }
  };
  
  return (
    <div className={className}>
      <ForceGraph2D
        graphData={graphData}
        nodeId="id"
        nodeLabel="name"
        nodeAutoColorBy="group"
        linkColor={() => 'red'}
        linkWidth={3}
        linkCurvature={1}
        linkDirectionalParticles={2}
        linkDirectionalArrowLength={3}
        nodeCanvasObject={nodeCanvasObject}
      />
    </div>
  );
}
