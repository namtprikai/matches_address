import {
  useFieldArray,
  type UseFieldArrayReturn,
  useFormContext,
  type UseFormReturn,
} from "react-hook-form";
import { type SelectResultView } from "../../schema";
import { type EditViewFormType } from "../interfaces/edit-view-form";
import { useFetchReferenceDates } from "../../hooks/use-fetch-reference-dates";
import { TILE_VIEW_CONFIG } from "../../config/tile-view-config";
import { createDefaultLineGroupParameters } from "../util/create-default-line-group-parameters";
import { createDefaultPieGroupParameters } from "../util/create-default-pie-group-parameters";

type Params = {
  dataSetResultId: SelectResultView["data_set_result_id"];
};

type ReturnType = {
  form: UseFormReturn<EditViewFormType>;
  fieldArray: UseFieldArrayReturn<EditViewFormType>;
  handleStyleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  resetParametersByStyle: (style: SelectResultView["style"]) => void;
};

/** @note useFormContextを内部で利用 */
export const useEditResultViewFields = ({
  dataSetResultId,
}: Params): ReturnType => {
  const form = useFormContext<EditViewFormType>();
  const { control, setValue } = form;
  const fieldArray = useFieldArray({
    control,
    name: "parameters",
  });

  const { data: referenceDates } = useFetchReferenceDates({
    dataSetResultId,
  });

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value as SelectResultView["style"];
    if (!value) return;
    // styleに合わせてparameterをリセット
    // resetParametersByStyle(value);
    // 種類の値を更新
    setValue("style", value);
    // 集計単位の初期値を設定する
    const unit =
      value === "map"
        ? "building"
        : TILE_VIEW_CONFIG[value].fields[0].option[0].unit;
    setValue("unit", unit);
    // parametersに初期値を設定する
    const defaultParameters = TILE_VIEW_CONFIG[value].fields.map((field) => ({
      key: field.key,
      value: field.option[0].value,
      type: "column" as const,
    }));

    switch (value) {
      case "line": {
        const parameters = createDefaultLineGroupParameters(referenceDates);
        setValue("parameters", [...defaultParameters, ...parameters]);
        return;
      }
      case "pie": {
        const parameters = createDefaultPieGroupParameters();
        setValue("parameters", [...defaultParameters, ...parameters]);
        return;
      }
      default:
        setValue("parameters", defaultParameters);
    }
  };

  const resetParametersByStyle = (style: SelectResultView["style"]): void => {
    if (!style) return;
    const option = TILE_VIEW_CONFIG[style];
    if (!option) return;
    // replace(
    //   option.fields.map((field) => ({
    //     key: field.key,
    //     value: "",
    //     type: "column",
    //   })),
    // );
  };

  return {
    form,
    fieldArray,
    handleStyleChange,
    resetParametersByStyle,
  };
};
