import { Controller, useController, useForm } from "react-hook-form";
import { makeStyles, tokens } from "@fluentui/react-components";
import { type NormalizationParameters } from "../@types/normalization";
import { LanguageMap } from "../metadata";
import { FormDataset } from "./form-dataset";
import { FormNormalizationSettings } from "./form-normalization-settings";

const useStyles = makeStyles({
  root: {
    display: "flex",
    gap: "20px",
    flexDirection: "column",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gridAutoRows: "auto",
    gap: `${tokens.spacingHorizontalXL} ${tokens.spacingVerticalXL}`,
  },
});

type Props = {
  value: NormalizationParameters;
  onSave: (parameters: NormalizationParameters) => void;
};

export const FormNormalization = ({ value, onSave }: Props): JSX.Element => {
  const { handleSubmit, watch, control } = useForm<NormalizationParameters>({
    defaultValues: value,
  });

  const onSubmit = handleSubmit((data) => {
    onSave(data);
  });

  const styles = useStyles();

  const {
    field: { value: settingsValue, onChange: settingsOnChange },
  } = useController({
    name: "settings",
    control,
  });

  return (
    <form className={styles.root} onSubmit={onSubmit}>
      <Controller
        control={control}
        name={"data.residentRegistry"}
        render={({ field: { value, onChange } }) => (
          <FormDataset
            appearance="large"
            dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.residentRegistry}
            name={"data.residentRegistry"}
            onChange={onChange}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="data.waterStatus"
        render={({ field: { value, onChange } }) => (
          <FormDataset
            appearance="large"
            dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.waterStatus}
            name={"data.waterStatus"}
            onChange={onChange}
            value={value}
          />
        )}
      />
      <div className={styles.formGrid}>
        <Controller
          control={control}
          name="data.waterUsage"
          render={({ field: { value, onChange } }) => (
            <FormDataset
              dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.waterUsage}
              name={"data.waterUsage"}
              onChange={onChange}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="data.landRegistry"
          render={({ field: { value, onChange } }) => (
            <FormDataset
              dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.landRegistry}
              name={"data.landRegistry"}
              onChange={onChange}
              value={value}
            />
          )}
        />
      </div>
      <FormNormalizationSettings
        onChange={settingsOnChange}
        value={settingsValue}
      />
    </form>
  );
};
