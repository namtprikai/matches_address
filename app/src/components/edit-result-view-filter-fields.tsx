import { makeStyles, tokens } from "@fluentui/react-components";
import { useFormContext } from "react-hook-form";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { selectedResultViewAtom } from "../state/selected-result-view-atom";
import { type EditResultViewFormType } from "../@types/form-schema";
import {
  YEAR_LOWER_LIMIT,
  YEAR_UPPER_LIMIT,
} from "../zod/edit-result-view-form-schema";
import { Field } from "./ui/field";
import { Select } from "./ui/select";
import { Fieldset } from "./ui/fieldset";
import { FieldLegend } from "./ui/field-legend";

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

  const { register } = useFormContext<EditResultViewFormType>();

  const resultView = useAtomValue(selectedResultViewAtom);

  useEffect(() => {
    // 期間を取得する処理
    (async () => {
      if (!resultView?.data_set_result_id) return;
      const res = await window.ipcRenderer.invoke("readDataSetYear", {
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
          <Select
            {...register("year.start", {
              setValueAs: (v: EditResultViewFormType["year"]["start"]) =>
                v === YEAR_LOWER_LIMIT ? null : Number(v),
            })}
          >
            <option value={YEAR_LOWER_LIMIT}>{YEAR_LOWER_LIMIT}</option>
            {yearItems.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <span>〜</span>
          <Select
            {...register("year.end", {
              setValueAs: (v: EditResultViewFormType["year"]["end"]) =>
                v === YEAR_UPPER_LIMIT ? null : Number(v),
            })}
          >
            <option value={YEAR_UPPER_LIMIT}>{YEAR_UPPER_LIMIT}</option>
            {yearItems.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
      </Field>
    </Fieldset>
  );
};
