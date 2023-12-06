"use client";
import React, { useEffect, useState } from 'react';
import { ForceGraph2D } from 'react-force-graph';
import {fetchMemo} from "@/api/memo";

export default function MemoGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  
  useEffect(() => {
    fetchMemo().then(memos => {
      if (memos) {
        const nodes = memos.map(function (memo : any) {
          return {
            id: memo.memoId,
            name: memo.title
          };
        });
        const links = memos.flatMap(function (memo : any) {
            return memo.references.map(function (ref : any) {
              return {source: memo.memoId, target: ref};
            });
          }
        );
        setGraphData({ nodes, links });
      }
    });
  }, []);
  
  return (
    <div className="bg-gray-900">
      <ForceGraph2D
        graphData={graphData}
        nodeId="id"
        nodeLabel="name"
        nodeAutoColorBy="group"
        linkDirectionalParticles="value"
        width={window.innerWidth * 3 /4}
        height={window.innerHeight * 2 / 3}
        nodeCanvasObject={(node, ctx, globalScale) => {
          // Draw the node (circle)
          const radius = 5; // Adjust the size of the node as needed
          ctx.beginPath();
          ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color; // Use the node's color
          ctx.fill();
          
          // Draw the label
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px dos-font`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'white'; // Color of the text
          ctx.fillText(label, node.x, node.y + radius + fontSize); // Position the label below the node
        }}
      />
    </div>
  );
}
