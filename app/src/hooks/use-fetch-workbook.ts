import { useEffect, useState } from "react";
import { type SelectWorkbook } from "../schema";

export const useFetchWorkbook = ({
  id,
}: {
  id: string | undefined;
}): {
  data: SelectWorkbook | undefined;
  refetch: (workbookId: string) => Promise<void>;
} => {
  const [workbook, setWorkbook] = useState<SelectWorkbook>();

  const fetchWorkbook = async (workbookId: string): Promise<void> => {
    const result = await window.ipcRenderer.invoke("selectWorkbook", {
      id: Number(workbookId),
    });
    setWorkbook(result);
  };

  useEffect(() => {
    if (!id) return;
    fetchWorkbook(id).catch(console.error);
  }, [id]);

  return { data: workbook, refetch: fetchWorkbook };
};
