"use client";
import React, { useEffect, useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import {fetchMemo} from "@/api/memo";
import dynamic from 'next/dynamic';
import {SimpleMemo} from "@/components/modal";
import {LinkObject, NodeObject} from "force-graph";

interface GraphNode {
  id: string;
  name: string;
  group: string;
  color: string;
  x: number;
  y: number;
}

export default function MemoGraph({ memos }: { memos: SimpleMemo[] }) {
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
    <div className="bg-gray-900 overflow-hidden flex flex-grow border-2 w-80">
      <ForceGraph2D
        graphData={graphData}
        nodeId="id"
        nodeLabel="name"
        nodeAutoColorBy="group"
        linkDirectionalParticles="value"
        nodeCanvasObject={(node : GraphNode , ctx, globalScale) => {
          const radius = 5;
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color; // Use the node's color
          ctx.fill();
          
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px dos-font`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'white';
          ctx.fillText(label, node.x, node.y + radius + fontSize);
        }}
      />
    </div>
  );
}
