import {
  Dialog,
  tokens,
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
  noDatasetWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "293px",
  },
  uploadWrap: {
    height: "325px",
    padding: `${tokens.spacingVerticalNone} ${tokens.spacingVerticalS} ${
      tokens.spacingHorizontalMNudge
    }`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  noDataset: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: tokens.colorNeutralForeground3,
    fontSize: tokens.fontSizeBase200,
  },
  tab: {
    padding: `${tokens.spacingVerticalMNudge} ${tokens.spacingHorizontalNone}`,
  },
  tabList: {
    display: "flex",
    gap: tokens.spacingVerticalXL,
    padding: `${tokens.spacingVerticalNone} ${tokens.spacingHorizontalXXL}`,
  },
  tableHeader: {
    display: "block",
  },
  tableBody: {
    height: "293px",
  },
  datasetTable: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: tokens.spacingVerticalS,
    ":hover": { cursor: "pointer" },
  },
  borderBottom: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  selectedDatasetTable: {
    border: "1px solid #6264A7",
    backgroundColor: "#E9EAF6",
  },
  datasetCell: {
    padding: `${tokens.spacingVerticalNone} ${tokens.spacingHorizontalXXL}`,
    fontSize: tokens.fontSizeBase200,
    display: "flex",
    alignItems: "center",
  },
  datasetHeader: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingVerticalM,
    color: tokens.colorNeutralForeground3,
    ":hover": { cursor: "pointer" },
  },
  tableHeight: {
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  dataName: {
    color: "#6264A7",
    textDecoration: "underline",
  },
  disabledButton: {
    backgroundColor: "#EFF0F0",
    color: "#89949F",
    cursor: "not-allowed",
    ":hover": {
      backgroundColor: "#EFF0F0",
    },
  },
  menuItemButton: {
    justifyContent: "flex-start",
    padding: 0,
    fontWeight: "normal",
    width: "100%",
  },
});

/** 仮: もっと具体的に書けそうなら書く・書けなかったら普通にstringとして書く */
type ExplanatoryVariable = string;

type Props = {
  dialogState: ReturnUseDialogState;
  onSelected: (data: ExplanatoryVariable[]) => void;
};

export const DialogImportExplanatoryVariables = ({
  dialogState,
  onSelected,
}: Props): JSX.Element => {
  const styles = useStyles();
  const [selectedExplanatoryVariable, setSelectedExplanatoryVariable] =
    useState<ExplanatoryVariable[]>([]);

  const { isOpen: isDialogOpen, setIsOpen: setIsDialogOpen } = dialogState;

  const mockColumnOptions = [
    "住所",
    "名前",
    "カラム名が入ります",
    "カラム名が入ります2",
  ];

  const handleClick = (): void => {
    // if (selectedDataSet !== null) {
    // const dataset = datasets[selectedDatasetIndex];
    onSelected(selectedExplanatoryVariable);
    setIsDialogOpen(false);
    // }
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
            ファイルをインポート
          </DialogTitle>
          <DialogContent padding={false}>
            {mockColumnOptions.map((column) => (
              <Checkbox
                key={column}
                checked={selectedExplanatoryVariable.includes(column)}
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
              インポート
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
