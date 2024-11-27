import { Controller, useController, useForm } from "react-hook-form";
import { makeStyles, tokens } from "@fluentui/react-components";
import { LanguageMap } from "../metadata";
import { type PreprocessParameters } from "../@types/job-parameters";
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
  parameters: PreprocessParameters;
  onSave: (parameters: PreprocessParameters) => void;
};

export const FormNormalization = ({
  parameters,
  onSave,
}: Props): JSX.Element => {
  const { handleSubmit, control } = useForm<PreprocessParameters>({
    defaultValues: parameters,
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
        name={"data.resident_registry"}
        render={({ field: { value, onChange } }) => (
          <FormDataset
            appearance="large"
            dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.residentRegistry}
            onChange={onChange}
            value={value}
          />
        )}
      />
      <Controller
        control={control}
        name="data.water_status"
        render={({ field: { value, onChange } }) => (
          <FormDataset
            appearance="large"
            dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.waterStatus}
            onChange={onChange}
            value={value}
          />
        )}
      />
      <div className={styles.formGrid}>
        <Controller
          control={control}
          name="data.water_usage"
          render={({ field: { value, onChange } }) => (
            <FormDataset
              dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.waterUsage}
              onChange={onChange}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="data.land_registry"
          render={({ field: { value, onChange } }) => (
            <FormDataset
              dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.landRegistry}
              onChange={onChange}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="data.vacant_house"
          render={({ field: { value, onChange } }) => (
            <FormDataset
              dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.vacantHouse}
              onChange={onChange}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="data.geocoding"
          render={({ field: { value, onChange } }) => (
            <FormDataset
              dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.geocoding}
              onChange={onChange}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="data.building_polygon"
          render={({ field: { value, onChange } }) => (
            <FormDataset
              dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.buildingPolygon}
              onChange={onChange}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="data.urban_planning"
          render={({ field: { value, onChange } }) => (
            <FormDataset
              dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.urbanPlanning}
              onChange={onChange}
              value={value}
            />
          )}
        />
        <Controller
          control={control}
          name="data.census"
          render={({ field: { value, onChange } }) => (
            <FormDataset
              dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.census}
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
