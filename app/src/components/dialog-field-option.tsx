import {
  Checkbox,
  Dialog,
  DialogTrigger,
  makeStyles,
} from "@fluentui/react-components";
import { useState } from "react";
import { type TileViewFieldOption } from "../@types/charts";
import { BUILDING_DATASET_COLUMN_METADATA } from "../config/column-metadata";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogBody } from "./ui/dialog-body";
import { DialogTitle } from "./ui/dialog-title";
import { DialogContent } from "./ui/dialog-content";
import { DialogActions } from "./ui/dialog-actions";
import { Button } from "./ui/button";

const useStyles = makeStyles({
  editButton: {
    minWidth: "50px",
    fontSize: "12px",
  },
});

type Props = {
  option: TileViewFieldOption["option"];
  value: string;
  onSave: (value: string[]) => void;
};

export const DialogFieldOption = ({
  option,
  onSave,
  value: initialValue,
}: Props): JSX.Element => {
  const styles = useStyles();

  const [value, setValue] = useState<string[]>(
    initialValue.length > 0 ? initialValue.split(",") : [],
  );

  const handleClick = (): void => {
    onSave(value);
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button className={styles.editButton}>変更</Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>カラムを選択</DialogTitle>
          <DialogContent border>
            {option.map(({ value: optionValue }) => {
              const columnMetadata =
                optionValue in BUILDING_DATASET_COLUMN_METADATA
                  ? BUILDING_DATASET_COLUMN_METADATA[
                      /** @fixme asしない方法あれば。 */
                      optionValue as keyof typeof BUILDING_DATASET_COLUMN_METADATA
                    ]
                  : null;
              if (columnMetadata === null) return null;
              return (
                <Checkbox
                  key={optionValue}
                  checked={value.includes(optionValue)}
                  id={optionValue}
                  label={columnMetadata?.label}
                  name={optionValue}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setValue([...value, optionValue]);
                    } else {
                      setValue(value.filter((v) => v !== optionValue));
                    }
                  }}
                  value={optionValue}
                />
              );
            })}
          </DialogContent>
          <DialogActions position="end">
            <DialogTrigger>
              <Button appearance="primary" onClick={handleClick} size="medium">
                保存
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
