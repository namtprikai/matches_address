import { Dismiss24Regular, ArrowDownloadRegular } from "@fluentui/react-icons";
import {
  Dialog,
  DialogTrigger,
  makeStyles,
  tokens,
  Option,
} from "@fluentui/react-components";
import { useState } from "react";
import { DialogSurface } from "../ui/dialog-surface";
import { DialogBody } from "../ui/dialog-body";
import { DialogTitle } from "../ui/dialog-title";
import { DialogActions } from "../ui/dialog-actions";
import { Button } from "../ui/button";
import { DialogContent } from "../ui/dialog-content";
import { Dropdown } from "../ui/dropdown";
import { useDialogState } from "../../hooks/use-dialog-state";
import { OUTPUT_FILE_TYPES } from "../../config/file-types";
import { OUTPUT_COORDINATES } from "../../config/output-coordinates";

const useStyles = makeStyles({
  cardHeaderSubtle: {
    padding: `${tokens.spacingHorizontalXXS} ${tokens.spacingVerticalXXS}`,
    border: "none",
    minWidth: "24px",
    minHeight: "24px",
  },
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  dropdown: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    "& > label": {
      fontSize: "12px",
    },
  },
});

export function DownloadDialog({
  onSubmit,
}: {
  onSubmit: (fileType: string, coordinate: string) => void;
}): JSX.Element {
  const styles = useStyles();
  const { isOpen, setIsOpen } = useDialogState();
  const [selectedFileType, setSelectedFileType] = useState<string>(
    OUTPUT_FILE_TYPES[0].type,
  );
  const [selectedCoordinate, setSelectedCoordinate] = useState(
    OUTPUT_COORDINATES[0].code,
  );

  return (
    <Dialog onOpenChange={(_, { open }) => setIsOpen(open)} open={isOpen}>
      <DialogTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          className={styles.cardHeaderSubtle}
          icon={<ArrowDownloadRegular />}
        />
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  appearance="subtle"
                  aria-label="close"
                  icon={
                    <Dismiss24Regular
                      color={tokens.colorNeutralForeground1}
                      strokeWidth={2}
                    />
                  }
                />
              </DialogTrigger>
            }
          >
            形式を選んでダウンロード
          </DialogTitle>
          <DialogContent className={styles.dialogContent}>
            <div className={styles.dropdown}>
              <label id="output-file-type">出力ファイル形式</label>
              <Dropdown
                aria-labelledby="output-file-type"
                defaultSelectedOptions={[OUTPUT_FILE_TYPES[0].type]}
                defaultValue={OUTPUT_FILE_TYPES[0].name}
                onOptionSelect={(_, data) =>
                  data.optionValue && setSelectedFileType(data.optionValue)
                }
              >
                {OUTPUT_FILE_TYPES.map((option) => (
                  <Option
                    key={option.type}
                    text={option.name}
                    value={option.type}
                  >
                    {option.name}
                  </Option>
                ))}
              </Dropdown>
            </div>
            <div className={styles.dropdown}>
              <label id="output-coordinate">出力座標系</label>
              <Dropdown
                aria-labelledby="output-coordinate"
                defaultSelectedOptions={[OUTPUT_COORDINATES[0].code]}
                defaultValue={OUTPUT_COORDINATES[0].name}
                onOptionSelect={(_, data) =>
                  data.optionValue && setSelectedCoordinate(data.optionValue)
                }
              >
                {OUTPUT_COORDINATES.map((option) => (
                  <Option
                    key={option.code}
                    text={option.name}
                    value={option.code}
                  >
                    {option.name}
                  </Option>
                ))}
              </Dropdown>
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="primary"
              onClick={() => {
                onSubmit(selectedFileType, selectedCoordinate);
                setIsOpen(false);
              }}
            >
              ダウンロード準備を開始する
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
