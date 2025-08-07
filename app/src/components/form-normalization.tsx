import { Controller, type FieldErrors, useController } from "react-hook-form";
import { makeStyles, tokens } from "@fluentui/react-components";
import {
  type FormNormalizationType,
  useFormNormalization,
} from "../hooks/use-form-normalization";
import { type PreprocessParameters } from "../@types/job-parameters";
import {
  CATEGORY_DEFAULT_DATASETS,
  CATEGORY_ADDRESS_DATASETS,
  CATEGORY_DEFAULT_DATASETS_WITH_LARGE,
  CATEGORY_ADDRESS_DATASETS_WITH_LARGE,
  dataKeyMapping,
} from "../config/dataset-configs";
import { lang } from "../lang";
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

  const errorMessages = handleErrorMessage(errors);

  return (
    <form className={styles.root} id={formId} onSubmit={onSubmit}>
      {errorMessages &&
        errorMessages.map((msg, index) => (
          <ErrorMessage key={index} msg={msg} />
        ))}
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

const handleErrorMessage = (
  errors: FieldErrors<FormNormalizationType>,
): string[] | null => {
  if (Object.keys(errors).length === 0) {
    return null;
  }

  const messages: string[] = [];
  // 設定エラーの処理
  if (errors.settings) {
    const settingsMessages = {
      required: "設定項目は必須です。内容を入力してください。",
      invalid: "設定項目に無効な値があります。内容を確認してください。",
    };
    const message =
      settingsMessages[errors.settings.type as keyof typeof settingsMessages] ||
      "設定にエラーが発生しました。内容を確認してください。";
    messages.push(message);
  }

  // データエラーの処理
  if (errors.data) {
    Object.entries(dataKeyMapping).forEach(([field, labelKey]) => {
      if (errors.data?.[field as keyof typeof errors.data]) {
        const label = lang.components.normalizationData[labelKey].label;
        messages.push(
          `${label}の入力にエラーが発生しました。内容を確認してください。`,
        );
      }
    });
  }

  return messages.length > 0
    ? messages
    : ["不明のエラーが発生しました。フォームの内容を確認してください。"];
};
