
import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import {Client, Stomp} from '@stomp/stompjs';

const useStompClient = (memoId: string, title: string, content: string) => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  
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
  
  useEffect(() => {
    titleRef.current = title;
    contentRef.current = content;
  }, [title, content]);
  
  useEffect(() => {
    if (!stompClient) {
      return;
    }
    
    const timer = setInterval(() => {
      updateMemo();
    }, 1000);
    
    return () => clearInterval(timer);
  }, [stompClient, memoId]);
  
  const updateMemo = () => {
    if (stompClient && memoId) {
      let command = {
        type: "UpdateMemo",
        id: memoId,
        title: titleRef.current,
        content: contentRef.current,
      };
      
      stompClient.publish({
        destination: "/app/updateMemo",
        body: JSON.stringify(command)
      });
    }
  };
};

export default useStompClient;
