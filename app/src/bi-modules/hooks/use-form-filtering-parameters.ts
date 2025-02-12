import { type UseFieldArrayReplace } from "react-hook-form";
import { isObject } from "../../utils/is-object";
import { type FilterCondition } from "../interfaces/parameter";
import { type EditViewFormType } from "../interfaces/edit-view-form";
import { TILE_VIEW_CONFIG } from "../../config/tile-view-config";
import { type SelectResultView } from "../../schema";
import {
  type AREA_DATASET_COLUMN,
  type BUILDING_DATASET_COLUMN,
} from "../../config/column-metadata";

type Params = {
  style: SelectResultView["style"];
  unit: EditViewFormType["unit"];
  currentParameters: EditViewFormType["parameters"];
  replace: UseFieldArrayReplace<EditViewFormType, "parameters">;
};

type ReturnType = {
  filteredCurrentParameters: FilterCondition[];
  onSave: (parameters: EditViewFormType["parameters"]) => void;
  options: (BUILDING_DATASET_COLUMN | AREA_DATASET_COLUMN)[];
};

export const useFormFilteringParameters = ({
  style,
  unit,
  currentParameters,
  replace,
}: Params): ReturnType => {
  // 表示形式ごとに入力するフィールドを変更するための設定を取得
  const fieldOptions = TILE_VIEW_CONFIG[style ?? "map"];
  // 重複削除のためArray.from(new Set())を利用
  const options = Array.from(
    new Set(
      fieldOptions.fields.flatMap((field) => {
        return field.option.flatMap((option) => {
          if (option.unit === unit) {
            return option.value;
          }
          return [];
        });
      }),
    ),
  );

  // parameterのうちフィルタ条件のフィールドのみを取得
  const filteredCurrentParameters = currentParameters.filter((field) => {
    return (
      field.type === "filter" && field.key !== "year" && field.key !== "area"
    );
  });

  const onSave = (parameters: EditViewFormType["parameters"]): void => {
    const customizedParameters = parameters.map((p) => {
      if (!isObject(p.value))
        return {
          ...p,
          value: p.value,
        };
      if (p.type !== "filter")
        return {
          ...p,
          value: p.value,
        };

      return {
        ...p,
        value: {
          ...p.value,
          value:
            "value" in p.value && p.value.value !== undefined
              ? parsePercentageValue({
                  value: p.value.value,
                  referenceColumnType: p.value.referenceColumnType,
                })
              : undefined,
          startValue:
            "startValue" in p.value && p.value.startValue !== undefined
              ? parsePercentageValue({
                  value: p.value.startValue,
                  referenceColumnType: p.value.referenceColumnType,
                })
              : undefined,
          lastValue:
            "lastValue" in p.value && p.value.lastValue !== undefined
              ? parsePercentageValue({
                  value: p.value.lastValue,
                  referenceColumnType: p.value.referenceColumnType,
                })
              : undefined,
        },
      };
    });

    const prevOtherParameters = currentParameters.filter((f) => {
      return f.type !== "filter" || f.key === "year" || f.key === "area";
    });
    const newParameters = [
      ...prevOtherParameters,
      ...customizedParameters,
    ] as EditViewFormType["parameters"]; // union の型推論が効きづらいため、明示的に型を指定;

    replace(newParameters);
  };

  return { onSave, filteredCurrentParameters, options };
};

/** Utility */
function parsePercentageValue({
  value,
  referenceColumnType,
}: {
  value: string | number;
  referenceColumnType: FilterCondition["value"]["referenceColumnType"];
}): string | number {
  if (typeof value === "string") return value;
  if (referenceColumnType === "float") return value / 100;
  return value;
}
