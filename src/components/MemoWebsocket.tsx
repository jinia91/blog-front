import React, {useState, useEffect} from 'react';
import SockJS from 'sockjs-client';
import {Client, Stomp} from '@stomp/stompjs';
import MDEditor from '@uiw/react-md-editor';

export default function MemoEditor() {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const [memoId, setMemoId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  
  useEffect(() => {
    const socket = new SockJS('http://localhost:7777/memo');
    const client = Stomp.over(socket);
    
    client.connect({}, () => {
      setStompClient(client);
    });
    
    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, []);
  
  const initMemo = () => {
    if (stompClient) {
      let command = {
        type: "InitMemo",
        authorId: 1,
        title: title,
        content: content,
      };
      
      stompClient.publish({
        destination: "/app/initMemo",
        body: JSON.stringify(command)
      });
      
      setMemoId("pending");
    }
  };
  
  return (
    <div className="bg-black text-green-400 font-mono p-4">
      <div className="mb-4">
        <input
          className="bg-gray-900 text-green-400 p-2 mb-2 w-full outline-none caret-green-400 focus:outline-none"
          type="text"
          placeholder="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <MDEditor
          value={content}
          onChange={(value) => {
            if (typeof value === 'string') {
              setContent(value);
            }
          }} height={400}
        />
      </div>
      <button
        className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
        onClick={initMemo}
      >
        Initialize Memo
      </button>
    </div>
  );
}
