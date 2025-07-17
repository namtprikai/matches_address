import { useFormContext, type UseFormReturn } from "react-hook-form";
import { useEffect, useState } from "react";
import { tokens } from "@fluentui/react-components";
import { Field } from "../../ui/field";
import { Input } from "../../ui/input";
import { type EditViewFormType } from "../../../bi-modules/interfaces/edit-view-form";

export const YAxisMinMaxFields = (): JSX.Element => {
  const form = useFormContext<EditViewFormType>();
  const { yAxisMinMax, handleChange } = _useYAxisMinMaxFields(form);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "center",
        gap: tokens.spacingHorizontalXS,
      }}
    >
      <Field label={"Y軸の最小値"}>
        <Input
          onChange={handleChange("min")}
          placeholder="最小値"
          style={{ width: "12ch" }}
          type="number"
          value={yAxisMinMax?.min !== null ? yAxisMinMax.min.toString() : ""}
        />
      </Field>

      <Field label="Y軸の最大値">
        <Input
          onChange={handleChange("max")}
          placeholder="最大値"
          style={{ width: "12ch" }}
          type="number"
          value={yAxisMinMax?.max !== null ? yAxisMinMax.max.toString() : ""}
        />
      </Field>
    </div>
  );
};

/**
 * カスタムフックの定義
 */
type HooksReturnType = {
  yAxisMinMax: { min: number | null; max: number | null };
  handleChange: (
    target: "min" | "max",
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const _useYAxisMinMaxFields = ({
  getValues,
  setValue,
}: UseFormReturn<EditViewFormType>): HooksReturnType => {
  const [yAxisMinMax, setYAxisMinMax] = useState<{
    min: number | null;
    max: number | null;
  }>({ min: null, max: null });

  useEffect(() => {
    const currentYAxisMinMax = getValues("parameters").find(
      (p) => p.key === "yAxisMinMax",
    );
    if (currentYAxisMinMax) {
      setYAxisMinMax(currentYAxisMinMax.value);
    }
  }, [getValues]);

  const handleChange =
    (target: "min" | "max") =>
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const currentYAxisMinMax = getValues("parameters").find(
        (p) => p.key === "yAxisMinMax",
      );

      /** 既存のyAxisMinMaxがある場合は更新、ない場合は新規作成 */
      if (currentYAxisMinMax) {
        setYAxisMinMax({
          ...currentYAxisMinMax.value,
          [target]: e.target.value ? Number(e.target.value) : null,
        });
        setValue("parameters", [
          ...getValues("parameters").filter((p) => p.key !== "yAxisMinMax"),
          {
            key: "yAxisMinMax",
            type: "yAxisMinMax",
            value: {
              ...currentYAxisMinMax.value,
              [target]: e.target.value ? Number(e.target.value) : null,
            },
          },
        ]);
      } else {
        setYAxisMinMax((prev) => ({
          ...prev,
          [target]: e.target.value ? Number(e.target.value) : null,
        }));
        setValue("parameters", [
          ...getValues("parameters"),
          {
            key: "yAxisMinMax",
            type: "yAxisMinMax",
            value: {
              ...yAxisMinMax,
              [target]: e.target.value ? Number(e.target.value) : null,
            },
          },
        ]);
      }
    };

  return {
    yAxisMinMax,
    handleChange,
  };
};
