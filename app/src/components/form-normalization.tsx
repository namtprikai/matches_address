import { useForm } from "react-hook-form";
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
  const { handleSubmit, setValue, getValues } =
    useForm<NormalizationParameters>({
      defaultValues: value,
    });

  const onSubmit = handleSubmit((data) => {
    onSave(data);
  });

  const styles = useStyles();

  return (
    <form className={styles.root} onSubmit={onSubmit}>
      <FormDataset
        appearance="large"
        dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.residentRegistry}
        name={"data.residentRegistry"}
        onChange={(value) => {
          setValue("data.residentRegistry", value);
        }}
        value={getValues().data.residentRegistry}
      />
      <FormDataset
        appearance="large"
        dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.waterStatus}
        name={"data.waterStatus"}
        onChange={(value) => {
          setValue("data.waterStatus", value);
        }}
        value={getValues().data.waterStatus}
      />
      <div className={styles.formGrid}>
        <FormDataset
          dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.waterUsage}
          name={"data.waterUsage"}
          onChange={(value) => {
            setValue("data.waterUsage", value);
          }}
          value={getValues().data.waterUsage}
        />
        <FormDataset
          dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.landRegistry}
          name={"data.landRegistry"}
          onChange={(value) => {
            setValue("data.landRegistry", value);
          }}
          value={getValues().data.landRegistry}
        />
      </div>
      <FormNormalizationSettings
        onChange={(value) => {
          setValue("settings", value);
        }}
        value={getValues().settings}
      />
    </form>
  );
};
