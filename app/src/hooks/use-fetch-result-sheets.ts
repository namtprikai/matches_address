import { useEffect, useState } from "react";
import { type SelectResultSheet } from "../schema";

export const useFetchResultSheets = ({
  id,
}: {
  id: string | undefined;
}): {
  data: SelectResultSheet[];
  refetch: (workbookId: string) => Promise<void>;
} => {
  const [resultSheets, setResultSheets] = useState<SelectResultSheet[]>([]);

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
