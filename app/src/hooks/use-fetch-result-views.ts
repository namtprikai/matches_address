import { useEffect, useState } from "react";
import { type SelectDataSetResult } from "../schema";
import { type SelectResultViewResponse } from "../ipc-main-listeners/select-result-view";

type Result = {
  result_views: SelectResultViewResponse;
  data_set_results: SelectDataSetResult | null;
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
