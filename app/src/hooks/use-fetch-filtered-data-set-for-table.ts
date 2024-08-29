import { useCallback, useEffect, useState } from "react";
import { type data_set_detail_buildings } from "../schema";
import { type TableProps } from "../@types/charts";

export const useFetchFilterDataSetForTable = ({ resultId, type, columns }: { resultId: number } & (
    { type: "building"; columns: (keyof typeof data_set_detail_buildings.$inferSelect)[]; } |
    { type: "area"; columns: (keyof typeof data_set_detail_buildings.$inferSelect)[]; })): {
        tableProps: TableProps;
        refetch: () => Promise<void>;
    } => {

    const [props, setProps] = useState<TableProps>({ columns: [], data: [] });

    const fetchFilteredDataSetDetailForTable = useCallback(async (): Promise<void> => {
        const result = await window.ipcRenderer.invoke("filterDataSetForTable", { resultId, type, columns });
        setProps(result);
    }, [resultId, type, columns]);

    useEffect(() => {
        fetchFilteredDataSetDetailForTable().catch(console.error);
    }, [fetchFilteredDataSetDetailForTable]);

    if (type === "building") {
        return { tableProps: props, refetch: fetchFilteredDataSetDetailForTable };
    }

    return { tableProps: props, refetch: async () => { return } }
}
