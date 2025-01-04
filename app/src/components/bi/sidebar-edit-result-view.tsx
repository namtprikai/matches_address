import {
  makeStyles,
  tokens,
  InlineDrawer,
  DrawerHeaderTitle,
  DrawerHeader,
  DrawerBody,
} from "@fluentui/react-components";
import { useAtom } from "jotai";
import { Suspense, useEffect, useState } from "react";
import { useFetchDataSetResults } from "../../hooks/use-fetch-data-set-results";
import { selectedResultSheetIdAtom } from "../../state/selected-result-sheet-id-atom";
import { Field } from "../ui/field";
import { Select } from "../ui/select";
import { FormEditResultView } from "./form-edit-result-view";
import { EditResultViewLayoutSort } from "./edit-result-view-layout-sort";
import { DebugCreateDatasets } from "./_debug-create-datasets";

const useStyles = makeStyles({
  drawer: {
    minHeight: "100vh",
  },
  heading: {
    fontSize: tokens.fontSizeBase400,
    lineHeight: tokens.lineHeightBase600,
    fontWeight: tokens.fontWeightSemibold,
  },
  drawerBodyInner: {
    display: "grid",
    gap: tokens.spacingVerticalXXL,
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalNone}`,
  },
  isAddView: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXL,
  },
});

export const SidebarEditResultView = (): JSX.Element => {
  const styles = useStyles();
  const [selectedResultSheetId] = useAtom(selectedResultSheetIdAtom);

  const { data: dataSetResults } = useFetchDataSetResults();

  /** データセットを選択 */
  const [selectedDataSetId, setSelectedDataSetId] = useState<string>("");
  useEffect(() => {
    if (dataSetResults) {
      setSelectedDataSetId(String(dataSetResults[0]?.id));
    }
  }, [dataSetResults]);
  /** */

  return (
    <InlineDrawer className={styles.drawer} open>
      <DrawerHeader>
        <DrawerHeaderTitle className={styles.heading}>
          ビューの設定
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>
        <Field label="データセットを選択">
          <Select
            onChange={(e) => setSelectedDataSetId(e.target.value)}
            value={selectedDataSetId}
          >
            {dataSetResults?.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.title || "タイトルなし"}
              </option>
            ))}
          </Select>
        </Field>

        <div className={styles.drawerBodyInner}>
          <Suspense>
            <FormEditResultView selectedResultSheetId={selectedResultSheetId} />
            <EditResultViewLayoutSort />
          </Suspense>
        </div>

        <DebugCreateDatasets />
      </DrawerBody>
    </InlineDrawer>
  );
};
