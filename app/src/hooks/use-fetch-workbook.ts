import { useEffect, useState } from "react";
import { type workbooks } from "../schema";

type Workbook = typeof workbooks.$inferSelect;

export const useFetchWorkbook = ({
  id,
}: {
  id: string | undefined;
}): {
  data: Workbook | undefined;
  refetch: (workbookId: string) => Promise<void>;
} => {
  const [workbook, setWorkbook] = useState<Workbook>();

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
