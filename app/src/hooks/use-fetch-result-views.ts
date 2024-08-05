import { useEffect, useState } from "react";
import { type result_views } from "../schema";

type ResultViews = typeof result_views.$inferSelect;

export const useFetchResultViews = ({
  sheetId,
}: {
  sheetId: number | undefined;
}): { data: ResultViews[]; refetch: (sheetId: number) => Promise<void> } => {
  const [resultViews, setResultViews] = useState<ResultViews[]>([]);

  const fetchResultViews = async (id: number): Promise<void> => {
    const result = await window.ipcRenderer.invoke("selectResultViews", {
      sheetId: id,
    });
    setResultViews(result);
  };

  useEffect(() => {
    if (!sheetId) return;
    fetchResultViews(sheetId).catch(console.error);
  }, [sheetId]);

  return { data: resultViews, refetch: fetchResultViews };
};
