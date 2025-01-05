import { useFieldArray, useFormContext } from "react-hook-form";
import { Fragment } from "react/jsx-runtime";
import { result_views, type SelectResultView } from "../../schema";
import { LanguageMap } from "../../metadata";
import { TILE_VIEW_CONFIG } from "../../config/tile-view-config";
import { getResultViewFieldOption } from "../../utils/get-view-field-option";
import { type EditResultViewFormType } from "../../@types/form-schema";
import {
  type AREA_DATASET_COLUMN,
  AREA_DATASET_COLUMN_METADATA,
  type BUILDING_DATASET_COLUMN,
  BUILDING_DATASET_COLUMN_METADATA,
} from "../../config/column-metadata";
import { Fieldset } from "../ui/fieldset";
import { FieldLegend } from "../ui/field-legend";
import { Field } from "../ui/field";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { useFetchDataSetResults } from "../../hooks/use-fetch-data-set-results";
import { type ReferenceDate } from "../../ipc-main-listeners/select-reference-dates";
import { formatDate } from "../../utils/format-date";
import { useFetchReferenceDates } from "../../hooks/use-fetch-reference-dates";
import { DynamicParameterInput } from "./dynamic-parameter-input";
import { FormGroupingResultView } from "./form-grouping-result-view";

type Props = {
  dataSetResultId: SelectResultView["data_set_result_id"];
};

export const EditResultViewFields = ({
  dataSetResultId,
}: Props): JSX.Element => {
  const { register, watch, control, setValue } =
    useFormContext<EditResultViewFormType>();

  const style = watch("style");
  const unit = watch("unit");
  const parameters = watch("parameters");

  const { fields, replace, update } = useFieldArray({
    control,
    name: "parameters",
  });

  const resetParametersByStyle = (style: SelectResultView["style"]): void => {
    if (!style) return;
    const option = TILE_VIEW_CONFIG[style];
    if (!option) return;
    replace(
      option.fields.map((field) => ({
        key: field.key,
        value: "",
        type: "column",
      })),
    );
  };

  const { data: referenceDates } = useFetchReferenceDates({
    dataSetResultId,
  });

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const value = e.target.value as SelectResultView["style"];
    if (!value) return;
    // styleに合わせてparameterをリセット
    resetParametersByStyle(value);
    // 種類の値を更新
    setValue("style", value);
    // 集計単位の初期値を設定する
    const unit = TILE_VIEW_CONFIG[value].fields[0].option[0].unit;
    setValue("unit", unit);
    // parametersに初期値を設定する
    const defaultParameters = TILE_VIEW_CONFIG[value].fields.map((field) => ({
      key: field.key,
      value: field.option[0].value,
      type: "column" as const,
    }));

    switch (value) {
      case "line": {
        const parameters = getLineParameters(referenceDates);
        setValue("parameters", [...defaultParameters, ...parameters]);
        return;
      }
      case "pie": {
        const parameters = getPieParameters();
        setValue("parameters", [...defaultParameters, ...parameters]);
        return;
      }
      default:
        setValue("parameters", defaultParameters);
    }
  };

  const groupingFields = fields.filter((field) => {
    return field.type === "group";
  });

  const columnFields = fields.filter((field) => {
    return field.type === "column";
  });

  const groupCalc = fields.find(
    (f) => f.key === "group_calc" && f.type === "group_option",
  );

  const { data: dataSetResults } = useFetchDataSetResults();

  return (
    <>
      <Field label="データセットを選択">
        <Select {...register("dataSetResultId")}>
          {dataSetResults?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.title || "タイトルなし"}
            </option>
          ))}
        </Select>
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
        {/** 以下動的にフィールド生成 */}
        {
          /**
           * 設定すべきフィールドを一括して表示・フォームとして設定する
           * 例えば表形式や円グラフ、棒グラフごとに応じて設定すべきカラムとその値、表示名称が異なるため動的に実装する必要あり
           */
          columnFields.map((field, index) => {
            if (style === null || unit === null) return null;

            const fieldOption = getResultViewFieldOption(style, field.key);

            if (!fieldOption) return null;

            if (fieldOption.type === "select" && field.type === "column") {
              const column = parameters.find((parameter) => {
                return (
                  parameter.key === field.key && parameter.type === "column"
                );
              });

              const columnMetadata =
                unit === "building"
                  ? BUILDING_DATASET_COLUMN_METADATA[
                      column?.value as BUILDING_DATASET_COLUMN
                    ]
                  : AREA_DATASET_COLUMN_METADATA[
                      column?.value as AREA_DATASET_COLUMN
                    ];

              return (
                <Fragment key={field.id}>
                  <DynamicParameterInput
                    type={fieldOption.type}
                    {...register(`parameters.${index}.value`)}
                    fieldOption={fieldOption}
                    onChange={(e) => {
                      if (field.key === "label" || field.key === "xAxis") {
                        const parametersWithoutGroup = fields.filter((f) => {
                          return f.type !== "group";
                        });
                        replace(parametersWithoutGroup);
                      }

                      update(index, {
                        key: field.key,
                        value: e.target.value,
                        type: "column",
                      });
                    }}
                    unit={unit}
                    value={field.value}
                  />
                  {
                    // カラムでグルーピングが設定されている場合、グルーピング設定用のフォームを表示
                    fieldOption?.grouping && (
                      <FormGroupingResultView
                        columnLabel={columnMetadata?.label}
                        columnType={columnMetadata?.type}
                        onSave={(parameters) => {
                          const prevOtherParameters = fields.filter((f) => {
                            return f.type !== "group";
                          });
                          const newParameters = [
                            ...prevOtherParameters,
                            ...parameters,
                          ] as SelectResultView["parameters"]; // union の型推論が効きづらいため、明示的に型を指定;
                          replace(newParameters);
                        }}
                        parameters={groupingFields}
                        unit={columnMetadata?.unit}
                      />
                    )
                  }
                  {
                    /**
                     * グルーピングが設定されている場合、集計単位を選択するフォームを表示
                     * ただし、X軸など集計単位の指定が不要な場合は表示しない(fieldOption.grouping === false)
                     * また、グルーピングが設定されていない場合も表示しない(groupingFields.length > 0)
                     */
                    fieldOption.grouping === false &&
                      groupingFields.length > 0 && (
                        <Select
                          onChange={(e) => {
                            const prevOtherParameters = fields.filter((f) => {
                              return f.type !== "group_option";
                            });
                            const newParameters = [
                              ...prevOtherParameters,
                              {
                                key: "group_calc",
                                value: e.target.value as
                                  | "avg"
                                  | "sum"
                                  | "count",
                                type: "group_option",
                              },
                            ] as SelectResultView["parameters"]; // union の型推論が効きづらいため、明示的に型を指定;
                            replace(newParameters);
                          }}
                          value={groupCalc?.value}
                        >
                          <option value="avg">値の平均</option>
                          <option value="sum">値の合計</option>
                          <option value="count">総件数（世帯数）</option>
                        </Select>
                      )
                  }
                </Fragment>
              );
            }

            // dropdownの場合は、DynamicParameterInputを使って表示するがonChangeの挙動が異なるため別記述
            if (fieldOption.type === "dropdown") {
              return (
                <DynamicParameterInput
                  type={fieldOption.type}
                  {...register(`parameters.${index}.value`)}
                  key={field.id}
                  fieldOption={fieldOption}
                  multiple={fieldOption.multiple ?? false}
                  onChange={(_, data) => {
                    // dropdownから返ってくる値が空の場合は何もしない
                    if (data.optionValue === undefined) return;

                    // 更新前の値をカンマ区切りの文字列としてデータクレンジングした上で配列化
                    const prevValue = field.value
                      .split(",")
                      .filter((value) => value !== "");

                    // 更新後の値を生成
                    const newValue = prevValue.includes(data.optionValue)
                      ? prevValue.filter((value) => {
                          return value !== data.optionValue;
                        })
                      : [...prevValue, data.optionValue];

                    update(index, {
                      key: field.key,
                      value: newValue.join(","),
                      type: "column",
                    });
                  }}
                  unit={unit}
                  value={field.value}
                />
              );
            }

            // dialogの場合は、DynamicParameterInputを使って表示するがonSaveの挙動が異なるため別記述
            if (fieldOption.type === "dialog") {
              return (
                <DynamicParameterInput
                  type="dialog"
                  {...register(`parameters.${index}.value`)}
                  key={field.id}
                  fieldOption={fieldOption}
                  multiple={fieldOption.multiple ?? false}
                  onSave={(newValue) => {
                    update(index, {
                      key: field.key,
                      value: newValue.join(","),
                      type: "column",
                    });
                  }}
                  unit={unit}
                  value={field.value}
                />
              );
            }

            return <></>;
          })
        }
        {/** ここまで動的にフィールド生成 */}
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

              if (item === "area" && style !== "map" && style !== "table") {
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

function getLineParameters(
  referenceDates: ReferenceDate[] | undefined,
): SelectResultView["parameters"] {
  if (!referenceDates) return [];
  const result: SelectResultView["parameters"] = referenceDates.map((date) => ({
    key: `group_${(new Date().getTime() + Math.floor(10000 * Math.random())).toString(16)}` as "group_calc",
    value: {
      label: formatDate(date, "YYYY年"),
      referenceColumnType: "date",
      operation: "eq",
      value: date,
    },
    type: "group",
  }));

  return result;
}

function getPieParameters(): SelectResultView["parameters"] {
  const values: {
    label: string;
    startValue: number;
    lastValue: number;
    includesStart: boolean;
    includesLast: boolean;
  }[] = [
    {
      label: "空き家確率0~25%",
      startValue: 0,
      lastValue: 25,
      includesStart: true,
      includesLast: true,
    },
    {
      label: "空き家確率25~50%",
      startValue: 25,
      lastValue: 50,
      includesStart: true,
      includesLast: true,
    },
    {
      label: "空き家確率50~75%",
      startValue: 50,
      lastValue: 75,
      includesStart: true,
      includesLast: true,
    },
    {
      label: "空き家確率75~100%",
      startValue: 75,
      lastValue: 100,
      includesStart: true,
      includesLast: true,
    },
  ];

  const result: SelectResultView["parameters"] = values.map((value) => ({
    key: `group_${(new Date().getTime() + Math.floor(10000 * Math.random())).toString(16)}` as "group_calc",
    value: {
      label: value.label,
      referenceColumnType: "float",
      operation: "range",
      value: 0,
      startValue: value.startValue,
      includesStart: value.includesStart,
      lastValue: value.lastValue,
      includesLast: value.includesLast,
    },
    type: "group",
  }));

  return result;
}
