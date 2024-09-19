import { makeStyles, tokens } from "@fluentui/react-components";
import { useFormContext } from "react-hook-form";
import { useAtomValue } from "jotai";
import { selectedResultViewAtom } from "../state/selected-result-view-atom";
import { type EditResultViewFormType } from "../@types/form-schema";
import { useFetchReferenceDates } from "../hooks/use-fetch-reference-dates";
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
  const { register, watch } = useFormContext<EditResultViewFormType>();
  const resultView = useAtomValue(selectedResultViewAtom);
  const { data: referenceDates } = useFetchReferenceDates({
    dataSetResultId: resultView?.data_set_result_id,
  });
  const yearItems = referenceDates?.map((r) =>
    new Date(r).getFullYear().toString(),
  );
  const year = watch("year");

  return (
    <Fieldset>
      <FieldLegend>フィルター</FieldLegend>

      <Field label="期間">
        <div className={styles.year}>
          <Select value={year.start} {...register("year.start")}>
            <option value="">下限なし</option>
            {yearItems?.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
          <span>〜</span>
          <Select value={year.end} {...register("year.end")}>
            <option value="">上限なし</option>
            {yearItems?.map((item) => (
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
