import { Controller, useController } from "react-hook-form";
import { makeStyles, tokens } from "@fluentui/react-components";
import { useFormNormalization } from "../hooks/use-form-normalization";
import { type PreprocessParameters } from "../@types/job-parameters";
import {
  CATEGORY_DEFAULT_DATASETS,
  CATEGORY_ADDRESS_DATASETS,
  CATEGORY_DEFAULT_DATASETS_WITH_LARGE,
  CATEGORY_ADDRESS_DATASETS_WITH_LARGE,
} from "../config/dataset-configs";
import { FormDataset } from "./form-dataset";
import { FormNormalizationSettings } from "./form-normalization-settings";
import { ErrorMessage } from "./error-message";

const useStyles = makeStyles({
  root: {
    display: "flex",
    paddingTop: "16px",
    gap: "48px",
    flexDirection: "column",
  },
  category: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    color: tokens.colorBrandForeground1,
  },
  categoryTitle: {
    fontSize: "16px",
    fontWeight: "bold",
    marginBottom: "8px",
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
  preprocessParameters?: PreprocessParameters;
  afterSubmit: () => void;
};

export const FormNormalization = ({
  formId,
  preprocessParameters,
  afterSubmit,
}: Props): JSX.Element => {
  const form = useFormNormalization({
    defaultValues: preprocessParameters,
  });
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  const hasErrors = Object.keys(errors).length > 0;

  const onSubmit = handleSubmit(async (data) => {
    await window.ipcRenderer.invoke("execE001", {
      parameters: {
        parameterType: "preprocess",
        settings: data.settings,
        data: data.data,
      },
    });
    afterSubmit();
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
      {hasErrors && (
        <ErrorMessage msg="エラーが発生しました。フォームの内容を確認してください。" />
      )}
      <div className={styles.category}>
        <div className={styles.categoryTitle}>基本処理</div>
        {CATEGORY_DEFAULT_DATASETS_WITH_LARGE.map((config) => (
          <Controller
            key={config.fieldName}
            control={control}
            name={config.fieldName}
            render={({ field: { value, onChange } }) => (
              <FormDataset
                appearance={config.appearance}
                dataKey={config.dataKey}
                form={config.hasForm ? form : undefined}
                onChange={onChange}
                schemaKey={config.schemaKey}
                value={value}
              />
            )}
          />
        ))}
        <div className={styles.formGrid}>
          {CATEGORY_DEFAULT_DATASETS.map((config) => (
            <Controller
              key={config.fieldName}
              control={control}
              name={config.fieldName}
              render={({ field: { value, onChange } }) => (
                <FormDataset
                  appearance={config.appearance}
                  dataKey={config.dataKey}
                  form={config.hasForm ? form : undefined}
                  onChange={onChange}
                  schemaKey={config.schemaKey}
                  value={value}
                />
              )}
            />
          ))}
        </div>
      </div>

      <div className={styles.category}>
        <div className={styles.categoryTitle}>住所マスタ作成</div>
        {CATEGORY_ADDRESS_DATASETS_WITH_LARGE.map((config) => (
          <Controller
            key={config.fieldName}
            control={control}
            name={config.fieldName}
            render={({ field: { value, onChange } }) => (
              <FormDataset
                appearance={config.appearance}
                dataKey={config.dataKey}
                form={config.hasForm ? form : undefined}
                onChange={onChange}
                schemaKey={config.schemaKey}
                value={value}
              />
            )}
          />
        ))}
        <div className={styles.formGrid}>
          {CATEGORY_ADDRESS_DATASETS.map((config) => (
            <Controller
              key={config.fieldName}
              control={control}
              name={config.fieldName}
              render={({ field: { value, onChange } }) => (
                <FormDataset
                  appearance={config.appearance}
                  dataKey={config.dataKey}
                  form={config.hasForm ? form : undefined}
                  onChange={onChange}
                  schemaKey={config.schemaKey}
                  value={value}
                />
              )}
            />
          ))}
        </div>
      </div>

      <FormNormalizationSettings
        onChange={settingsOnChange}
        value={settingsValue}
      />
    </form>
  );
};
