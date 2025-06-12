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
import { createViewDefaultParameters } from "../util/create-view-default-parameters";

type Params = {
  dataSetResultId: SelectResultView["data_set_result_id"];
};

export type UseEditResultViewFieldsReturnType = {
  form: UseFormReturn<EditViewFormType>;
  fieldArray: UseFieldArrayReturn<EditViewFormType>;
  handleStyleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  resetParametersByStyle: (style: SelectResultView["style"]) => void;
};

/** @note useFormContextを内部で利用 */
export const useEditResultViewFields = ({
  dataSetResultId,
}: Params): UseEditResultViewFieldsReturnType => {
  const form = useFormContext<EditViewFormType>();
  const { control, setValue, watch } = form;

  const formUnit = watch("unit");

  /** 設定値パラメータを扱うためのフィールドステート */
  const fieldArray = useFieldArray({
    control,
    name: "parameters",
  });

  const { replace } = fieldArray;

  const { data: referenceDates } = useFetchReferenceDates({
    dataSetResultId,
  });

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value as SelectResultView["style"];

    if (!value) return;

    // 種類の値を更新
    setValue("style", value);
    // 集計単位の初期値を設定する
    const unit =
      value === "map"
        ? "building"
        : TILE_VIEW_CONFIG[value].fields[0].option[0].unit;
    setValue("unit", unit);

    setValue(
      "parameters",
      createViewDefaultParameters(value, formUnit, referenceDates),
    );
  };

  return {
    form,
    fieldArray,
    handleStyleChange,
    resetParametersByStyle: (style) => {
      replace(createViewDefaultParameters(style, formUnit, referenceDates));
    },
  };
};
