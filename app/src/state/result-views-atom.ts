import { atomWithRefresh } from "jotai/utils";
import { type ReadResultViewsResponse } from "../ipc-main-listeners/read-result-views";
import { selectedResultSheetIdAtom } from "./selected-result-sheet-id-atom";

export const resultViewsAtom = atomWithRefresh(
  async (get): Promise<ReadResultViewsResponse> => {
    const selectedResultSheetId = get(selectedResultSheetIdAtom);
    if (!selectedResultSheetId) return [];
    const result = await window.ipcRenderer.invoke("readResultViews", {
      sheetId: selectedResultSheetId,
    });
    return result;
  },
);
