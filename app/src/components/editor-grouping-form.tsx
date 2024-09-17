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
import { zodResolver } from "@hookform/resolvers/zod";
import { Delete20Regular } from "@fluentui/react-icons";
import { type GroupingCondition } from "../utils/subquery-grouping";
import { Field } from "./ui/field";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DialogBody } from "./ui/dialog-body";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogTitle } from "./ui/dialog-title";
import { DialogActions } from "./ui/dialog-actions";
import { Select } from "./ui/select";

type Props = {
  parameters: {
    key: string;
    value: GroupingCondition;
    type: "group";
  }[];
  onSave: (
    parameters: {
      key: string;
      value: GroupingCondition;
      type: "group";
    }[],
  ) => void;
};

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

const schema = z.object({
  conditions: z
    .object({
      key: z.string(),
      value: z.discriminatedUnion("operation", [
        z.object({
          operation: z.enum(["eq", "noteq", "gt", "gte", "lt", "lte"]),
          value: z.number().nullable(),
          label: z.string(),
        }),
        z.object({
          operation: z.enum(["range"]),
          startValue: z.number().nullable(),
          lastValue: z.number().nullable(),
          includesStart: z.boolean(),
          includesLast: z.boolean(),
          label: z.string(),
        }),
      ]),
      type: z.literal("group"),
    })
    .array(),
});

export const EditorGroupingForm = ({
  parameters,
  onSave,
}: Props): JSX.Element => {
  const [open, setOpen] = useState(false);

  const styles = useStyles();

  const defaultCondition: GroupingCondition = {
    operation: "eq",
    value: undefined,
    label: "",
  };

  const { control, register } = useForm({
    resolver: zodResolver(schema),
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
    onSave(
      conditions.map((condition) => {
        if (condition.value.operation === "range") {
          return {
            ...condition,
            value: {
              ...condition.value,
              startValue: Number(condition.value.startValue),
              lastValue: Number(condition.value.lastValue),
            },
          };
        }

        return {
          ...condition,
          value: {
            ...condition.value,
            value: Number(condition.value.value),
          },
        };
      }),
    );
    setOpen(false);
  };

  const handleAppend = (): void => {
    append({
      key:
        "group_" +
        (new Date().getTime() + Math.floor(10000 * Math.random())).toString(16),
      value: defaultCondition,
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
