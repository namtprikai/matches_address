import {
  Dialog,
  makeStyles,
  DialogTrigger,
  Checkbox,
} from "@fluentui/react-components";
import { DismissFilled } from "@fluentui/react-icons";
import { useState } from "react";
import { type ReturnUseDialogState } from "../hooks/use-dialog-state";
import { Button } from "./ui/button";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogBody } from "./ui/dialog-body";
import { DialogTitle } from "./ui/dialog-title";
import { DialogContent } from "./ui/dialog-content";
import { DialogActions } from "./ui/dialog-actions";

const useStyles = makeStyles({
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    width: "24px",
    height: "24px",
    ":hover": { cursor: "pointer" },
  },
  disabledButton: {
    backgroundColor: "#EFF0F0",
    color: "#89949F",
    cursor: "not-allowed",
    ":hover": {
      backgroundColor: "#EFF0F0",
    },
  },
});

const DEFAULT_SELECTED_COLUMNS = [
  "世帯人数",
  "15歳未満人数",
  "15歳以上64歳以下人数",
  "65歳以上人数",
  "15歳未満構成比",
  "15歳以上64歳以下構成比",
  "65歳以上構成比",
  "最大年齢",
  "最小年齢",
  "男女比",
  "住定期間",
  "水道使用量変化率_suido_residence",
  "最大使用水量_suido_residence",
  "合計使用水量_suido_residence",
  "閉栓フラグ_suido_residence",
  "構造名称_touki_residence",
  "登記日付_touki_residence",
];

/** 仮: もっと具体的に書けそうなら書く・書けなかったら普通にstringとして書く */
type ExplanatoryVariable = string;

type Props = {
  dialogState: ReturnUseDialogState;
  onSelected: (data: ExplanatoryVariable[]) => void;
  columnOptions: ExplanatoryVariable[];
  initialValues: ExplanatoryVariable[] | undefined;
};

export const DialogExplanatoryVariables = ({
  dialogState,
  onSelected,
  columnOptions,
  initialValues,
}: Props): JSX.Element => {
  const styles = useStyles();
  const [selectedExplanatoryVariable, setSelectedExplanatoryVariable] =
    useState<ExplanatoryVariable[]>(
      initialValues
        ? [...DEFAULT_SELECTED_COLUMNS, ...initialValues]
        : DEFAULT_SELECTED_COLUMNS,
    );

  const { isOpen: isDialogOpen, setIsOpen: setIsDialogOpen } = dialogState;

  const handleClick = (): void => {
    onSelected(selectedExplanatoryVariable);
    setIsDialogOpen(false);
  };

  return (
    <Dialog
      onOpenChange={(_, { open }) => setIsDialogOpen(open)}
      open={isDialogOpen}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  appearance="subtle"
                  aria-label="close"
                  icon={
                    <DismissFilled className={styles.icon} strokeWidth={2} />
                  }
                />
              </DialogTrigger>
            }
            className={styles.dialogTitle}
          >
            説明変数に使うカラムの選択
          </DialogTitle>
          <DialogContent>
            {columnOptions.map((column) => (
              <Checkbox
                key={column}
                checked={selectedExplanatoryVariable.includes(column)}
                disabled={DEFAULT_SELECTED_COLUMNS.includes(column)}
                id={column}
                label={column}
                name={column}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedExplanatoryVariable((prev) => [...prev, column]);
                  } else {
                    setSelectedExplanatoryVariable(
                      (prev) => prev.filter((item) => item !== column), // ここでfilterを使っているのは、配列の中から選択した要素を取り除くため
                    );
                  }
                }}
              />
            ))}
          </DialogContent>
          <DialogActions>
            <Button
              appearance="primary"
              className={
                selectedExplanatoryVariable.length === 0
                  ? styles.disabledButton
                  : ""
              }
              disabled={selectedExplanatoryVariable.length === 0}
              onClick={handleClick}
            >
              保存
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
