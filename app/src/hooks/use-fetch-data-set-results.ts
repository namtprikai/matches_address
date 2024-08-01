import { useEffect, useState } from "react";
import { type data_set_results } from "../schema";

type DataSetResult = typeof data_set_results.$inferSelect;

export const useFetchDataSetResults = (): {
  data: DataSetResult[];
  refetch: () => Promise<void>;
} => {
  const [dataSetResults, setDataSetResults] = useState<DataSetResult[]>([]);

  const fetchDataSetResults = async (): Promise<void> => {
    const result = await window.ipcRenderer.invoke("selectDataSetResults");
    setDataSetResults(result);
  };

  useEffect(() => {
    fetchDataSetResults().catch(console.error);
  }, []);

  return { data: dataSetResults, refetch: fetchDataSetResults };
};
