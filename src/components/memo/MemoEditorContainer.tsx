import MemoTable from "@/components/memo/MemoTable";
import React, {useContext, useEffect, useState} from "react";
import {fetchSimpleMemo, fetchMemoById} from "@/api/memo";
import {Memo, SimpleMemoInfo} from "@/domain/Memo";
import {usePathname} from "next/navigation";
import {TabBarContext} from "@/components/DynamicLayout";
import {MixedSizes, Panel, PanelGroup, PanelResizeHandle} from "react-resizable-panels";
import {getLocalStorage, setLocalStorage} from "@/utils/LocalStorage";

const initialTitleContextValue = {
  title: "",
  id: "",
  setTitle: () => {
  },
  setId: () => {
  }
};

export const MemoEditContext = React.createContext<any>(initialTitleContextValue)

export default function MemoEditorContainer({children}: { children: React.ReactNode }) {
  const [underwritingTitle, setUnderwritingTitle] = useState("")
  const [underwritingId, setUnderwritingId] = useState("");
  const [memos, setMemos] = useState<SimpleMemoInfo[] | null>(null);
  const path = usePathname();
  const isMemoPage = path.includes("/memo/");
  
  useEffect(() => {
    async function fetchData() {
      try {
        const fetchedMemos = await fetchSimpleMemo();
        setMemos(fetchedMemos);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    
    fetchData();
  }, []);
  
  const onLayout = (layout: MixedSizes[]) => {
    setLocalStorage("react-resizable-panels:layout", layout);
  };
  
  const defaultLayout = getLocalStorage<MixedSizes[] | null>("react-resizable-panels:layout")
  
  return (
    
    <MemoEditContext.Provider value={{title: underwritingTitle, memoId: underwritingId, setTitle: setUnderwritingTitle, setMemoId: setUnderwritingId}}>
      <div className="flex-grow overflow-auto">
        <PanelGroup
          direction="horizontal"
          className={"dos-font flex-col md:flex-row"}
          style={{height: '70vh', overflowY: 'auto'}}
          onLayout={onLayout}
        >
          <Panel
            defaultSizePercentage={defaultLayout ? defaultLayout[0].sizePercentage : 70}
            className={"bg-black text-green-400 font-mono p-4 flex flex-grow border-2"}
            minSizePercentage={20}
          >
            {children}
          </Panel>
          <PanelResizeHandle className="w-2 hover:bg-blue-800"/>
          <Panel
            defaultSizePercentage={defaultLayout ? defaultLayout[1].sizePercentage : 30}
            className="flex flex-1 overflow-auto"
            minSizePercentage={20}
          >
            {memos && (<MemoTable memos={memos}
                                  underwritingId={isMemoPage ? underwritingId : undefined }
                                  underwritingTitle={isMemoPage ? underwritingTitle : undefined}
                                  className="flex flex-1 min-w-0 flex-col"/>)}
          </Panel>
        </PanelGroup>
      </div>
    </MemoEditContext.Provider>
  )
}
