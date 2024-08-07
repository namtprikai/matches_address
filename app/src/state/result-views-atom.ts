import { atomWithRefresh } from "jotai/utils";
import { type result_views } from "../schema";
import { selectedSheetIdAtom } from "./selected-sheet-id-atom";

type ResultViews = typeof result_views.$inferSelect;

export const resultViewsAtom = atomWithRefresh(
  async (get): Promise<ResultViews[]> => {
    const selectedSheetId = get(selectedSheetIdAtom);
    const result = await window.ipcRenderer.invoke("selectResultViews", {
      sheetId: selectedSheetId,
    });
    return result;
  },
);
