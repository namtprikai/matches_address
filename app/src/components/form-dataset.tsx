import { Card, makeStyles, tokens } from "@fluentui/react-components";
import { useEffect, useState } from "react";
import { type FieldValues, type Path } from "react-hook-form";
import { Delete16Regular } from "@fluentui/react-icons";
import { useDatasetImporter } from "../hooks/use-dataset-importer";
import { THEME_COLORS } from "../config/theme-colors";
import { type SelectRawDataSet } from "../schema";

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
});

export const FormDataset = <
  FORM_TYPE extends FieldValues,
  COLUMN_TYPE extends object,
>(props: {
  value: {
    columns: COLUMN_TYPE;
    path: string;
  };
  name: Path<FORM_TYPE>;
  dataSetName: string;
  onChange?: (value: typeof props.value) => void;
}): JSX.Element => {
  const [value, setValue] = useState<typeof props.value>(props.value);
  const [dataSet, setDataSet] = useState<SelectRawDataSet | null>(null);

  useEffect(() => {
    props.onChange?.(value);
  }, [value, props]);

  const { Dialog, open, setOpen } = useDatasetImporter({
    onSelected: (data) => {
      setDataSet(data);
    },
  });

  const SelectorView = () => {
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

  return (
    <Card>
      <div
        className={styles.fileSelectorContainer}
        onClick={() => {
          setOpen(true);
        }}
        role="button"
      >
        <SelectorView />
      </div>
      <Dialog />
    </Card>
  );
};
