"use client";

import { ForceGraph2D } from 'react-force-graph';
import {LinkObject, NodeObject} from "force-graph";
import {Memo, SimpleMemo} from "@/domain/Memo";

export default function MemoGraph({ memos, className }: { memos: SimpleMemo[], className?: string }) {
  const nodes : NodeObject[] = memos.map((memo) => ({
    id: memo.memoId,
    name: memo.title,
    
  }));
  
  const links : LinkObject[] = memos.flatMap((memo) =>
    memo.references.map((ref) => ({
      source: memo.memoId,
      target: ref.referenceId,
    }))
  );
  
  const graphData = { nodes, links };
  
  return (
    <div className={className}>
      <ForceGraph2D
        graphData={graphData}
        nodeId="id"
        nodeLabel="name"
        nodeAutoColorBy="group"
        linkDirectionalParticles="value"
        nodeCanvasObject={(node, ctx, globalScale) => {
          const radius = 5;
          ctx.beginPath();
          ctx.arc(node.x as number, node.y as number, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color;
          ctx.fill();
          
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px dos-font`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'white';
          ctx.fillText(label, node.x as number, (node.y  as number) + radius + fontSize);
        }}
      />
    </div>
  );
}
