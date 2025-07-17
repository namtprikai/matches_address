import { Fragment } from "react/jsx-runtime";
import { result_views, type SelectResultView } from "../../../schema";
import { LanguageMap } from "../../../metadata";
import { Fieldset } from "../../ui/fieldset";
import { FieldLegend } from "../../ui/field-legend";
import { Field } from "../../ui/field";
import { Input } from "../../ui/input";
import { Select } from "../../ui/select";
import { useFetchDataSetResults } from "../../../hooks/use-fetch-data-set-results";
import { useEditResultViewFields } from "../../../bi-modules/hooks/use-edit-result-view-fields";
import { ColumnFields } from "./_column-fields";
import { YAxisMinMaxFields } from "./_y-axis-min-max";

type Props = {
  dataSetResultId: SelectResultView["data_set_result_id"];
};

export const EditResultViewFields = ({
  dataSetResultId,
}: Props): JSX.Element => {
  const editResultViewFieldsState = useEditResultViewFields({
    dataSetResultId,
  });
  const {
    form: { watch, register, setValue },
    handleStyleChange,
    resetParametersByStyle,
  } = editResultViewFieldsState;

  const currentParameters = watch("parameters");
  const unit = watch("unit");
  const style = watch("style");

  const { data: dataSetResults } = useFetchDataSetResults();

  if (
    currentParameters === undefined ||
    unit === undefined ||
    style === undefined
  )
    return <></>;

  return (
    <>
      <Field label="データセットを選択">
        {dataSetResults && (
          <Select {...register("dataSetResultId")}>
            {dataSetResults.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title || "タイトルなし"}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="ビューのタイトル">
        <Input placeholder="選択中のビューのタイトル" {...register("title")} />
      </Field>
      <Fieldset>
        <FieldLegend>設定</FieldLegend>
        <Field label="種類">
          <Select {...register("style")} onChange={handleStyleChange}>
            {result_views.style.enumValues.map((item) => (
              <option key={item} value={item}>
                {LanguageMap["RESULT_VIEWS_STYLE"][item]}
              </option>
            ))}
          </Select>
        </Field>

        <ColumnFields {...editResultViewFieldsState} />

        {(style === "line" || style === "bar") && <YAxisMinMaxFields />}

        <Field label="集計単位">
          <Select
            {...register("unit")}
            onChange={(e) => {
              // styleに合わせてparameterをリセット
              resetParametersByStyle(style);
              // スタイルの値を更新
              setValue("unit", e.target.value as "building" | "area");
            }}
          >
            {result_views.unit.enumValues.map((item) => {
              // 棒グラフの場合は集計単位を地域に固定する
              // TODO: もっとマシな書き方がありそう
              if (style === "bar") {
                if (item === "area") {
                  return (
                    <option key={item} value={item}>
                      {LanguageMap["RESULT_VIEWS_UNIT"][item]}
                    </option>
                  );
                }
                return null;
              }

              if (
                item === "area" &&
                style !== "map" &&
                style !== "table" &&
                style !== "map-with-table"
              ) {
                return <Fragment key={item}></Fragment>;
              }

              return (
                <option key={item} value={item}>
                  {LanguageMap["RESULT_VIEWS_UNIT"][item]}
                </option>
              );
            })}
          </Select>
        </Field>
      </Fieldset>
    </>
  );
};
