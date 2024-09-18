import { atomWithRefresh } from "jotai/utils";
import { type SelectResultView } from "../schema";
import { selectedResultViewIdAtom } from "./selected-result-view-id-atom";

export const selectedResultViewAtom = atomWithRefresh(
  async (get): Promise<SelectResultView | undefined> => {
    const selectedResultViewId = get(selectedResultViewIdAtom);
    if (!selectedResultViewId) return undefined;
    const result = await window.ipcRenderer.invoke("selectResultView", {
      resultViewId: selectedResultViewId,
    });
    return result;
  },
);
