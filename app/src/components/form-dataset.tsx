import {
  Card,
  makeStyles,
  mergeClasses,
  Option,
  tokens,
} from "@fluentui/react-components";
import { useEffect, useState } from "react";
import { Delete16Regular } from "@fluentui/react-icons";
import { THEME_COLORS } from "../config/theme-colors";
import { type SelectRawDataSet } from "../schema";
import { LanguageMap } from "../metadata";
import { useDialogState } from "../hooks/use-dialog-state";
import { useFetchDatasetColumns } from "../hooks/use-fetch-dataset-columns";
import { type PreprocessParameters } from "../@types/job-parameters";
import { useFetchDatasetWithFilePath } from "../hooks/use-fetch-dataset-with-file-name";
import { Dropdown } from "./ui/dropdown";
import { Field } from "./ui/field";
import { DialogImportDataset } from "./dialog-import-dataset";

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
});

interface Value {
  id: PreprocessParameters["data"]["resident_registry"]["id"]; // ひとまずresident_registryの型を使う
  path: PreprocessParameters["data"]["resident_registry"]["path"] | undefined;
  columns?: Record<string, string | undefined>; // 都市計画決定情報データと国勢調査データにカラムがないためoptionalを指定する
}

interface Props {
  value: Value;
  label: string;
  appearance?: "default" | "large";
  onChange: (value: Value) => void;
}

export const FormDataset = ({
  value,
  label,
  appearance,
  onChange,
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

  return (
    <Card>
      <p>{label}</p>
      <div className={styles.fieldContainer}>
        <div
          className={styles.fileSelectorContainer}
          onClick={() => {
            dialogState.setIsOpen(true);
          }}
          role="button"
        >
          <SelectedDataSetView
            filePath={value.path}
            onDelete={() => {
              onChange({
                ...value,
                path: undefined,
                columns: Object.fromEntries(
                  Object.keys(value.columns ?? {}).map((key) => [
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
            appearance === "large" && styles.dropdownContainer,
          )}
        >
          {value.columns
            ? Object.entries(value.columns).map(([key]) => (
                <Field
                  key={key}
                  className={styles.field}
                  label={
                    LanguageMap.NORMALIZATION_PARAMETER_LABEL[
                      key as keyof typeof LanguageMap.NORMALIZATION_PARAMETER_LABEL
                    ] + "カラム"
                  }
                >
                  <Dropdown
                    className={styles.dropdown}
                    disabled={!dataSetColumns || dataSetColumns.length === 0}
                    onOptionSelect={(_, data) => {
                      onChange({
                        ...value,
                        columns: {
                          ...value.columns,
                          [key]: data.optionValue,
                        },
                      });
                    }}
                    selectedOptions={[value.columns?.[key] ?? ""]}
                    value={value.columns?.[key] ?? ""}
                  >
                    {dataSetColumns?.map((column) => (
                      <Option key={column} text={column} value={column}>
                        {column}
                      </Option>
                    ))}
                  </Dropdown>
                </Field>
              ))
            : null}
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
        <div className={styles.roundedLabel}>データを選択</div>
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
