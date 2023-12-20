
import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import {Client, Stomp} from '@stomp/stompjs';
import {useDebouncedCallback} from "use-debounce";

const useStompClient = (memoId: string, title: string, content: string) => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  
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
    debouncedUpdateMemo();
  }, [title, content]);
  
  const debouncedUpdateMemo = useDebouncedCallback(() => {
    if (stompClient && memoId) {
      let command = {
        type: "UpdateMemo",
        id: memoId,
        title: title,
        content: content
      };
      
      stompClient.publish({
        destination: "/app/updateMemo",
        body: JSON.stringify(command)
      });
    }
  }, 300);
};

export default useStompClient;
