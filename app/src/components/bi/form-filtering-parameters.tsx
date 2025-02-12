import {
  Checkbox,
  Dialog,
  DialogTrigger,
  Label,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import { Delete20Regular } from "@fluentui/react-icons";
import { useState } from "react";
import { getColumnMetadata } from "../../utils/get-column-metadata";
import { DialogBody } from "../ui/dialog-body";
import { DialogSurface } from "../ui/dialog-surface";
import { DialogTitle } from "../ui/dialog-title";
import { Button } from "../ui/button";
import { DialogActions } from "../ui/dialog-actions";
import { Field } from "../ui/field";
import { Select } from "../ui/select";
import { Input } from "../ui/input";
import { DialogContent } from "../ui/dialog-content";
import { isFilterCondition } from "../../bi-modules/interfaces/parameter";
import { type UseFormFilteringParametersReturnType } from "../../bi-modules/hooks/use-form-filtering-parameters";
import { FormFilteringResultView } from "./form-filtering-result-view";

const useStyles = makeStyles({
  groupField: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXXL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    fontSize: "14px",
  },
  includesField: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
    justifyContent: "center",
    fontSize: "12px",
    lineHeight: "12px",
    height: "36px",
    marginBottom: 0,
  },
  checkbox: {
    "&  div": {
      margin: "0",
    },
  },
  inputValue: {
    flexGrow: 1,
    flexBasis: "128px",
    flexShrink: 1,
  },
  inputRangeValue: {
    flexGrow: 1,
    width: "128px",
  },
  inputLabelValue: {
    width: "128px",
  },
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
  formState: { register, setValue },
  fieldState: { fields, update },
}: Props): JSX.Element => {
  const [open, setOpen] = useState(false);

  const styles = useStyles();

  const saveAndClose = async (): Promise<void> => {
    await onSave();
    setOpen(false);
  };

  return (
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

                  /**
                   * カラムの型がbooleanの場合
                   */
                  if (field.value.referenceColumnType === "boolean") {
                    return (
                      <Field key={field.id} className={styles.groupField}>
                        <Label>{metadata?.label ?? "カラム"}</Label>
                        <Select
                          defaultValue={field.value.operation}
                          {...register(`parameters.${index}.value.operation`)}
                        >
                          <option value="isTrue">真である</option>
                          <option value="isFalse">偽である</option>
                        </Select>
                        <Button
                          appearance="subtle"
                          icon={<Delete20Regular />}
                          onClick={() => {
                            handleRemove(index);
                          }}
                          type="button"
                        ></Button>
                      </Field>
                    );
                  }

                  if (field.value.referenceColumnType === "text") {
                    return (
                      <Field key={field.id} className={styles.groupField}>
                        <Label>{metadata?.label ?? "カラム"}</Label>
                        <Select
                          defaultValue={field.value.operation}
                          {...register(`parameters.${index}.value.operation`)}
                        >
                          <option value="eq">次に等しい</option>
                          <option value="noteq">次に等しくない</option>
                          <option value="contains">次を含む</option>
                          <option value="notContains">次を含まない</option>
                        </Select>
                        <Input
                          defaultValue={field.value.value}
                          {...register(`parameters.${index}.value.value`)}
                          placeholder="値"
                          type="text"
                        />
                        <Button
                          appearance="subtle"
                          icon={<Delete20Regular />}
                          onClick={() => {
                            handleRemove(index);
                          }}
                          type="button"
                        ></Button>
                      </Field>
                    );
                  }

                  if (field.value.referenceColumnType === "dateRange") {
                    return (
                      <Field key={field.id} className={styles.groupField}>
                        <Label>{metadata?.label ?? "カラム"}</Label>
                        <Select
                          defaultValue={field.value.operation}
                          {...register(`parameters.${index}.value.operation`)}
                        >
                          <option value="eq">次に等しい</option>
                          <option value="noteq">次に等しくない</option>
                          <option value="gt">次より後</option>
                          <option value="lt">次より前</option>
                          <option value="gte">次以降</option>
                          <option value="lte">次以前</option>
                          <option value="range">次の範囲</option>
                        </Select>

                        <Input
                          className={styles.inputRangeValue}
                          defaultValue={
                            field.value.startValue
                              ? field.value.startValue.toString()
                              : ""
                          }
                          max={100}
                          min={0}
                          onBlur={(e) => {
                            const parsed = parseFloat(e.target.value);
                            const value =
                              metadata?.unit === "%"
                                ? Math.max(0, Math.min(100, parsed))
                                : parsed;
                            e.target.value = `${value}`;
                            setValue(
                              `parameters.${index}.value.startValue`,
                              value,
                            );
                          }}
                          placeholder="開始値"
                          type="date"
                        />
                        <div className={styles.includesField}>
                          <span>含</span>
                          <Checkbox
                            className={styles.checkbox}
                            defaultChecked={field.value.includesStart ?? true}
                            {...register(
                              `parameters.${index}.value.includesStart`,
                            )}
                          />
                        </div>
                        <span>〜</span>
                        <Input
                          className={styles.inputRangeValue}
                          defaultValue={
                            field.value.lastValue
                              ? field.value.lastValue.toString()
                              : ""
                          }
                          max={100}
                          min={0}
                          onBlur={(e) => {
                            const parsed = parseFloat(e.target.value);
                            const value =
                              metadata?.unit === "%"
                                ? Math.max(0, Math.min(100, parsed))
                                : parsed;
                            e.target.value = `${value}`;
                            setValue(
                              `parameters.${index}.value.lastValue`,
                              value,
                            );
                          }}
                          placeholder="終了値"
                          type="date"
                        />
                        <div className={styles.includesField}>
                          <span>含</span>
                          <Checkbox
                            className={styles.checkbox}
                            defaultChecked={field.value.includesLast ?? true}
                            {...register(
                              `parameters.${index}.value.includesLast`,
                            )}
                          />
                        </div>
                        <Button
                          appearance="subtle"
                          icon={<Delete20Regular />}
                          onClick={() => {
                            handleRemove(index);
                          }}
                          type="button"
                        ></Button>
                      </Field>
                    );
                  }

                  if (field.value.referenceColumnType === "date") {
                    return (
                      <Field key={field.id} className={styles.groupField}>
                        <Label>{metadata?.label ?? "カラム"}</Label>
                        <Select
                          defaultValue={field.value.operation}
                          {...register(`parameters.${index}.value.operation`)}
                        >
                          <option value="eq">次に等しい</option>
                          <option value="noteq">次に等しくない</option>
                          <option value="gt">次より後</option>
                          <option value="lt">次より前</option>
                          <option value="gte">次以降</option>
                          <option value="lte">次以前</option>
                          <option value="range">次の範囲</option>
                        </Select>
                        <Input
                          defaultValue={
                            field.value.value
                              ? field.value.value.toString()
                              : ""
                          }
                          {...register(`parameters.${index}.value.value`)}
                          className={styles.inputValue}
                          placeholder="値"
                          type="date"
                        />
                        <Button
                          appearance="subtle"
                          icon={<Delete20Regular />}
                          onClick={() => {
                            handleRemove(index);
                          }}
                          type="button"
                        ></Button>
                      </Field>
                    );
                  }

                  return (
                    <Field key={field.id} className={styles.groupField}>
                      <Label>{metadata?.label ?? "カラム"}</Label>
                      <Select
                        onChange={(e) => {
                          update(index, {
                            key: field.key,
                            value: {
                              ...field.value,
                              // @ts-expect-error - ここで型が変わるためエラーになる
                              operation: e.target.value,
                            },
                            type: "filter",
                          });
                        }}
                        value={field.value.operation ?? "eq"}
                      >
                        <option value="eq">等しい</option>
                        <option value="noteq">等しくない</option>
                        <option value="gt">より大きい</option>
                        <option value="lt">より小さい</option>
                        <option value="gte">以上</option>
                        <option value="lte">以下</option>
                        <option value="range">次の範囲</option>
                      </Select>
                      {field.value.operation === "range" && (
                        <>
                          <Input
                            className={styles.inputRangeValue}
                            defaultValue={
                              field.value.startValue
                                ? field.value.startValue.toString()
                                : ""
                            }
                            max={100}
                            min={0}
                            onBlur={(e) => {
                              const parsed = parseFloat(e.target.value);
                              const value =
                                metadata?.unit === "%"
                                  ? Math.max(0, Math.min(100, parsed))
                                  : parsed;
                              e.target.value = `${value}`;
                              setValue(
                                `parameters.${index}.value.startValue`,
                                value,
                              );
                            }}
                            placeholder="開始値"
                            type="number"
                          />
                          {metadata?.unit ?? ""}
                          <div className={styles.includesField}>
                            <span>含</span>
                            <Checkbox
                              className={styles.checkbox}
                              defaultChecked={field.value.includesStart ?? true}
                              {...register(
                                `parameters.${index}.value.includesStart`,
                              )}
                            />
                          </div>
                          <span>〜</span>
                          <Input
                            className={styles.inputRangeValue}
                            defaultValue={
                              field.value.lastValue
                                ? field.value.lastValue.toString()
                                : ""
                            }
                            max={100}
                            min={0}
                            onBlur={(e) => {
                              const parsed = parseFloat(e.target.value);
                              const value =
                                metadata?.unit === "%"
                                  ? Math.max(0, Math.min(100, parsed))
                                  : parsed;
                              e.target.value = `${value}`;
                              setValue(
                                `parameters.${index}.value.lastValue`,
                                value,
                              );
                            }}
                            placeholder="終了値"
                            type="number"
                          />
                          {metadata?.unit ?? ""}
                          <div className={styles.includesField}>
                            <span>含</span>
                            <Checkbox
                              className={styles.checkbox}
                              defaultChecked={field.value.includesLast ?? true}
                              {...register(
                                `parameters.${index}.value.includesLast`,
                              )}
                            />
                          </div>
                        </>
                      )}
                      {field.value.operation !== "range" && (
                        <>
                          <Input
                            className={styles.inputValue}
                            defaultValue={
                              field.value.value
                                ? field.value.value.toString()
                                : ""
                            }
                            max={100}
                            min={0}
                            onBlur={(e) => {
                              const parsed = parseFloat(e.target.value);
                              const value =
                                metadata?.unit === "%"
                                  ? Math.max(0, Math.min(100, parsed))
                                  : parsed;
                              e.target.value = `${value}`;
                              setValue(
                                `parameters.${index}.value.value`,
                                value,
                              );
                            }}
                            placeholder="値"
                            type="number"
                          />
                          {metadata?.unit ?? ""}
                        </>
                      )}
                      <Button
                        appearance="subtle"
                        icon={<Delete20Regular />}
                        onClick={() => {
                          handleRemove(index);
                        }}
                        type="button"
                      ></Button>
                    </Field>
                  );
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
  );
};
