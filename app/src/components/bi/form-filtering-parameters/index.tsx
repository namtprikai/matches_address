import {
  Caption1,
  Dialog,
  DialogTrigger,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import { useState } from "react";
import { getColumnMetadata } from "../../../utils/get-column-metadata";
import { DialogBody } from "../../ui/dialog-body";
import { DialogSurface } from "../../ui/dialog-surface";
import { DialogTitle } from "../../ui/dialog-title";
import { Button } from "../../ui/button";
import { DialogActions } from "../../ui/dialog-actions";
import { DialogContent } from "../../ui/dialog-content";
import { isFilterCondition } from "../../../bi-modules/interfaces/parameter";
import { type UseFormFilteringParametersReturnType } from "../../../bi-modules/hooks/use-form-filtering-parameters";
import { FormFilteringResultView } from "../form-filtering-result-view";
import { FieldBoolean } from "./field-boolean";
import { FieldText } from "./field-text";
import { FieldDate } from "./field-date";
import { FieldNumber } from "./field-number";

const useStyles = makeStyles({
  dialogContent: {
    padding: 0,
  },
  dialogContentNoBottomBorder: {
    borderBottom: "none",
  },
  dialogInner: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
  },
  selectorContainer: {
    display: "grid",
    placeItems: "center",
    padding: `${tokens.spacingVerticalL} 0`,
  },
  textRight: {
    textAlign: "right",
  },
});

type Props = UseFormFilteringParametersReturnType;

/**
 * フィルタリング結果表示用のフィールド表示コンポーネント
 * FormFilteringParameters で選択されたフィルタリング条件や細かい条件を編集・表示する
 */
export const FormFilteringParameters = ({
  handleRemove,
  handleSelector,
  onSave,
  optionsWithActive,
  filteredCurrentParameters: parameters,
  unit,
  filteringFormState: { register, setValue },
  filteringFieldState: { fields, update },
}: Props): JSX.Element => {
  const [open, setOpen] = useState(false);

  const styles = useStyles();

  const saveAndClose = async (): Promise<void> => {
    await onSave();
    setOpen(false);
  };

  return (
    <>
      <Dialog
        onOpenChange={() => {
          setOpen((prev) => !prev);
        }}
        open={open}
      >
        <DialogTrigger>
          <Button
            appearance={parameters.length === 0 ? "outline" : "primary"}
            size="medium"
          >
            {parameters.length === 0 ? "詳細条件を追加" : "詳細条件を編集"}
          </Button>
        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle
              action={
                <FormFilteringResultView
                  appearance="normal"
                  onSave={handleSelector}
                  options={optionsWithActive}
                  unit={unit}
                />
              }
            >
              次の条件でフィルター
            </DialogTitle>
            <DialogContent
              border
              className={mergeClasses(
                styles.dialogContent,
                fields.length !== 0 && styles.dialogContentNoBottomBorder,
              )}
            >
              <div className={styles.dialogInner}>
                {fields.length === 0 ? (
                  <div className={styles.selectorContainer}>
                    <FormFilteringResultView
                      appearance="primary"
                      onSave={handleSelector}
                      options={optionsWithActive}
                      unit={unit}
                    />
                  </div>
                ) : (
                  fields.map((field, index) => {
                    if (!isFilterCondition(field)) return null;
                    const metadata = getColumnMetadata({
                      unit,
                      key: field.value.referenceColumn,
                    });

                    switch (field.value.referenceColumnType) {
                      case "boolean":
                        return (
                          <FieldBoolean
                            key={field.id}
                            field={field}
                            handleRemove={() => handleRemove(index)}
                            index={index}
                            label={metadata?.label ?? "カラム"}
                            register={register}
                          />
                        );
                      case "text":
                        return (
                          <FieldText
                            key={field.id}
                            field={field}
                            handleRemove={() => handleRemove(index)}
                            index={index}
                            label={metadata?.label ?? "カラム"}
                            register={register}
                          />
                        );
                      case "date":
                      case "dateRange":
                        return (
                          <FieldDate
                            key={field.id}
                            field={field}
                            handleRemove={() => handleRemove(index)}
                            index={index}
                            label={metadata?.label ?? "カラム"}
                            register={register}
                            setValue={setValue}
                            unit={metadata?.unit || ""}
                          />
                        );
                      case "float":
                      case "floatRange":
                      case "integer":
                      case "integerRange":
                        return (
                          <FieldNumber
                            key={field.id}
                            field={field}
                            handleRemove={() => handleRemove(index)}
                            index={index}
                            label={metadata?.label ?? "カラム"}
                            register={register}
                            setValue={setValue}
                            unit={metadata?.unit || ""}
                            update={(e) => {
                              update(index, {
                                key: field.key,
                                value: {
                                  ...field.value,
                                  // @ts-expect-error - ここで型が変わるためエラーになる
                                  operation: e.target.value,
                                },
                                type: "filter", // ここは固定
                              });
                            }}
                          />
                        );
                      default:
                        return null;
                    }
                  })
                )}
              </div>
            </DialogContent>
            <DialogActions position="end">
              <Button onClick={saveAndClose} type="button">
                保存
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      {parameters.length ? (
        <Caption1
          className={styles.textRight}
        >{`${parameters.length}件の詳細フィルターを追加済み`}</Caption1>
      ) : null}
    </>
  );
};
