import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHeaderCell,
  Dialog,
  DialogTrigger,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  ArrowLeftRegular,
  ArrowDownloadRegular,
  DeleteRegular,
} from "@fluentui/react-icons";
import { DialogSurface } from "../ui/dialog-surface";
import { DialogBody } from "../ui/dialog-body";
import { DialogTitle } from "../ui/dialog-title";
import { DialogContent } from "../ui/dialog-content";
import { Button } from "../ui/button";
import {
  useFetchDataSetFile,
  type DataSetType,
} from "../../hooks/use-fetch-data-set-file";
import { downloadDataSetFile } from "../../utils/download-data-set-file";

const useStyles = makeStyles({
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
  },
  content: {
    paddingBottom: tokens.spacingVerticalXXL,
  },
  datasetButton: {
    padding: 0,
    justifyContent: "flex-start",
    color: tokens.colorBrandForeground1,
    textDecoration: "underline",
    "&:hover": {
      textDecoration: "none",
    },
  },
  iconButton: {
    border: ` 1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    "&:hover, &:active, &:focus, &:focus-within": {
      border: `1px solid #BDBDBD`,
    },
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    tableLayout: "auto",
  },
  th: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
  td: {
    minWidth: "153px",
  },
});

interface Props {
  type: DataSetType;
  id: number;
  datasetName: string | null;
}

export function DataPreviewDialog({
  type,
  id,
  datasetName,
}: Props): JSX.Element {
  const styles = useStyles();
  const [open, setOpen] = useState(false);

  const handleDownload = async (): Promise<void> => {
    switch (type) {
      case "raw": {
        const data = await window.ipcRenderer.invoke("selectRawDataset", {
          id,
        });
        if (!data) return;
        const buffer = await window.ipcRenderer.invoke("readDatasetFile", {
          fileName: data.file_path,
        });
        void downloadDataSetFile(buffer, data.file_name);
        break;
      }
      case "normalized": {
        const data = await window.ipcRenderer.invoke(
          "selectNormalizedDataSet",
          {
            id,
          },
        );
        if (!data) return;
        const buffer = await window.ipcRenderer.invoke("readDatasetFile", {
          fileName: data.file_path,
        });
        void downloadDataSetFile(buffer, data.file_name || "");
        break;
      }
      case "result": {
        // TODO: 建物or地域のどちらのデータをダウンロードするか選択するダイアログを表示する
        break;
      }
      default: {
        const exhaustiveCheck: never = type;
        throw new Error(`Unhandled type: ${exhaustiveCheck}`);
      }
    }
  };

  const handleDelete = (): void => {
    // TODO: 削除の処理を実装する
  };

  return (
    <Dialog
      onOpenChange={(e) => {
        e.stopPropagation();
        setOpen((prev) => !prev);
      }}
      open={open}
    >
      <DialogTrigger disableButtonEnhancement>
        <Button
          appearance="transparent"
          className={styles.datasetButton}
          onClick={(e) => e.stopPropagation()}
        >
          {datasetName}
        </Button>
      </DialogTrigger>
      <DialogSurface onClick={(e) => e.stopPropagation()}>
        <DialogTitle className={styles.dialogTitle}>
          <div className={styles.actions}>
            <Button
              appearance="transparent"
              icon={<ArrowLeftRegular />}
              onClick={() => setOpen(false)}
            />
            {datasetName}
          </div>
          <div className={styles.actions}>
            <Button
              appearance="outline"
              className={styles.iconButton}
              icon={<ArrowDownloadRegular />}
              onClick={handleDownload}
            />
            <Button
              appearance="outline"
              className={styles.iconButton}
              icon={<DeleteRegular />}
              onClick={handleDelete}
            />
          </div>
        </DialogTitle>
        <DialogBody>
          <DialogContent className={styles.content}>
            <DataPreview id={id} type={type} />
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

interface DataPreviewProps {
  type: DataSetType;
  id: number;
}

function DataPreview({ type, id }: DataPreviewProps): JSX.Element {
  const styles = useStyles();
  const { data } = useFetchDataSetFile({ type, id });
  const headers = data && data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className={styles.tableContainer}>
      <Table aria-label="CSV Data Table" className={styles.table}>
        <TableHeader className={styles.th}>
          <TableRow>
            {headers.map((header) => (
              <TableHeaderCell key={header}>{header}</TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {headers.map((header) => (
                <TableCell key={`${rowIndex}-${header}`} className={styles.td}>
                  {row[header]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
