import {
  useFieldArray,
  type UseFieldArrayReturn,
  useForm,
  type UseFormReturn,
  type UseFieldArrayReplace,
} from "react-hook-form";
import { isObject } from "../../utils/is-object";
import {
  isFilterCondition,
  type Parameter,
  type FilterCondition,
} from "../interfaces/parameter";
import { type EditViewFormType } from "../interfaces/edit-view-form";
import { TILE_VIEW_CONFIG } from "../../config/tile-view-config";
import { type SelectResultView } from "../../schema";
import {
  type AREA_DATASET_COLUMN,
  type BUILDING_DATASET_COLUMN,
} from "../../config/column-metadata";
import { getColumnMetadata } from "../../utils/get-column-metadata";

// 仮
export type HandleSelectorOption = {
  key: string;
  active: boolean;
};

type Params = {
  style: SelectResultView["style"];
  unit: EditViewFormType["unit"];
  currentParameters: EditViewFormType["parameters"];
  replace: UseFieldArrayReplace<EditViewFormType, "parameters">;
};

export type UseFormFilteringParametersReturnType = {
  handleRemove: (index: number) => void;
  handleSelector: (options: HandleSelectorOption[]) => void;
  onSave: (e?: React.BaseSyntheticEvent) => Promise<void>;
  optionsWithActive: {
    key: BUILDING_DATASET_COLUMN | AREA_DATASET_COLUMN;
    active: boolean;
  }[];
  filteredCurrentParameters: FilterCondition[];
  unit: EditViewFormType["unit"];
  formState: UseFormReturn<{
    parameters: FilterCondition[];
  }>;
  fieldState: UseFieldArrayReturn<
    {
      parameters: FilterCondition[];
    },
    "parameters",
    "id"
  >;
};

/**
 * FormFilteringParametersを利用するためのHooks
 * optionsWithActiveは、カラム選択肢と選択状態を持つオブジェクトの配列
 */
export const useFormFilteringParameters = ({
  style,
  unit,
  currentParameters,
  replace,
}: Params): UseFormFilteringParametersReturnType => {
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

  const formState = useForm<{
    parameters: FilterCondition[];
  }>({
    defaultValues: {
      parameters: filteredCurrentParameters,
    },
  });

  const fieldState = useFieldArray({
    control: formState.control,
    name: "parameters",
  });
  const { fields, remove } = fieldState;

  const optionsWithActive = options.map((option) => {
    return {
      key: option,
      active:
        fields.find((f) => {
          if (!isFilterCondition(f)) return false;
          return f.value.referenceColumn === option;
        }) != null
          ? true
          : false,
    };
  });

  const handleRemove = (index: number): void => {
    remove(index);
  };

  const handleSelector = (options: HandleSelectorOption[]): void => {
    const newFields: (Parameter | null)[] = options.map((option) => {
      if (option.active) {
        const targetField = fields.find((field) => {
          if (!isFilterCondition(field)) return false;
          return field.value.referenceColumn === option.key;
        });
        if (targetField) {
          return targetField;
        }

        const metadata = getColumnMetadata({
          unit,
          key: option.key,
        });

        if (metadata === null) {
          return null;
        }
        /** 値の検証 */
        if (!(metadata.type === "text" || metadata.type === "date")) {
          return null;
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
      return null;
    });
    const cleanedFields = newFields.filter((field) => field !== null);
    replace(cleanedFields);
  };

  const onSave = formState.handleSubmit((data) => {
    const parameters = data.parameters;
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
  });

  return {
    handleRemove,
    handleSelector,
    onSave,
    optionsWithActive,
    filteredCurrentParameters,
    unit,
    formState,
    fieldState,
  };
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
