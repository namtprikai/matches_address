import { useState } from "react";
import {
  Checkbox,
  Dialog,
  DialogTrigger,
  makeStyles,
} from "@fluentui/react-components";
import { type GroupingCondition } from "../utils/subquery-grouping";
import { Field } from "./ui/field";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DialogBody } from "./ui/dialog-body";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogTitle } from "./ui/dialog-title";
import { DialogActions } from "./ui/dialog-actions";

type Props = {
  parameters: {
    key: string;
    value: GroupingCondition;
  }[];
  onChange?: (
    parameters: {
      key: string;
      value: GroupingCondition;
    }[],
  ) => void;
  onSave: (
    parameters: {
      key: string;
      value: GroupingCondition;
    }[],
  ) => void;
};

const useStyles = makeStyles({
  groupField: {
    display: "flex",
    gap: "8px",
  },
});

export const EditorGroupingForm = ({
  parameters,
  onSave,
}: Props): JSX.Element => {
  const [state, setState] = useState<
    {
      key: string;
      value: GroupingCondition;
    }[]
  >(
    parameters.length === 0
      ? [
          {
            key: "group_0",
            value: { operation: "eq", value: undefined, label: "" },
          },
        ]
      : parameters,
  );
  const [open, setOpen] = useState(false);

  const styles = useStyles();

  const defaultCondition: GroupingCondition = {
    operation: "eq",
    value: undefined,
    label: "",
  };

  const update = (key: string, newValue: Partial<GroupingCondition>): void => {
    console.log(newValue);

    setState((prev) =>
      prev.map((field) => {
        const prevValue = field.value;

        // keyが一致しない場合はスキップ
        if (field.key !== key) {
          return field;
        }

        // valueの条件演算子が range の場合
        if (newValue.operation === "range") {
          // 元のvalueの条件演算子が同じ range の場合
          if (prevValue.operation === "range") {
            return {
              key: field.key,
              value: {
                ...prevValue,
                ...newValue,
              },
            };
          }

          // 元のvalueの条件演算子が range でない場合、range に変換
          return {
            key: field.key,
            value: {
              operation: "range",
              label: newValue.label ?? prevValue.label ?? "",
              startValue: newValue.startValue,
              includesStart: newValue.includesStart,
              lastValue: newValue.lastValue,
              includesLast: newValue.includesLast,
            },
          };
        }

        // 新しいvalueの条件演算子が range でない場合
        if (newValue.operation !== undefined) {
          // 元のvalueの条件演算子が range の場合、range を解除
          if (prevValue.operation === "range") {
            return {
              key: field.key,
              value: {
                operation: newValue.operation,
                value: "value" in newValue ? newValue.value : undefined,
                label: newValue.label ?? prevValue.label ?? "",
              },
            };
          }

          // 元のvalueの条件演算子が range でない場合
          return {
            key: field.key,
            value: {
              ...prevValue,
              ...newValue,
              operation: newValue.operation,
            },
          };
        }

        return field;
      }),
    );
  };

  const append = (): void => {
    setState((prev) => [
      ...prev,
      {
        key: "group_" + prev.length,
        value: defaultCondition,
      },
    ]);
  };

  const handleSave = (): void => {
    onSave(state);
    setOpen(false);
  };

  console.log(state);

  return (
    <Dialog
      onOpenChange={(e) => {
        setOpen((prev) => !prev);
      }}
      open={open}
    >
      <DialogTrigger>
        <Button size="medium">グループを編集</Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogTitle>グループを編集</DialogTitle>
        <DialogBody>
          <div>
            {state.map((field) => {
              return (
                <Field
                  key={field.key}
                  className={styles.groupField}
                  label={field.key}
                >
                  <Input
                    defaultValue={field.value.label}
                    onChange={(e) => {
                      update(field.key, {
                        ...field.value,
                        label: e.target.value,
                      });
                    }}
                    placeholder="グループ名"
                  />
                  <select
                    defaultValue={field.value.operation ?? "eq"}
                    onChange={(e) => {
                      update(field.key, {
                        ...field.value,
                        operation: e.target
                          .value as GroupingCondition["operation"],
                      });
                    }}
                  >
                    <option value="eq">等しい</option>
                    <option value="noteq">等しくない</option>
                    <option value="gt">より大きい</option>
                    <option value="lt">より小さい</option>
                    <option value="gte">以上</option>
                    <option value="lte">以下</option>
                    <option value="range">次の範囲</option>
                  </select>
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
                      />
                      <div>
                        <span>含</span>
                        <Checkbox
                          defaultChecked={field.value.includesStart ?? false}
                          onChange={(e) => {
                            update(field.key, {
                              includesStart: e.target.checked,
                            });
                          }}
                        />
                      </div>
                      <Input
                        defaultValue={
                          field.value.startValue
                            ? field.value.startValue.toString()
                            : ""
                        }
                        placeholder="終了値"
                        type="number"
                      />
                      <div>
                        <span>含</span>
                        <Checkbox
                          defaultChecked={field.value.includesLast ?? false}
                          onChange={(e) => {
                            update(field.key, {
                              includesLast: e.target.checked,
                            });
                          }}
                        />
                      </div>
                    </>
                  )}
                  {field.value.operation !== "range" && (
                    <Input
                      defaultValue={
                        field.value.value ? field.value.value.toString() : ""
                      }
                      onChange={(e) => {
                        update(field.key, {
                          ...field.value,
                          value: Number(e.target.value),
                        });
                      }}
                      placeholder="値"
                    />
                  )}
                </Field>
              );
            })}
            <Button onClick={append}>追加</Button>
          </div>
        </DialogBody>
        <DialogActions>
          <Button onClick={handleSave}>保存</Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
};
