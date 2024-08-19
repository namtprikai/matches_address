import { useEffect, useState } from "react";
import { type data_set_results, type result_views } from "../schema";

type ResultViews = typeof result_views.$inferSelect;
type DataSetResults = typeof data_set_results.$inferSelect;
type Result = {
  result_views: ResultViews;
  data_set_results: DataSetResults | null;
};

export const useFetchResultViews = ({
  sheetId,
}: {
  sheetId: number | undefined;
}): { data: Result[]; refetch: (sheetId: number) => Promise<void> } => {
  const [resultViews, setResultViews] = useState<Result[]>([]);

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
