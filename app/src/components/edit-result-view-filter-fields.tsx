import { makeStyles, tokens } from "@fluentui/react-components";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useAtomValue } from "jotai";
import { lazy, Suspense } from "react";
import { selectedResultViewAtom } from "../state/selected-result-view-atom";
import { type EditResultViewFormType } from "../@types/form-schema";
import { TILE_VIEW_CONFIG } from "../config/tile-view-config";
import { type SelectResultView } from "../schema";
import { useFetchReferenceDates } from "../hooks/use-fetch-reference-dates";
import { Field } from "./ui/field";
import { Select } from "./ui/select";
import { Fieldset } from "./ui/fieldset";
import { FieldLegend } from "./ui/field-legend";
import { EditorFilterParametersForm } from "./editor-filter-parameters-form";

// コンポーネントを遅延評価で読み込むことでパフォーマンスに配慮
const AreaFilterForm = lazy(() =>
  import("./area-filter-form").then((module) => ({
    default: module.AreaFilterForm,
  })),
);

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

export const EditResultViewFilterFields = (): JSX.Element => {
  const styles = useStyles();

  const { register, watch, control } = useFormContext<EditResultViewFormType>();

  const resultView = useAtomValue(selectedResultViewAtom);

  const { fields, replace } = useFieldArray({
    control,
    name: "parameters",
  });

  const year = watch("year");
  const unit = watch("unit");
  const style = watch("style");

  const areaFilter = fields.find(
    (f) => f.key === "area" && f.type === "filter",
  );

  const areas: string[] = areaFilter?.value ?? [];

  const fieldOptions = TILE_VIEW_CONFIG[style ?? "map"];
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

  const filterFields = fields.filter((field) => {
    return (
      field.type === "filter" && field.key !== "year" && field.key !== "area"
    );
  });

  const { data: referenceDates } = useFetchReferenceDates({
    dataSetResultId: resultView?.data_set_result_id,
  });
  const yearItems = Array.from(
    new Set(referenceDates?.map((r) => new Date(r).getFullYear().toString())),
  );

  return (
    <Fieldset>
      <FieldLegend>フィルター</FieldLegend>

      <Field label="期間">
        <div className={styles.year}>
          <Select
            value={style === "map" ? "" : year.start}
            {...register("year.start")}
            disabled={style === "map"}
          >
            <option value="">下限なし</option>
            {yearItems?.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <span>〜</span>
          <Select
            value={style === "map" ? "" : year.end}
            {...register("year.end")}
            disabled={style === "map"}
          >
            <option value="">上限なし</option>
            {yearItems?.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
      </Field>

      <Suspense fallback={null}>
        <AreaFilterForm
          areas={areas}
          dataSetResultId={resultView?.id}
          onSave={(values) => {
            const excludedYearParameters = fields.filter((f) => {
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
            ] as SelectResultView["parameters"]);
          }}
          unit={unit ?? "building"}
        />
      </Suspense>

      <EditorFilterParametersForm
        onSave={(parameters) => {
          const prevOtherParameters = fields.filter((f) => {
            return f.type !== "filter" || f.key === "year" || f.key === "area";
          });
          const newParameters = [
            ...prevOtherParameters,
            ...parameters,
          ] as SelectResultView["parameters"];

          replace(newParameters);
        }}
        options={options}
        parameters={filterFields}
        unit={unit ?? "building"}
      />
    </Fieldset>
  );
};
