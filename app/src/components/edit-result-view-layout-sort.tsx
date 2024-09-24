import { ChevronRightRegular, ChevronLeftRegular } from "@fluentui/react-icons";
import { makeStyles, tokens } from "@fluentui/react-components";
import { useAtom } from "jotai";
import { resultViewsAtom } from "../state/result-views-atom";
import { selectedResultViewIdAtom } from "../state/selected-result-view-id-atom";
import { selectedResultViewAtom } from "../state/selected-result-view-atom";
import { Field } from "./ui/field";
import { Button } from "./ui/button";

const useStyles = makeStyles({
  inner: {
    display: "flex",
    justifyContent: "center",
    gap: tokens.spacingHorizontalXL,
  },
});

export const EditResultViewLayoutSort = (): JSX.Element => {
  const styles = useStyles();

  const [selectedResultViewId] = useAtom(selectedResultViewIdAtom);
  const [selectedResultView, refresh] = useAtom(selectedResultViewAtom);
  const [resultViews, refreshResultViews] = useAtom(resultViewsAtom);

  /** validationはbuttonのdisabledで管理 */
  const handleNext = async (): Promise<void> => {
    if (!selectedResultViewId) return;
    if (!selectedResultView?.sheet_id) return;
    await window.ipcRenderer.invoke("updateResultViewsLayoutIndex", {
      sheetId: selectedResultView.sheet_id,
      resultViewId: selectedResultViewId,
      value: {
        layoutIndex: selectedResultView?.layoutIndex || 0,
      },
    });
    refresh();
    refreshResultViews();
  };

  /** validationはbuttonのdisabledで管理 */
  const handlePrev = async (): Promise<void> => {
    if (!selectedResultViewId) return;
    if (!selectedResultView?.sheet_id) return;
    await window.ipcRenderer.invoke("updateResultViewsLayoutIndex", {
      sheetId: selectedResultView.sheet_id,
      resultViewId: selectedResultViewId,
      value: {
        layoutIndex: (selectedResultView?.layoutIndex || 0) - 2,
      },
    });
    refresh();
    refreshResultViews();
  };

  return (
    <Field label="ビューの表示順序の変更">
      {selectedResultView?.layoutIndex} - {resultViews.length}
      <div className={styles.inner}>
        <Button
          disabled={
            !selectedResultViewId || selectedResultView?.layoutIndex === 1
          }
          icon={<ChevronLeftRegular />}
          onClick={handlePrev}
        >
          前へ
        </Button>
        <Button
          disabled={selectedResultView?.layoutIndex === resultViews.length}
          icon={<ChevronRightRegular />}
          onClick={handleNext}
        >
          次へ
        </Button>
      </div>
    </Field>
  );
};
