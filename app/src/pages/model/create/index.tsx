import {
  Caption1,
  Card,
  makeStyles,
  Subtitle2,
  Text,
  tokens,
} from "@fluentui/react-components";
import { ArrowLeftFilled } from "@fluentui/react-icons";
import { Fragment, useEffect, useState } from "react";
import { type z } from "zod";
import { useParams } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { useDialogState } from "../../../hooks/use-dialog-state";
import { DialogImportNormalizedDataset } from "../../../components/dialog-import-normalized-dataset";
import { type SelectNormalizedDataSet } from "../../../schema";
import { DialogExplanatoryVariables } from "../../../components/dialog-explanatory-variables";
import { DialogModelAdvanced } from "../../../components/dialog-model-advanced";
import {
  type schema,
  useFormModelCreate,
} from "../../../hooks/use-form-model-create";
import { DialogModelMessage } from "../../../components/dialog-model-message";
import { useFetchDatasetColumns } from "../../../hooks/use-fetch-dataset-columns";
import { useFetchJob } from "../../../hooks/use-fetch-job";
import { useFetchNormalizedDatasetWithFilePath } from "../../../hooks/use-fetch-normalized-dataset-with-file-path";

const useStyles = makeStyles({
  root: {
    display: "flex",
    gap: tokens.spacingVerticalXXL,
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  },
  heading: {
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase600,
    height: "34px",
  },
  contents: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXL,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: tokens.spacingHorizontalXL,
    height: "68px",
  },
});

type FormType = z.infer<typeof schema>;

export const ModelCreate = (): JSX.Element => {
  const styles = useStyles();

  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading: isJobLoading } = useFetchJob({
    id: Number(id),
  });
  const modelCreateParameters =
    job?.parameters.parameterType === "ml" ? job.parameters : undefined;
  const { data: currentNormalizedDataset } =
    useFetchNormalizedDatasetWithFilePath({
      filePath: modelCreateParameters?.input_path,
    });
  const [normalizedDataSet, setNormalizedDataSet] =
    useState<SelectNormalizedDataSet>();
  const [explanatoryVariables, setExplanatoryVariables] = useState<string[]>(
    [],
  );

  const form = useFormModelCreate();
  const {
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = form;

  useEffect(
    function setCurrentValues() {
      if (!modelCreateParameters || !currentNormalizedDataset) return;

      setNormalizedDataSet(currentNormalizedDataset);
      setExplanatoryVariables(
        modelCreateParameters.settings.explanatory_variables,
      );
      setValue("settings.advanced", modelCreateParameters.settings.advanced);
    },
    [currentNormalizedDataset, modelCreateParameters, setValue],
  );

  const modelMessageDialogState = useDialogState();

  const onSubmit = handleSubmit(async (data: FormType) => {
    await window.ipcRenderer.invoke("buildModel", {
      data: {
        parameterType: "ml",
        ...data,
      },
    });
    modelMessageDialogState.setIsOpen(true);
  });

  const importNormalizedDatasetDialogState = useDialogState();

  const explanatoryVariablesDialogState = useDialogState();
  const { data: datasetColumns } = useFetchDatasetColumns({
    filename: normalizedDataSet?.file_path,
  });

  const modelAdvancedDialogState = useDialogState();
  const modelAdvanced = watch("settings.advanced");

  return (
    <form className={styles.root} onSubmit={onSubmit}>
      <h2 className={styles.heading}>
        <a href="#model">
          <ArrowLeftFilled />
        </a>
        モデル構築
      </h2>

      <div className={styles.contents}>
        <Card>
          <Subtitle2>① ファイルをインポート</Subtitle2>
          <div>{normalizedDataSet?.file_name}</div>
          <div>
            <Button
              appearance="primary"
              onClick={() => importNormalizedDatasetDialogState.setIsOpen(true)}
            >
              インポート
            </Button>
            <div>
              <Text>{errors.input_path?.message}</Text>
            </div>
          </div>
        </Card>
        <DialogImportNormalizedDataset
          dialogState={importNormalizedDatasetDialogState}
          onSelected={(data) => {
            setNormalizedDataSet(data);
            setValue("input_path", data.file_path);
          }}
        />

        <Card>
          <Subtitle2>② 説明変数に使うカラムの選択</Subtitle2>
          {explanatoryVariables.length > 0 && (
            <div>
              {explanatoryVariables.map((column, index) => (
                <Fragment key={column}>
                  <Caption1>{column}</Caption1>
                  {index !== explanatoryVariables.length - 1 && (
                    <Caption1>,</Caption1>
                  )}
                </Fragment>
              ))}
            </div>
          )}
          <div>
            <Button
              appearance="primary"
              onClick={() => explanatoryVariablesDialogState.setIsOpen(true)}
            >
              {explanatoryVariables.length > 0 ? "カラムを変更" : "インポート"}
            </Button>
          </div>
          <div>
            <Text>{errors.settings?.explanatory_variables?.message}</Text>
          </div>
        </Card>
        {!isJobLoading ? (
          <DialogExplanatoryVariables
            columnOptions={datasetColumns || []}
            dialogState={explanatoryVariablesDialogState}
            initialValues={
              modelCreateParameters?.settings.explanatory_variables
            }
            onSelected={(data) => {
              setExplanatoryVariables(data);
              setValue("settings.explanatory_variables", data);
            }}
          />
        ) : null}
        <Card>
          <Subtitle2>③ パラメーターを変更</Subtitle2>
          {modelAdvanced && (
            <span>
              {Object.entries(modelAdvanced)
                .filter(([, value]) => value)
                /** @todo keyを日本語に置き換えたい */
                .map(([key, value]) => `${key}: ${value || "未設定"}`)
                .join(" / ")}
            </span>
          )}
          <div>
            <Button
              appearance="transparent"
              onClick={() => modelAdvancedDialogState.setIsOpen(true)}
            >
              高度な設定を変更
            </Button>
          </div>
          <div>
            <Text>{errors.settings?.advanced?.message}</Text>
          </div>
        </Card>
        {!isJobLoading ? (
          <DialogModelAdvanced
            dialogState={modelAdvancedDialogState}
            initialValues={modelCreateParameters?.settings.advanced}
            onSelected={(data) => setValue("settings.advanced", data)}
          />
        ) : null}
      </div>

      <div className={styles.footer}>
        <Button appearance="primary" size="large" type="submit">
          モデル作成
        </Button>
      </div>
      <DialogModelMessage dialogState={modelMessageDialogState} />
    </form>
  );
};
