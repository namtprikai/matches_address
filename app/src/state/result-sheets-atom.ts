import { atomWithRefresh } from "jotai/utils";
import { type result_sheets } from "../schema";
import { selectedWorkbookIdAtom } from "./selected-workbook-id-atom";

type ResultSheets = typeof result_sheets.$inferSelect;

export const resultSheetsAtom = atomWithRefresh(
  async (get): Promise<ResultSheets[]> => {
    const selectedWorkbookId = get(selectedWorkbookIdAtom);
    if (!selectedWorkbookId) return [];
    const result = await window.ipcRenderer.invoke("selectResultSheets", {
      workbookId: selectedWorkbookId,
    });
    return result;
  },
);
