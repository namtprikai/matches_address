import { useEffect, useState } from "react";

type Workbook = {
    id: number;
    title: string | null;
    created_at: string | null;
}

export const TableWorkbook = (): JSX.Element => {
    const [data, setData] = useState<Workbook[]>([]);
    const fetchData = async (): Promise<void> => {
        const result = await window.ipcRenderer.invoke("selectWorkbooks");
        console.log({result})
        setData(result);
      }
    
      useEffect(() => {
        fetchData().catch(console.error);
      }, []);
    

    return (
        <div>
            {
                data.map((item) => (
                    <div key={item.id}>
                        {item.title}
                    </div>
                ))
            }
        </div>
    );
}