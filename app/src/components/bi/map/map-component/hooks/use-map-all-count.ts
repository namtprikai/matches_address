import { useEffect, useState } from "react";
import { type View } from "../../../../../bi-modules/interfaces/view";

export const useMapAllCount = ({
  dataSetResultId,
  unit,
}: {
  dataSetResultId: View["dataSetResultId"];
  unit: View["unit"];
}): { allCount: number | null } => {
  const [allCount, setAllCount] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      const result = await window.ipcRenderer.invoke("selectDataSetCount", {
        dataSetResultId,
        unit,
      });
      setAllCount(result.count);
    })().catch(console.error);
  }, [dataSetResultId, unit]);

  return { allCount };
};
