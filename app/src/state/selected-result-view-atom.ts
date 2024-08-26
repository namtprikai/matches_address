import { atomWithRefresh } from "jotai/utils";
import { type SelectResultViewResponse } from "../ipc-main-listeners/select-result-view";
import { selectedResultViewIdAtom } from "./selected-result-view-id-atom";

export const selectedResultViewAtom = atomWithRefresh(
    async (get): Promise<SelectResultViewResponse | undefined> => {
        const selectedResultViewId = get(selectedResultViewIdAtom);
        if (!selectedResultViewId) return undefined;
        const result = await window.ipcRenderer.invoke("selectResultView", {
            resultViewId: selectedResultViewId,
        });
        return result;
    },
);