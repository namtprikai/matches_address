import {
  Card,
  Label,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import { Fragment, useEffect, useState } from "react";
import { type FieldValues, type Path } from "react-hook-form";
import { Delete16Regular } from "@fluentui/react-icons";
import { useDatasetImporter } from "../hooks/use-dataset-importer";
import { THEME_COLORS } from "../config/theme-colors";
import { type SelectRawDataSet } from "../schema";
import { LanguageMap } from "../metadata";
import { Dropdown } from "./ui/dropdown";
import { Field } from "./ui/field";

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
  columnDropdownContainer: {
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
  FORM_TYPE extends FieldValues,
  COLUMN_TYPE extends object,
>(props: {
  value: {
    columns?: COLUMN_TYPE;
    filePath?: string;
  };
  name: Path<FORM_TYPE>;
  dataSetName: string;
  appearance?: "default" | "large";
  onChange?: (value: typeof props.value) => void;
}): JSX.Element => {
  const [value] = useState<typeof props.value>(props.value);
  const [dataSet, setDataSet] = useState<SelectRawDataSet | null>(null);

  const appearance = props.appearance || "default";

  useEffect(() => {
    props.onChange?.(value);
  }, [value, props]);

  const { Dialog: DataSetImportDialog, setOpen } = useDatasetImporter({
    onSelected: (data) => {
      setDataSet(data);
    },
  });

  // {}で囲んでif処理を書くのが可読性低いので別関数化
  const SelectorView = (): JSX.Element => {
    if (dataSet) {
      return (
        <SelectedDataSetView
          dataSet={dataSet}
          onDelete={() => {
            setDataSet(null);
          }}
        />
      );
    } else {
      return <DataSetImportSymbol />;
    }
  };

  const styles = useStyles();
  const columns = value.columns ? Object.entries(value.columns) : [];
  const columnsToDropDowns = columns.map(([key]) => {
    return (
      <Field
        key={key}
        className={styles.field}
        label={
          LanguageMap.NORMALIZATION_PARAMETER_LABEL[
            key as keyof typeof LanguageMap.NORMALIZATION_PARAMETER_LABEL
          ] + "カラム"
        }
      >
        <Dropdown className={styles.dropdown}>
          <option value="test">Test</option>
        </Dropdown>
      </Field>
    );
  });

  return (
    <Card>
      <p>{props.dataSetName}</p>
      <div className={styles.fieldContainer}>
        <div
          className={styles.fileSelectorContainer}
          onClick={() => {
            setOpen(true);
          }}
          role="button"
        >
          <SelectorView />
        </div>
        <div
          className={mergeClasses(
            appearance === "large" && styles.columnDropdownContainer,
          )}
        >
          {columnsToDropDowns}
        </div>
      </div>
      <DataSetImportDialog />
    </Card>
  );
};
