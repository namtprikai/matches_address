import { atomWithRefresh } from "jotai/utils";
import { type result_views } from "../schema";
import { selectedResultSheetIdAtom } from "./selected-result-sheet-id-atom";

type ResultViews = typeof result_views.$inferSelect;

export const resultViewsAtom = atomWithRefresh(
  async (get): Promise<ResultViews[]> => {
    const selectedResultSheetId = get(selectedResultSheetIdAtom);
    if (!selectedResultSheetId) return [];
    const result = await window.ipcRenderer.invoke("selectResultViews", {
      sheetId: selectedResultSheetId,
    });
    return result;
  },
);
