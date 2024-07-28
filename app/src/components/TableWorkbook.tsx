import { useEffect, useState } from "react";

/** [TODO]スキーマから生成できないか確認する */
type Workbook = {
  id: number;
  title: string | null;
  created_at: string | null;
};

export const TableWorkbook = (): JSX.Element => {
  const [data, setData] = useState<Workbook[]>([]);
  const fetchData = async (): Promise<void> => {
    const result = await window.ipcRenderer.invoke("selectWorkbooks");
    setData(result);
  };

  useEffect(() => {
    fetchData().catch(console.error);
  }, []);

  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>
          <a href={`#analysis/workbook/${item.id}`}>{item.title} - 作成日:{item.created_at}</a>
        </div>
      ))}
    </div>
  );
};
