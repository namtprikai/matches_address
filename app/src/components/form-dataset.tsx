import {
  Card,
  makeStyles,
  mergeClasses,
  Option,
  tokens,
} from "@fluentui/react-components";
import { useEffect, useState } from "react";
import { Delete16Regular } from "@fluentui/react-icons";
import { type UseFormReturn } from "react-hook-form";
import { type z } from "zod";
import { THEME_COLORS } from "../config/theme-colors";
import { type SelectRawDataSet } from "../schema";
import { useDialogState } from "../hooks/use-dialog-state";
import { useFetchDatasetColumns } from "../hooks/use-fetch-dataset-columns";
import { useFetchDatasetColumnValues } from "../hooks/use-fetch-dataset-column-values";
import { type PreprocessParameters } from "../@types/job-parameters";
import { useFetchDatasetWithFilePath } from "../hooks/use-fetch-dataset-with-file-path";
import { lang } from "../lang";
import { getNormalizationDatasetInfo } from "../utils/extract-dataset-columns-from-schema";
import { type schema } from "../hooks/use-form-normalization";
import { isSpecialDatasetSchemaKey } from "../config/dataset-configs";
import { INPUT_FILE_TYPES } from "../config/file-types";
import { Dropdown } from "./ui/dropdown";
import { Field } from "./ui/field";
import { DialogImportDataset } from "./dialog-import-dataset";
import { TextWithTooltip } from "./ui/text-with-tooltip";
import { Select } from "./ui/select";

const useStyles = makeStyles({
  fileSelectorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "200px",
    height: "160px",
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    border: `1px dashed ${tokens.colorNeutralStroke2}`,
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: tokens.colorNeutralBackground3,
    gap: `${tokens.spacingVerticalS} 0`,
  },
  fieldContainer: {
    display: "flex",
    gap: "16px",
  },
  dropdownContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gridAutoRows: "60px",
    gap: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
  },
  dropdown: {
    height: "36px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  fieldInner: {
    display: "grid",
    gap: "4px",
  },
});

interface Value {
  id: PreprocessParameters["data"]["resident_registry"]["id"]; // ひとまずresident_registryの型を使う
  path: PreprocessParameters["data"]["resident_registry"]["path"] | undefined;
  columns?: Record<string, string | undefined>; // 国勢調査データにカラムがないためoptionalを指定する
}

type FormType = z.infer<typeof schema>;

interface Props {
  value: Value;
  dataKey: keyof typeof lang.components.normalizationData;
  schemaKey: keyof FormType["data"];
  appearance?: "default" | "large";
  onChange: (value: Value) => void;
  form?: UseFormReturn<FormType>;
}

export const FormDataset = ({
  value,
  dataKey,
  schemaKey,
  appearance,
  onChange,
  form,
}: Props): JSX.Element => {
  const styles = useStyles();
  const dialogState = useDialogState();
  const { data: dataSetColumns } = useFetchDatasetColumns({
    filename: value?.path,
  });
  const [isUpdateColumns, setIsUpdateColumns] = useState(false);

  useEffect(
    // ファイルが選択されたらドロップダウンの値を更新する
    function updateColumns() {
      if (!isUpdateColumns) return;
      if (!dataSetColumns || dataSetColumns.length === 0 || !value.columns)
        return;

      // 最初の要素をドロップダウンのdefault valueに設定する
      const [firstItem] = dataSetColumns;
      const columnEntries = Object.entries(value.columns);
      const newColumns = Object.fromEntries(
        columnEntries.map(([key]) => [key, firstItem]),
      );

      onChange({
        ...value,
        columns: newColumns,
      });
      setIsUpdateColumns(false);
    },

    [dataSetColumns, isUpdateColumns, onChange, value],
  );

  const datasetInfo = lang.components.normalizationData[dataKey];
  const datasetLabel = datasetInfo.label;
  const datasetDescription = datasetInfo.description || "";

  const inputFileType = isSpecialDatasetSchemaKey(schemaKey)
    ? form?.watch(`data.${schemaKey}.input_file_type`)
    : undefined;

  const noColumns = !dataSetColumns || dataSetColumns.length === 0;
  const noCSV = inputFileType && inputFileType !== "csv";

  /** 建物種別 */
  const [residentialValueOptions, setResidentialValueOptions] = useState<
    string[] | false
  >(false);

  // building_type カラムが選択されたときにその値を取得
  const buildingTypeColumn = value?.columns?.building_type;
  const { data: buildingTypeValues } = useFetchDatasetColumnValues({
    filename: value?.path,
    columnName: buildingTypeColumn,
  });

  // buildingTypeValues が更新されたら residentialValueOptions を更新
  useEffect(() => {
    if (schemaKey === "building_type_determination" && buildingTypeValues) {
      setResidentialValueOptions(buildingTypeValues);
    }
  }, [buildingTypeValues, schemaKey]);

  return (
    <Card>
      <TextWithTooltip
        textNode={datasetLabel}
        tooltipContent={datasetDescription}
      />
      <div className={styles.fieldContainer}>
        <div
          className={styles.fileSelectorContainer}
          onClick={() => {
            dialogState.setIsOpen(true);
          }}
          role="button"
        >
          <SelectedDataSetView
            filePath={value?.path}
            onDelete={() => {
              onChange({
                ...value,
                path: undefined,
                columns: Object.fromEntries(
                  Object.keys(value?.columns ?? {}).map((key) => [
                    key,
                    undefined,
                  ]),
                ),
              });
            }}
          />
        </div>
        <div
          // FormDatasetが横長の場合のスタイルだしわけ
          className={mergeClasses(
            styles.fieldInner,
            appearance === "large" && styles.dropdownContainer,
          )}
        >
          {isSpecialDatasetSchemaKey(schemaKey) && (
            <Field label="ファイル形式">
              <Select {...form?.register(`data.${schemaKey}.input_file_type`)}>
                {INPUT_FILE_TYPES.map((option) => (
                  <option key={option.type} value={option.type}>
                    {option.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          {(() => {
            // スキーマから動的にカラム情報を取得
            const datasetInfo = getNormalizationDatasetInfo(schemaKey);
            if (!datasetInfo || !datasetInfo.hasColumns) return null;

            return datasetInfo.columns.map((columnInfo) => {
              return (
                <Field
                  key={columnInfo.key}
                  className={styles.field}
                  label={
                    <TextWithTooltip
                      textNode={columnInfo.label + "カラム"}
                      tooltipContent={
                        columnInfo.description ||
                        lang.components.normalizationParameters[
                          columnInfo.key as keyof typeof lang.components.normalizationParameters
                        ]?.description ||
                        ""
                      }
                    />
                  }
                >
                  <Dropdown
                    className={styles.dropdown}
                    disabled={noColumns || noCSV}
                    onOptionSelect={(_, data) => {
                      onChange({
                        ...value,
                        columns: {
                          ...value?.columns,
                          [columnInfo.key]: data.optionValue,
                        },
                      });
                    }}
                    selectedOptions={[value?.columns?.[columnInfo.key] ?? ""]}
                    value={value?.columns?.[columnInfo.key] ?? ""}
                  >
                    {dataSetColumns?.map((column) => (
                      <Option key={column} text={column} value={column}>
                        {column}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              );
            });
          })()}

          {schemaKey === "building_type_determination" && (
            <Field
              label={
                <TextWithTooltip
                  textNode={
                    lang.components.normalizationParameters.building_type_values
                      .label
                  }
                  tooltipContent={
                    lang.components.normalizationParameters.building_type_values
                      .description
                  }
                />
              }
              style={{
                marginLeft: tokens.spacingHorizontalL,
              }}
            >
              <Dropdown
                className={styles.dropdown}
                disabled={!residentialValueOptions || noCSV}
                multiselect
                {...form?.register(`data.${schemaKey}.residential_values`)}
              >
                {residentialValueOptions &&
                  residentialValueOptions.map((column) => (
                    <Option key={column} text={column} value={column}>
                      {column}
                    </Option>
                  ))}
              </Dropdown>
            </Field>
          )}
        </div>
      </div>
      <DialogImportDataset
        dialogState={dialogState}
        onSubmit={(data) => {
          onChange({
            ...value,
            id: data.id,
            path: data?.file_path,
          });
          setIsUpdateColumns(true);
        }}
      />
    </Card>
  );
};

const selectedDataSetViewStyles = makeStyles({
  symbol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: `${tokens.spacingVerticalS} 0`,
  },
  roundedLabel: {
    backgroundColor: THEME_COLORS.primary,
    borderRadius: "14px",
    color: "#fff",
    fontWeight: tokens.fontWeightBold,
    lineHeight: "28px",
    padding: `0 ${tokens.spacingHorizontalXXL}`,
  },
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: `${tokens.spacingVerticalS} 0`,
    position: "relative",
    height: "100%",
  },
  deleteButton: {
    color: "#c4314b", // token内に同色が存在しないためハードコード
    cursor: "pointer",
    fontSize: tokens.fontSizeBase200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: tokens.spacingHorizontalXS,
    background: "none",
    border: "none",
  },
  selectedDataSetFilePath: {
    color: THEME_COLORS.primary,
    textDecoration: "underline",
    textAlign: "center",
  },
});

const SelectedDataSetView = ({
  filePath,
  onDelete,
}: {
  filePath: SelectRawDataSet["file_path"] | undefined;
  onDelete: () => void;
}): JSX.Element => {
  const styles = selectedDataSetViewStyles();
  const { data } = useFetchDatasetWithFilePath({
    type: "raw",
    filePath,
  });

  if (!data) {
    return (
      <div className={styles.symbol}>
        <img alt="upload file" src="/file-upload-icon.svg" />
        <div className={styles.roundedLabel}>データセットを選択</div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <p className={styles.selectedDataSetFilePath}>{data.file_name}</p>
      <button
        className={styles.deleteButton}
        onClick={(event) => {
          event.stopPropagation();
          onDelete();
        }}
      >
        <Delete16Regular />
        <span>削除</span>
      </button>
    </div>
  );
};
