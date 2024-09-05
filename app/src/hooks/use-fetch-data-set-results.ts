import { useEffect, useState } from "react";
import { type SelectDataSetResult } from "../schema";

export const useFetchDataSetResults = (): {
  data: SelectDataSetResult[];
  refetch: () => Promise<void>;
} => {
  const [dataSetResults, setDataSetResults] = useState<SelectDataSetResult[]>(
    [],
  );

  const fetchDataSetResults = async (): Promise<void> => {
    const result = await window.ipcRenderer.invoke("selectDataSetResults");
    setDataSetResults(result);
  };

  useEffect(() => {
    fetchDataSetResults().catch(console.error);
  }, []);

  return { data: dataSetResults, refetch: fetchDataSetResults };
};
