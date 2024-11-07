import { Fragment, lazy, Suspense, useDeferredValue, useState } from "react";
import { Dialog, DialogTrigger, makeStyles } from "@fluentui/react-components";
import { type FetchAreaGroupsArg } from "../../ipc-main-listeners/fetch-area-groups";
import { Field } from "../ui/field";
import { Button } from "../ui/button";
import { DialogSurface } from "../ui/dialog-surface";
import { DialogBody } from "../ui/dialog-body";
import { DialogTitle } from "../ui/dialog-title";
import { DialogContent } from "../ui/dialog-content";
import { DialogActions } from "../ui/dialog-actions";
import { Input } from "../ui/input";

const useStyles = makeStyles({
  selectedOptions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px 8px",
    fontSize: "12px",
  },
  layout: {
    display: "flex",
    gap: "4px",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  editButton: {
    minWidth: "50px",
    fontSize: "12px",
  },
  noSelectedLabel: {
    lineHeight: "32px",
    fontSize: "12px",
  },
});

// コンポーネントを遅延評価で読み込むことでパフォーマンスに配慮
// 元は１つ上の親コンポーネントで読み込んでいたが、Dialogを開いた際に読み込まれるように変更
const AreaFilterFormOptions = lazy(() =>
  import("./form-area-filter-options").then((module) => ({
    default: module.FormAreaFilterOptions,
  })),
);

type Props = {
  areas: string[];
  onSave: (value: string[]) => void;
} & FetchAreaGroupsArg;

/**
 * 地域フィルタ用のフィールド表示コンポーネント
 */
export const FormAreaFilter = (props: Props): JSX.Element => {
  const [open, setOpen] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(props.areas);
  const [searchText, setSearchText] = useState("");

  // 検索テキストの逐次変更でなく、再計算が終わるまで遅延させることで画面のチラつき・カクツキを減らす
  // reference: https://ja.react.dev/reference/react/useDeferredValue#deferring-re-rendering-for-a-part-of-the-ui
  const deferredSearchText = useDeferredValue(searchText);

  const handleClick = (): void => {
    props.onSave(selectedAreas);
  };

  const handleAllClear = (): void => {
    setSelectedAreas([]);
  };

  const styles = useStyles();

  return (
    <Field label="地域">
      <div className={styles.layout}>
        <div>
          {props.areas.length === 0 ? (
            <p className={styles.noSelectedLabel}>地域を選択してください</p>
          ) : (
            <div className={styles.selectedOptions}>
              {props.areas.map((area, index) => (
                <Fragment key={area}>
                  {index !== 0 && <span>/</span>}
                  <span key={area}>{area}</span>
                </Fragment>
              ))}
            </div>
          )}
        </div>
        <div>
          <Button
            className={styles.editButton}
            onClick={() => {
              setOpen(true);
            }}
          >
            変更
          </Button>
        </div>
      </div>
      <Dialog
        onOpenChange={() => {
          setOpen((prev) => !prev);
        }}
        open={open}
      >
        <DialogSurface>
          <DialogBody>
            <DialogTitle
              action={
                <Input
                  onChange={(e) => {
                    setSearchText(e.target.value);
                  }}
                  placeholder="地域を検索"
                  value={searchText}
                />
              }
            >
              地域を選択
            </DialogTitle>
            <DialogContent border>
              <Suspense fallback={<></>}>
                <AreaFilterFormOptions
                  dataSetResultId={props.dataSetResultId}
                  onChange={setSelectedAreas}
                  searchText={deferredSearchText} // 遅延評価された値を渡す
                  selectedAreas={selectedAreas}
                  unit={props.unit}
                />
              </Suspense>
            </DialogContent>
            <DialogActions>
              <Button appearance="outline" onClick={handleAllClear}>
                すべてクリア
              </Button>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="primary" onClick={handleClick}>
                  保存
                </Button>
              </DialogTrigger>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </Field>
  );
};
