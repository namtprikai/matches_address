import { atomWithRefresh } from "jotai/utils";
import { type SelectResultSheet } from "../schema";
import { selectedWorkbookIdAtom } from "./selected-workbook-id-atom";

export const resultSheetsAtom = atomWithRefresh(
  async (get): Promise<SelectResultSheet[]> => {
    const selectedWorkbookId = get(selectedWorkbookIdAtom);
    if (!selectedWorkbookId) return [];
    const result = await window.ipcRenderer.invoke("selectResultSheets", {
      workbookId: selectedWorkbookId,
    });
    return result;
  },
);
