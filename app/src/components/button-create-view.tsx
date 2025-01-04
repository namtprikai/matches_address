import { useAtom } from "jotai";
import { selectedResultSheetIdAtom } from "../state/selected-result-sheet-id-atom";
import { useFetchResultViews } from "../hooks/use-fetch-result-views";
import { useFetchDataSetResults } from "../hooks/use-fetch-data-set-results";
import { Button } from "./ui/button";

export const ButtonCreateView = (): JSX.Element => {
  const { data: dataSetResults } = useFetchDataSetResults();
  const [selectedResultSheetId] = useAtom(selectedResultSheetIdAtom);
  const { data: resultViews, mutate } = useFetchResultViews({
    sheetId: selectedResultSheetId,
  });
  const handleClick = async (): Promise<void> => {
    if (!resultViews) return;
    const newLayoutIndex = resultViews.length + 1;
    const { insertedId } = await window.ipcRenderer.invoke(
      "insertResultViews",
      {
        data_set_result_id: dataSetResults?.[0]?.id,
        sheet_id: selectedResultSheetId,
        layoutIndex: newLayoutIndex,
        parameters: [],
      },
    );
    await mutate();
  };

  return (
    <div>
      <Button onClick={handleClick}>新規</Button>
    </div>
  );
};
