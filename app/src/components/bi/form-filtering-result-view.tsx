import {
  Checkbox,
  Dialog,
  DialogTrigger,
  makeStyles,
} from "@fluentui/react-components";
import {
  type AREA_DATASET_COLUMN,
  AREA_DATASET_COLUMN_METADATA,
  type BUILDING_DATASET_COLUMN,
  BUILDING_DATASET_COLUMN_METADATA,
} from "../../config/column-metadata";
import { Button } from "../ui/button";
import { DialogSurface } from "../ui/dialog-surface";
import { DialogBody } from "../ui/dialog-body";
import { DialogTitle } from "../ui/dialog-title";
import { Field } from "../ui/field";
import { DialogContent } from "../ui/dialog-content";
import { DialogActions } from "../ui/dialog-actions";
import { type UseOptionWithActiveStateReturnType } from "../../bi-modules/hooks/use-form-filtering-parameters";

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
});

type Props = {
  appearance: "primary" | "normal";
  options: {
    key: BUILDING_DATASET_COLUMN | AREA_DATASET_COLUMN;
    active: boolean;
  }[];
  unit: "building" | "area";
  handleSelector: () => void;
  optionWithActiveState: UseOptionWithActiveStateReturnType;
};

export const FormFilteringResultView = ({
  options,
  appearance,
  unit,
  handleSelector,
  optionWithActiveState,
}: Props): JSX.Element => {
  const styles = useStyles();

  return (
    <Dialog>
      <DialogTrigger>
        {appearance === "primary" ? (
          <Button appearance="primary" size="medium">
            フィルターを追加
          </Button>
        ) : (
          <Button appearance="outline" size="small">
            フィルターを追加
          </Button>
        )}
      </DialogTrigger>
      <DialogSurface className={styles.dialogSurface}>
        <DialogBody>
          <DialogTitle>カラムを選択</DialogTitle>
          <DialogContent border>
            <div className={styles.fieldset}>
              {options.map((option, index) => {
                if (!option) {
                  return <></>;
                }

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
                      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- 型推論を利用するため
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
                    onChange={() => {
                      optionWithActiveState.setValue((prev) => {
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
          </DialogContent>
          <DialogActions position="end">
            <DialogTrigger>
              <Button
                appearance="primary"
                onClick={handleSelector}
                size="medium"
              >
                保存
              </Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
