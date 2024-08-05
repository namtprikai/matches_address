import { useEffect, useState } from "react";
import { type result_sheets } from "../schema";

type ResultSheet = typeof result_sheets.$inferSelect;

export const useFetchResultSheets = ({
  id,
}: {
  id: string | undefined;
}): { data: ResultSheet[]; refetch: (workbookId: string) => Promise<void> } => {
  const [resultSheets, setResultSheets] = useState<ResultSheet[]>([]);

  const fetchResultSheets = async (workbookId: string): Promise<void> => {
    const result = await window.ipcRenderer.invoke("selectResultSheets", {
      workbookId: Number(workbookId),
    });
    setResultSheets(result);
  };

  useEffect(() => {
    if (!id) return;
    fetchResultSheets(id).catch(console.error);
  }, [id]);

  return { data: resultSheets, refetch: fetchResultSheets };
};
