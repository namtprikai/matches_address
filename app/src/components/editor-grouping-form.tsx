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
import { type ChartColumnType } from "../@types/charts";
import { Field } from "./ui/field";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DialogBody } from "./ui/dialog-body";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogTitle } from "./ui/dialog-title";
import { DialogActions } from "./ui/dialog-actions";
import { Select } from "./ui/select";

const useStyles = makeStyles({
  groupField: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
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
  dialogSurface: {
    width: "700px",
  },
  dialogInner: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: `${tokens.spacingVerticalM}`,
    padding: `${tokens.spacingVerticalL} 0`,
    width: "100%",
  },
  dialogBody: {
    display: "flex",
    flexDirection: "column",
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
  conditions: z
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

type conditions = z.infer<typeof schema.shape.conditions>;

type Props = {
  parameters: conditions;
  onSave: (parameters: conditions) => void;
  columnType: ChartColumnType;
};

export const EditorGroupingForm = ({
  parameters,
  onSave,
  columnType = "text",
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

  const { control, register } = useForm({
    defaultValues: {
      conditions: parameters,
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "conditions",
  });

  const conditions = useWatch({
    control,
    name: "conditions",
  });

  const handleSave = (): void => {
    onSave(conditions);
    setOpen(false);
  };

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
          appearance={conditions.length === 0 ? "outline" : "primary"}
          size="medium"
        >
          {conditions.length === 0 ? "グループを追加" : "グループを編集"}
        </Button>
      </DialogTrigger>
      <DialogSurface className={styles.dialogSurface}>
        <DialogTitle>グループを編集</DialogTitle>
        <DialogBody className={styles.dialogBody}>
          <div className={styles.dialogInner}>
            {fields.map((field, index) => {
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
                      {...register(`conditions.${index}.value.label`)}
                    />
                    <Select
                      defaultValue={field.value.operation}
                      {...register(`conditions.${index}.value.operation`)}
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
                      {...register(`conditions.${index}.value.label`)}
                    />
                    <Select
                      defaultValue={field.value.operation}
                      {...register(`conditions.${index}.value.operation`)}
                    >
                      <option value="eq">次に等しい</option>
                      <option value="noteq">次に等しくない</option>
                      <option value="contains">次を含む</option>
                      <option value="notContains">次を含まない</option>
                    </Select>
                    <Input
                      defaultValue={field.value.value}
                      {...register(`conditions.${index}.value.value`)}
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
                      {...register(`conditions.${index}.value.label`)}
                    />
                    <Select
                      defaultValue={field.value.operation}
                      {...register(`conditions.${index}.value.operation`)}
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
                          {...register(`conditions.${index}.value.startValue`)}
                          className={styles.inputRangeValue}
                        />
                        <div className={styles.includesField}>
                          <span>含</span>
                          <Checkbox
                            className={styles.checkbox}
                            defaultChecked={field.value.includesStart ?? false}
                            {...register(
                              `conditions.${index}.value.includesStart`,
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
                          {...register(`conditions.${index}.value.lastValue`)}
                          className={styles.inputRangeValue}
                        />
                        <div className={styles.includesField}>
                          <span>含</span>
                          <Checkbox
                            className={styles.checkbox}
                            defaultChecked={field.value.includesLast ?? false}
                            {...register(
                              `conditions.${index}.value.includesLast`,
                            )}
                          />
                        </div>
                      </>
                    )}
                    {field.value.operation !== "range" && (
                      <Input
                        defaultValue={
                          field.value.value ? field.value.value.toString() : ""
                        }
                        {...register(`conditions.${index}.value.value`)}
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
                    {...register(`conditions.${index}.value.label`)}
                  />
                  <Select
                    defaultValue={field.value.operation ?? "eq"}
                    {...register(`conditions.${index}.value.operation`)}
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
                        {...register(`conditions.${index}.value.startValue`)}
                        className={styles.inputRangeValue}
                      />
                      <div className={styles.includesField}>
                        <span>含</span>
                        <Checkbox
                          className={styles.checkbox}
                          defaultChecked={field.value.includesStart ?? false}
                          {...register(
                            `conditions.${index}.value.includesStart`,
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
                        {...register(`conditions.${index}.value.lastValue`)}
                        className={styles.inputRangeValue}
                      />
                      <div className={styles.includesField}>
                        <span>含</span>
                        <Checkbox
                          className={styles.checkbox}
                          defaultChecked={field.value.includesLast ?? false}
                          {...register(
                            `conditions.${index}.value.includesLast`,
                          )}
                        />
                      </div>
                    </>
                  )}
                  {field.value.operation !== "range" && (
                    <Input
                      defaultValue={
                        field.value.value ? field.value.value.toString() : ""
                      }
                      {...register(`conditions.${index}.value.value`)}
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
            })}
            <Button onClick={handleAppend}>追加</Button>
          </div>
        </DialogBody>
        <DialogActions>
          <Button onClick={handleSave} type="button">
            保存
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};
