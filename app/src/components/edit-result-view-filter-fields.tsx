import { makeStyles, tokens } from "@fluentui/react-components";
import { useFieldArray, useFormContext } from "react-hook-form";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { selectedResultViewAtom } from "../state/selected-result-view-atom";
import { type EditResultViewFormType } from "../@types/form-schema";
import { TILE_VIEW_CONFIG } from "../config/tile-view-config";
import { type TileViewFieldOption } from "../@types/charts";
import { type SelectResultView } from "../schema";
import { Field } from "./ui/field";
import { Select } from "./ui/select";
import { Fieldset } from "./ui/fieldset";
import { FieldLegend } from "./ui/field-legend";
import { EditorFilterConditionsForm } from "./editor-filter-conditions-form";

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

  const [yearItems, setYearItems] = useState<string[]>([]);

  const { register, watch, control } = useFormContext<EditResultViewFormType>();

  const resultView = useAtomValue(selectedResultViewAtom);

  const { fields, replace } = useFieldArray({
    control,
    name: "parameters",
  });

  const year = watch("year");
  const unit = watch("unit");
  const style = watch("style");

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
    return field.type === "filter" && field.key !== "year";
  });

  useEffect(() => {
    // 期間を取得する処理
    (async () => {
      if (!resultView?.data_set_result_id) return;
      const res = await window.ipcRenderer.invoke("fetchReferenceDates", {
        dataSetResultId: resultView.data_set_result_id,
      });

      setYearItems(res);
    })().catch(console.error);
  }, [resultView]);

  return (
    <Fieldset>
      <FieldLegend>フィルター</FieldLegend>

      <Field label="期間">
        <div className={styles.year}>
          <Select value={year.start} {...register("year.start")}>
            <option value="">下限なし</option>
            {yearItems.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <span>〜</span>
          <Select value={year.end} {...register("year.end")}>
            <option value="">上限なし</option>
            {yearItems.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
      </Field>

      <EditorFilterConditionsForm
        conditions={filterFields}
        onSave={(parameters) => {
          const prevOtherParameters = fields.filter((f) => {
            return f.type !== "filter" || f.key === "year";
          });
          const newParameters = [
            ...prevOtherParameters,
            ...parameters,
          ] as SelectResultView["parameters"];

          replace(newParameters);
        }}
        options={options}
        unit={unit ?? "building"}
      />
    </Fieldset>
  );
};
