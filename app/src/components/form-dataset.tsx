import {
  Card,
  makeStyles,
  mergeClasses,
  Option,
  tokens,
} from "@fluentui/react-components";
import { useEffect, useState } from "react";
import { type FieldValues, type Path } from "react-hook-form";
import { Delete16Regular } from "@fluentui/react-icons";
import { THEME_COLORS } from "../config/theme-colors";
import { type SelectRawDataSet } from "../schema";
import { LanguageMap } from "../metadata";
import { useDialogState } from "../hooks/use-dialog-state";
import { useFetchDatasetColumns } from "../hooks/use-fetch-dataset-columns";
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

export const FormDataset = <
  COLUMN_TYPE extends Partial<Record<string, string>>,
>({
  value: prevValue,
  dataSetName,
  appearance,
  onChange,
}: {
  value: {
    columns?: COLUMN_TYPE;
    path?: string;
  };
  dataSetName: string;
  appearance?: "default" | "large";
  onChange?: (data: typeof prevValue) => void;
}): JSX.Element => {
  const styles = useStyles();
  const [dataSet, setDataSet] = useState<SelectRawDataSet | undefined>(
    undefined,
  );
  const dialogState = useDialogState();
  const { data: dataSetColumns } = useFetchDatasetColumns({
    filename: dataSet?.file_path,
  });
  const { setIsOpen } = dialogState;

  useEffect(() => {
    if (onChange && dataSetColumns) {
      const columnKV = prevValue.columns
        ? Object.entries(prevValue.columns)
        : [];

      if (columnKV.length === 0) {
        return;
      }

      const newColumns = columnKV.reduce((acc, [key]) => {
        return {
          ...acc,
          [key]: dataSetColumns[0],
        };
      }, {});

      onChange({
        path: prevValue.path,
        // reduceでは厳密な型推論ができないためasで型を指定
        columns: newColumns as COLUMN_TYPE,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- prevValueが含まれるとcolumnsの更新を行い、無限ループになるため
  }, [dataSetColumns]);

  return (
    <Card>
      <p>{dataSetName}</p>
      <div className={styles.fieldContainer}>
        <div
          className={styles.fileSelectorContainer}
          onClick={() => {
            setIsOpen(true);
          }}
          role="button"
        >
          {dataSet ? (
            <SelectedDataSetView
              dataSet={dataSet}
              onDelete={() => {
                setDataSet(undefined);
                if (onChange) {
                  onChange({
                    ...prevValue,
                    path: undefined,
                  });
                }
              }}
            />
          ) : (
            <DataSetImportSymbol />
          )}
        </div>
        <div
          // FormDatasetが横長の場合のスタイルだしわけ
          className={mergeClasses(
            appearance === "large" && styles.dropdownContainer,
          )}
        >
          {prevValue.columns
            ? Object.entries(prevValue.columns).map(([key]) => (
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
                      if (!onChange) return;
                      onChange({
                        ...prevValue,
                        columns: {
                          ...prevValue.columns,
                          [key]: data.optionValue,
                        } as COLUMN_TYPE,
                      });
                    }}
                    selectedOptions={[prevValue.columns?.[key] ?? ""]}
                    value={prevValue.columns?.[key] ?? ""}
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
          setDataSet(data);
          if (!onChange) return;
          onChange({
            ...prevValue,
            path: data?.file_path,
          });
        }}
      />
    </Card>
  );
};

/**
 * データセットインポートのアイコンや文字部分をスタイリングするためにスタイルを別定義
 */
const useDataSetImporterSymbolStyle = makeStyles({
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
    gap: `${tokens.spacingVerticalS} 0`,
  },
});

/**
 * データセットインポートのアイコンや文字部分だけのコンポーネント
 */
const DataSetImportSymbol = (): JSX.Element => {
  const styles = useDataSetImporterSymbolStyle();

  return (
    <div className={styles.root}>
      <img alt="upload file" src="/file-upload-icon.svg" />
      <div className={styles.roundedLabel}>データを選択</div>
    </div>
  );
};

/**
 * 選択されたデータセットの表示部分用のスタイル
 */
const selectedDataSetViewStyles = makeStyles({
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
    background: "none",
    outline: "none",
    border: "none",
    display: "flex",
    alignItems: "center",
    flexGrow: 1,
    gap: tokens.spacingHorizontalXS,
    position: "absolute",
    bottom: "0",
    left: "50%",
    transform: "translateX(-50%)",
  },
  selectedDataSetFilePath: {
    color: THEME_COLORS.primary,
    textDecoration: "underline",
    textAlign: "center",
  },
});

/**
 * 選択されたデータセットの表示部分
 */
const SelectedDataSetView = ({
  dataSet,
  onDelete,
}: {
  dataSet: SelectRawDataSet;
  onDelete: () => void;
}): JSX.Element => {
  const styles = selectedDataSetViewStyles();

  return (
    <div className={styles.root}>
      <p className={styles.selectedDataSetFilePath}>{dataSet.file_path}</p>
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
