import { Controller, useController } from "react-hook-form";
import { makeStyles, tokens } from "@fluentui/react-components";
import { useEffect } from "react";
import { LanguageMap } from "../metadata";
import { useFormNormalization } from "../hooks/use-form-normalization";
import { useFetchJobs } from "../hooks/use-fetch-jobs";
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
  formId: string;
  jobId?: string;
};

export const FormNormalization = ({ formId, jobId }: Props): JSX.Element => {
  const { handleSubmit, control, reset } = useFormNormalization();
  const { data } = useFetchJobs(jobId ? Number(jobId) : undefined);

  const prevParameters = data ? data[0].parameters : undefined;

  useEffect(() => {
    if (prevParameters && jobId) {
      reset({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- ignore
        // @ts-ignore
        settings: prevParameters.settings,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- ignore
        // @ts-ignore
        data: prevParameters.data,
      });
    }
  }, [jobId, prevParameters, reset]);

  const onSubmit = handleSubmit(async (data) => {
    await window.ipcRenderer.invoke("execE001", {
      parameters: data,
    });
  });

  const styles = useStyles();

  const {
    field: { value: settingsValue, onChange: settingsOnChange },
  } = useController({
    name: "settings",
    control,
  });

  return (
    <form className={styles.root} id={formId} onSubmit={onSubmit}>
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
