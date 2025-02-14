import { useState } from "react";
import {
  Caption1,
  Checkbox,
  Dialog,
  DialogTrigger,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { type UseFormReturn } from "react-hook-form";
import { Delete20Regular } from "@fluentui/react-icons";
import { type ChartColumnType } from "../../@types/charts";
import { Field } from "../ui/field";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { DialogBody } from "../ui/dialog-body";
import { DialogSurface } from "../ui/dialog-surface";
import { DialogTitle } from "../ui/dialog-title";
import { DialogActions } from "../ui/dialog-actions";
import { Select } from "../ui/select";
import { DialogContent } from "../ui/dialog-content";
import { type Parameter } from "../../bi-modules/interfaces/parameter";
import { useFormGroupingResultView } from "../../bi-modules/hooks/use-form-grouping-result-view";

const useStyles = makeStyles({
  groupField: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXXL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    fontSize: "14px",
  },
  appendButtonField: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXXL}`,
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
  dialogInner: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
  },
  appendContainer: {
    display: "grid",
    placeItems: "center",
    padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalXXL}`,
  },
  textRight: {
    textAlign: "right",
  },
});

type Props = {
  parameters: Parameter[];
  columnLabel: string;
  columnType: ChartColumnType;
  unit?: string;
  formGroupingResultView: UseFormReturn<{ parameters: Parameter[] }>;
  onSave: (parameters: Parameter[]) => void;
};

/**
 * グルーピング用の条件を設定するコンポーネント
 */
export const FormGroupingResultView = ({
  parameters,
  unit = "",
  columnLabel,
  onSave,
  columnType,
  formGroupingResultView,
}: Props): JSX.Element => {
  const [open, setOpen] = useState(false);

  const styles = useStyles();

  const { register } = formGroupingResultView;

  const {
    parameterFilters,
    fieldArray: { fields, update },
    handleAppend,
    handleSave,
    handleRemove,
  } = useFormGroupingResultView({
    formGroupingResultView,
    parameters,
    onSave,
    columnType,
  });

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
            appearance={parameterFilters.length === 0 ? "outline" : "primary"}
            size="medium"
          >
            {parameterFilters.length === 0
              ? "ラベルのグループを追加"
              : "ラベルのグループを編集"}
          </Button>
        </DialogTrigger>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>
              {columnLabel
                ? `ラベルのグループを編集（${columnLabel}）`
                : "ラベルのグループを編集"}
            </DialogTitle>
            <DialogContent border className={styles.dialogContent}>
              <div className={styles.dialogInner}>
                {fields.length === 0 ? (
                  <div className={styles.appendContainer}>
                    <Button onClick={handleAppend}>追加</Button>
                  </div>
                ) : (
                  fields.map((field, index) => {
                    if (field.type !== "group") return null;
                    /**
                     * カラムの型がbooleanの場合
                     */
                    if (field.value.referenceColumnType === "boolean") {
                      return (
                        <Field key={field.id} className={styles.groupField}>
                          <Input
                            className={styles.inputLabelValue}
                            defaultValue={field.value.label}
                            placeholder="グループ名"
                            {...register(`parameters.${index}.value.label`)}
                          />
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
                          <Input
                            className={styles.inputLabelValue}
                            defaultValue={field.value.label}
                            placeholder="グループ名"
                            {...register(`parameters.${index}.value.label`)}
                          />
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
                            placeholder="グループごとの値"
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

                    if (field.value.referenceColumnType === "date") {
                      return (
                        <Field key={field.id} className={styles.groupField}>
                          <Input
                            className={styles.inputLabelValue}
                            defaultValue={field.value.label}
                            placeholder="グループ名"
                            {...register(`parameters.${index}.value.label`)}
                          />
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
                            placeholder="グループごとの値"
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
                    if (field.value.referenceColumnType === "dateRange") {
                      <Field key={field.id} className={styles.groupField}>
                        <Input
                          className={styles.inputLabelValue}
                          defaultValue={field.value.label}
                          placeholder="グループ名"
                          {...register(`parameters.${index}.value.label`)}
                        />
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
                        <>
                          <Input
                            defaultValue={
                              field.value.startValue
                                ? field.value.startValue.toString()
                                : ""
                            }
                            placeholder="開始値"
                            type="date"
                            {...register(
                              `parameters.${index}.value.startValue`,
                            )}
                            className={styles.inputRangeValue}
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
                            defaultValue={
                              field.value.lastValue
                                ? field.value.lastValue.toString()
                                : ""
                            }
                            placeholder="終了値"
                            type="date"
                            {...register(`parameters.${index}.value.lastValue`)}
                            className={styles.inputRangeValue}
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
                        </>
                        <Button
                          appearance="subtle"
                          icon={<Delete20Regular />}
                          onClick={() => {
                            handleRemove(index);
                          }}
                          type="button"
                        ></Button>
                      </Field>;
                    }

                    return (
                      <Field key={field.id} className={styles.groupField}>
                        <Input
                          className={styles.inputLabelValue}
                          defaultValue={field.value.label}
                          placeholder="グループ名"
                          {...register(`parameters.${index}.value.label`)}
                        />
                        <Select
                          onChange={(e) => {
                            update(index, {
                              key: field.key,
                              value: {
                                ...field.value,
                                // @ts-expect-error - ここで型が変わるためエラーになる
                                operation: e.target.value,
                              },
                              type: "group",
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
                              defaultValue={
                                field.value.startValue
                                  ? field.value.startValue.toString()
                                  : ""
                              }
                              placeholder="開始値"
                              type="number"
                              {...register(
                                `parameters.${index}.value.startValue`,
                              )}
                              className={styles.inputRangeValue}
                            />
                            {unit}
                            <div className={styles.includesField}>
                              <span>含</span>
                              <Checkbox
                                className={styles.checkbox}
                                defaultChecked={
                                  field.value.includesStart ?? true
                                }
                                {...register(
                                  `parameters.${index}.value.includesStart`,
                                )}
                              />
                            </div>
                            <span>〜</span>
                            <Input
                              defaultValue={
                                field.value.lastValue
                                  ? field.value.lastValue.toString()
                                  : ""
                              }
                              placeholder="終了値"
                              type="number"
                              {...register(
                                `parameters.${index}.value.lastValue`,
                              )}
                              className={styles.inputRangeValue}
                            />
                            {unit}
                            <div className={styles.includesField}>
                              <span>含</span>
                              <Checkbox
                                className={styles.checkbox}
                                defaultChecked={
                                  field.value.includesLast ?? true
                                }
                                {...register(
                                  `parameters.${index}.value.includesLast`,
                                )}
                              />
                            </div>
                          </>
                        )}
                        {field.value.operation !== "range" && (
                          <Input
                            defaultValue={
                              field.value.value
                                ? field.value.value.toString()
                                : ""
                            }
                            {...register(`parameters.${index}.value.value`)}
                            className={styles.inputValue}
                            placeholder="グループごとの値"
                            type="number"
                          />
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
                {fields.length !== 0 && (
                  <div className={styles.appendButtonField}>
                    <Button onClick={handleAppend}>追加</Button>
                  </div>
                )}
              </div>
            </DialogContent>
            <DialogActions position="end">
              <Button
                appearance={parameters.length === 0 ? "outline" : "primary"}
                onClick={async () => {
                  await handleSave();
                  setOpen(false);
                }}
                type="button"
              >
                保存
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
      {parameterFilters.length ? (
        <Caption1
          className={styles.textRight}
        >{`${parameterFilters.length}件のグループを追加済み`}</Caption1>
      ) : null}
    </>
  );
};
