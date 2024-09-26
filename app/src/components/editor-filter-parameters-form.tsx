import {
  Checkbox,
  Dialog,
  DialogTrigger,
  Label,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Delete20Regular } from "@fluentui/react-icons";
import { useState } from "react";
import {
  type AREA_DATASET_COLUMN,
  type BUILDING_DATASET_COLUMN,
} from "../config/column-metadata";
import { getColumnMetadata } from "../utils/get-column-metadata";
import { DialogBody } from "./ui/dialog-body";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogTitle } from "./ui/dialog-title";
import { Button } from "./ui/button";
import { DialogActions } from "./ui/dialog-actions";
import { FilterColumnSelector } from "./filter-column-selector";
import { Field } from "./ui/field";
import { Select } from "./ui/select";
import { Input } from "./ui/input";
import { DialogContent } from "./ui/dialog-content";

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

const BooleanSchema = z.object({
  referenceColumnType: z.literal("boolean"),
  operation: z.enum(["isTrue", "isFalse"]),
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
      key: z.string(),
      value: z
        .union([
          BooleanSchema,
          z.discriminatedUnion("operation", [NumberSchema, NumberRangeSchema]),
          z.discriminatedUnion("operation", [DateSchema, DateRangeSchema]),
          TextSchema,
        ])
        .and(z.object({ referenceColumn: z.string() })),
      type: z.literal("filter"),
    })
    .array(),
});

type parameters = z.infer<typeof schema.shape.parameters>;

type EditorFilterParametersFormProps = {
  parameters: parameters;
  options: (BUILDING_DATASET_COLUMN | AREA_DATASET_COLUMN)[];
  unit: "building" | "area";
  onSave: (parameters: parameters) => void;
};

export const EditorFilterParametersForm = ({
  onSave,
  ...props
}: EditorFilterParametersFormProps): JSX.Element => {
  const [open, setOpen] = useState(false);

  const { control, register, handleSubmit } = useForm({
    defaultValues: {
      parameters: props.parameters,
    },
  });

  const { fields, replace, remove, update } = useFieldArray({
    control,
    name: "parameters",
  });

  const optionsWithActive = props.options.map((option) => {
    return {
      key: option,
      active:
        fields.find((f) => f.value.referenceColumn === option) != null
          ? true
          : false,
    };
  });

  const styles = useStyles();

  const handleRemove = (index: number): void => {
    remove(index);
  };

  const handleSelector = (
    options: {
      key: string;
      active: boolean;
    }[],
  ): void => {
    const newFields = options.map((option) => {
      if (option.active) {
        const targetField = fields.find(
          (field) => field.value.referenceColumn === option.key,
        );
        if (targetField) {
          return targetField;
        }

        const metadata = getColumnMetadata({
          unit: props.unit,
          key: option.key,
        });

        if (metadata === null) {
          return;
        }

        return {
          key: `filter_${(new Date().getTime() + Math.floor(10000 * Math.random())).toString(16)}`,
          value: {
            operation: "eq",
            referenceColumn: option.key,
            referenceColumnType: metadata.type,
            value: "",
          },
          type: "filter",
        };
      }
      return;
    });
    const cleanedFields = newFields.filter((field) => field !== undefined);
    replace(cleanedFields as parameters); // union の型推論が効きづらいため、明示的に型を指定
  };

  const handleSave = handleSubmit((data) => {
    onSave(data.parameters);
    setOpen(false);
  });

  return (
    <Dialog
      onOpenChange={() => {
        setOpen((prev) => !prev);
      }}
      open={open}
    >
      <DialogTrigger>
        <Button
          appearance={props.parameters.length === 0 ? "outline" : "primary"}
          size="medium"
        >
          {props.parameters.length === 0 ? "詳細条件を追加" : "詳細条件を編集"}
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle
            action={
              <FilterColumnSelector
                appearance="normal"
                onSave={handleSelector}
                options={optionsWithActive}
                unit={props.unit}
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
                  <FilterColumnSelector
                    appearance="primary"
                    onSave={handleSelector}
                    options={optionsWithActive}
                    unit={props.unit}
                  />
                </div>
              ) : (
                fields.map((field, index) => {
                  const metadata = getColumnMetadata({
                    unit: props.unit,
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
            <Button onClick={handleSave} type="button">
              保存
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
