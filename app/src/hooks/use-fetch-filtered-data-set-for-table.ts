import { useCallback, useEffect, useState } from "react";
import { type TableViewProps } from "../@types/charts";
import { type data_set_detail_buildings } from "../schema";

export const useFetchFilterDataSetForTable = ({ resultId, type, columns }: { resultId: number } & (
    { type: "buildings"; columns: (keyof typeof data_set_detail_buildings.$inferSelect)[]; } |
    { type: "area"; columns: (keyof typeof data_set_detail_buildings.$inferSelect)[]; })): {
        tableProps: TableViewProps;
        refetch: () => Promise<void>;
    } => {

    const [props, setProps] = useState<TableViewProps>({ columns: [], data: [] });

    const fetchFilteredDataSetDetailForTable = useCallback(async (): Promise<void> => {
        const result = await window.ipcRenderer.invoke("filterDataSetForTable", { resultId, type, columns });
        setProps(result);
    }, [resultId, type, columns]);

    useEffect(() => {
        fetchFilteredDataSetDetailForTable().catch(console.error);
    }, [fetchFilteredDataSetDetailForTable]);

    if (type === "buildings") {
        return { tableProps: props, refetch: fetchFilteredDataSetDetailForTable };
    }

    return { tableProps: props, refetch: async () => { return } }
}
