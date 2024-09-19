import {
  Checkbox,
  Dialog,
  DialogTrigger,
  makeStyles,
} from "@fluentui/react-components";
import { useState } from "react";
import {
  type AREA_DATASET_COLUMN,
  AREA_DATASET_COLUMN_METADATA,
  type BUILDING_DATASET_COLUMN,
  BUILDING_DATASET_COLUMN_METADATA,
} from "../config/column-metadata";
import { Button } from "./ui/button";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogBody } from "./ui/dialog-body";
import { DialogTitle } from "./ui/dialog-title";
import { Field } from "./ui/field";

const useStyles = makeStyles({
  fieldset: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "400px",
    overflowY: "scroll",
  },
  dialogSurface: {
    maxWidth: "auto",
    minWidth: "auto",
  },
  dialogBody: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "100%",
  },
});

type Props = {
  appearance: "primary" | "normal";
  options: {
    key: BUILDING_DATASET_COLUMN | AREA_DATASET_COLUMN;
    active: boolean;
  }[];
  unit: "building" | "area";
  onSave: (options: { key: string; active: boolean }[]) => void;
};

export const FilterColumnSelector = ({
  options,
  appearance,
  unit,
  onSave,
}: Props): JSX.Element => {
  const styles = useStyles();

  const [optionState, setOptionsState] = useState<
    {
      key: BUILDING_DATASET_COLUMN | AREA_DATASET_COLUMN;
      active: boolean;
    }[]
  >(options);

  const handleClick = (): void => {
    onSave(optionState);
  };

  return (
    <Dialog>
      <DialogTrigger>
        {appearance === "primary" ? (
          <Button appearance="primary" size="medium">
            フィルターを追加
          </Button>
        ) : (
          <Button appearance="outline" size="small">
            追加
          </Button>
        )}
      </DialogTrigger>
      <DialogSurface className={styles.dialogSurface}>
        <DialogTitle>カラムを選択</DialogTitle>
        <DialogBody className={styles.dialogBody}>
          <div className={styles.fieldset}>
            {options.map((option, index) => {
              if (!option) {
                return <></>;
              }

              // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- 型推論を利用するため
              const getMetadata = ({
                key,
                unit,
              }:
                | {
                    key: BUILDING_DATASET_COLUMN;
                    unit: "building";
                  }
                | {
                    key: AREA_DATASET_COLUMN;
                    unit: "area";
                  }) => {
                if (unit === "building") {
                  return BUILDING_DATASET_COLUMN_METADATA[key];
                }
                return AREA_DATASET_COLUMN_METADATA[key];
              };

              const columnMetadata =
                unit === "building"
                  ? getMetadata({
                      key: option.key as BUILDING_DATASET_COLUMN,
                      unit,
                    })
                  : getMetadata({
                      key: option.key as AREA_DATASET_COLUMN,
                      unit,
                    });

              if (columnMetadata === null) {
                return <></>;
              }

              return (
                <Field
                  key={index}
                  defaultChecked={option.active}
                  onChange={(e) => {
                    setOptionsState((prev) => {
                      return prev.map((prevOption) => {
                        if (prevOption.key === option.key) {
                          return {
                            key: option.key,
                            active: !prevOption.active,
                          };
                        }
                        return prevOption;
                      });
                    });
                  }}
                >
                  <Checkbox
                    defaultChecked={option.active}
                    label={columnMetadata.label}
                  />
                </Field>
              );
            })}
          </div>
        </DialogBody>
        <DialogTrigger>
          <Button appearance="primary" onClick={handleClick} size="medium">
            保存
          </Button>
        </DialogTrigger>
      </DialogSurface>
    </Dialog>
  );
};
