import { useState } from "react";
import {
  Checkbox,
  Dialog,
  DialogTrigger,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
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
});

const BooleanSchema = z.object({
  referenceColumnType: z.literal("boolean"),
  operation: z.enum(["isTrue", "isFalse"]),
  value: z.undefined(),
});

const NumberSchema = z.object({
  referenceColumnType: z.union([z.literal("float"), z.literal("integer")]),
  operation: z.enum(["eq", "noteq", "gt", "gte", "lt", "lte"]),
  value: z.number(),
});

const NumberRangeSchema = z.object({
  referenceColumnType: z.union([z.literal("float"), z.literal("integer")]),
  operation: z.enum(["range"]),
  startValue: z.number(),
  lastValue: z.number(),
  includesStart: z.boolean(),
  includesLast: z.boolean(),
});

const TextSchema = z.object({
  referenceColumnType: z.literal("text"),
  operation: z.enum(["eq", "noteq", "contains", "notContains"]),
  value: z.string(),
});

const DateSchema = z.object({
  referenceColumnType: z.literal("date"),
  operation: z.enum(["eq", "noteq", "gt", "gte", "lt", "lte"]),
  value: z.string(),
});

const DateRangeSchema = z.object({
  referenceColumnType: z.literal("date"),
  operation: z.enum(["range"]),
  startValue: z.string(),
  lastValue: z.string(),
  includesStart: z.boolean(),
  includesLast: z.boolean(),
});

const schema = z.object({
  parameters: z
    .object({
      key: z.custom<`group_${string}`>((val) => {
        return /^group_+$/.test(val as string);
      }),
      value: z
        .union([
          BooleanSchema,
          z.discriminatedUnion("operation", [NumberSchema, NumberRangeSchema]),
          z.discriminatedUnion("operation", [DateSchema, DateRangeSchema]),
          TextSchema,
        ])
        .and(z.object({ label: z.string() })),
      type: z.literal("group"),
    })
    .array(),
});

type parameters = z.infer<typeof schema.shape.parameters>;

type Props = {
  parameters: parameters;
  onSave: (parameters: parameters) => void;
  columnType: ChartColumnType;
  columnLabel: string;
  unit?: string;
};

export const FormGroupingResultView = ({
  parameters,
  onSave,
  columnType = "text",
  unit = "",
  columnLabel,
}: Props): JSX.Element => {
  const [open, setOpen] = useState(false);

  const styles = useStyles();

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- 複雑な型情報をあえて削除
  const defaultCondition = (columnType: ChartColumnType) => {
    switch (columnType) {
      case "boolean":
        return {
          label: "",
          referenceColumnType: "boolean",
          operation: "isTrue",
        } as const;
      case "text":
        return {
          label: "",
          referenceColumnType: "text",
          operation: "eq",
          value: "",
        } as const;
      case "date":
        return {
          label: "",
          referenceColumnType: "date",
          operation: "eq",
          value: "",
        } as const;
      case "float":
        return {
          label: "",
          referenceColumnType: "float",
          operation: "eq",
          value: 0,
        } as const;
      default:
        return {
          label: "",
          referenceColumnType: "integer",
          operation: "eq",
          value: 0,
        } as const;
    }
  };

  const { control, register, handleSubmit } = useForm({
    defaultValues: {
      parameters,
    },
  });
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "parameters",
  });

  const parameterFilters = useWatch({
    control,
    name: "parameters",
  });

  const handleSave = handleSubmit((data) => {
    onSave(data.parameters);
    setOpen(false);
  });

  const handleAppend = (): void => {
    append({
      key: `group_${(new Date().getTime() + Math.floor(10000 * Math.random())).toString(16)}`,
      value: defaultCondition(columnType),
      type: "group",
    });
  };

  const handleRemove = (index: number): void => {
    remove(index);
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
          appearance={parameterFilters.length === 0 ? "outline" : "primary"}
          size="medium"
        >
          {parameterFilters.length === 0 ? "グループを追加" : "グループを編集"}
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>
            {columnLabel
              ? `グループを編集（${columnLabel}）`
              : "グループを編集"}
          </DialogTitle>
          <DialogContent border className={styles.dialogContent}>
            <div className={styles.dialogInner}>
              {fields.length === 0 ? (
                <div className={styles.appendContainer}>
                  <Button onClick={handleAppend}>追加</Button>
                </div>
              ) : (
                fields.map((field, index) => {
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
                        {field.value.operation === "range" && (
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
                                field.value.startValue
                                  ? field.value.startValue.toString()
                                  : ""
                              }
                              placeholder="終了値"
                              type="date"
                              {...register(
                                `parameters.${index}.value.lastValue`,
                              )}
                              className={styles.inputRangeValue}
                            />
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
                            placeholder="値"
                            type="date"
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
                              defaultChecked={field.value.includesStart ?? true}
                              {...register(
                                `parameters.${index}.value.includesStart`,
                              )}
                            />
                          </div>
                          <span>〜</span>
                          <Input
                            defaultValue={
                              field.value.startValue
                                ? field.value.startValue.toString()
                                : ""
                            }
                            placeholder="終了値"
                            type="number"
                            {...register(`parameters.${index}.value.lastValue`)}
                            className={styles.inputRangeValue}
                          />
                          {unit}
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
                        <Input
                          defaultValue={
                            field.value.value
                              ? field.value.value.toString()
                              : ""
                          }
                          {...register(`parameters.${index}.value.value`)}
                          className={styles.inputValue}
                          placeholder="値"
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
              onClick={handleSave}
              type="button"
            >
              保存
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
