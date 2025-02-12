import { makeStyles, tokens } from "@fluentui/react-components";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Suspense } from "react";
import { TILE_VIEW_CONFIG } from "../../config/tile-view-config";
import { type SelectResultView } from "../../schema";
import { useFetchReferenceDates } from "../../hooks/use-fetch-reference-dates";
import { Field } from "../ui/field";
import { Select } from "../ui/select";
import { Fieldset } from "../ui/fieldset";
import { FieldLegend } from "../ui/field-legend";
import { isObject } from "../../utils/is-object";
import { type FilterCondition } from "../../bi-modules/interfaces/parameter";
import { type EditViewFormType } from "../../bi-modules/interfaces/edit-view-form";
import { FormFilteringParameters } from "./form-filtering-parameters";
import { FormAreaFilter } from "./form-area-filter";

const useStyles = makeStyles({
  form: {
    display: "grid",
    gap: tokens.spacingVerticalXXL,
  },
  year: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
  },
  area: {
    display: "flex",
    justifyContent: "space-between",
  },
});

/**
 * フィルタ条件用のフィールド表示コンポーネント
 *
 * @returns
 */
export const EditResultViewFilterFields = ({
  resultView,
}: {
  resultView: SelectResultView | undefined;
}): JSX.Element => {
  const styles = useStyles();

  const { control, watch } = useFormContext<EditViewFormType>();

  const { replace } = useFieldArray({
    control,
    name: "parameters",
  });

  const currentParameters = watch("parameters");
  const unit = watch("unit");
  const style = watch("style");

  const { data: referenceDates } = useFetchReferenceDates({
    dataSetResultId: resultView?.data_set_result_id,
  });

  if (
    currentParameters === undefined ||
    unit === undefined ||
    style === undefined
  )
    return <></>;

  const areaFilter = currentParameters.find(
    (f) => f.key === "area" && f.type === "filter",
  );

  const areas: string[] = areaFilter?.value ?? [];

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

  const currentYear = currentParameters.find((f) => f.key === "year");

  // データセットは年度単位で入力する前提だが、ユーザーの入力によっては年の値の重複する可能性が必ずしも排除しきれないため重複を除外する処理を入れる
  const yearItems = Array.from(
    new Set(referenceDates?.map((r) => new Date(r).getFullYear().toString())),
  );

  return (
    <Fieldset>
      <FieldLegend>フィルター</FieldLegend>

      <Field label="期間">
        <div className={styles.year}>
          <Select
            disabled={style === "map"}
            onChange={(e) => {
              const yearStart = e.target.value;
              const excludedYearParameters = currentParameters.filter((f) => {
                if (f.type === "filter" && f.key === "year") {
                  return false;
                }
                return true;
              });

              replace([
                ...excludedYearParameters,
                {
                  type: "filter",
                  key: "year",
                  value: {
                    start: yearStart,
                    end: currentYear?.value.end || "",
                  },
                },
              ]);
            }}
            value={style === "map" ? "" : currentYear?.value.start}
          >
            <option value="">下限なし</option>
            {yearItems
              ?.sort((a, b) => a.localeCompare(b))
              .map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
          </Select>
          <span>〜</span>
          <Select
            disabled={style === "map"}
            onChange={(e) => {
              const yearEnd = e.target.value;
              const excludedYearParameters = currentParameters.filter((f) => {
                if (f.type === "filter" && f.key === "year") {
                  return false;
                }
                return true;
              });
              replace([
                ...excludedYearParameters,
                {
                  type: "filter",
                  key: "year",
                  value: {
                    start: currentYear?.value.start || "",
                    end: yearEnd,
                  },
                },
              ]);
            }}
            value={style === "map" ? "" : currentYear?.value.end}
          >
            <option value="">上限なし</option>
            {yearItems
              ?.sort((a, b) => a.localeCompare(b))
              .map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
          </Select>
        </div>
      </Field>

      <Suspense>
        <FormAreaFilter
          areas={areas}
          dataSetResultId={resultView?.data_set_result_id ?? undefined}
          onSave={(values) => {
            const excludedYearParameters = currentParameters.filter((f) => {
              if (f.type === "filter" && f.key === "area") {
                return false;
              }

              return true;
            });

            replace([
              ...excludedYearParameters,
              {
                type: "filter",
                key: "area",
                value: values,
              },
            ]);
          }}
          unit={unit ?? "building"}
        />
      </Suspense>

      <FormFilteringParameters
        onSave={(parameters) => {
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
          ] as SelectResultView["parameters"]; // union の型推論が効きづらいため、明示的に型を指定;

          replace(newParameters);
        }}
        options={options}
        parameters={filteredCurrentParameters}
        unit={unit ?? "building"}
      />
    </Fieldset>
  );
};

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
