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
  button: {
    border: `1px solid #E0E0E0`,
    borderRadius: "4px",
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
  td: {
    minWidth: "153px",
  },
});

type CSVRow = Record<string, string>;

export function DataPreviewDialog(): JSX.Element {
  const styles = useStyles();
  const [open, setOpen] = useState(false);

  const handleDownload = (): void => {
    // TODO: ダウンロードの処理を実装する
  };

  const handleDelete = (): void => {
    // TODO: 削除の処理を実装する
  };

  return (
    <Dialog
      onOpenChange={() => {
        setOpen((prev) => !prev);
      }}
      open={open}
    >
      <DialogTrigger disableButtonEnhancement>
        <Button>Open DataPreviewDialog</Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogTitle className={styles.dialogTitle}>
          <div className={styles.actions}>
            <Button
              appearance="transparent"
              icon={<ArrowLeftRegular />}
              onClick={() => setOpen(false)}
            />
            水道使用量.csv
          </div>
          <div className={styles.actions}>
            <Button
              appearance="outline"
              className={styles.button}
              icon={<ArrowDownloadRegular />}
              onClick={handleDownload}
            />
            <Button
              appearance="outline"
              className={styles.button}
              icon={<DeleteRegular />}
              onClick={handleDelete}
            />
          </div>
        </DialogTitle>
        <DialogBody>
          <DialogContent>
            <DataPreview />
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

export function DataPreview(): JSX.Element {
  const styles = useStyles();
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  useEffect(() => {
    const fetchCSV = async (): Promise<void> => {
      const response = await fetch("/dummy-data.csv");
      const csvText = await response.text();
      const rows = csvText.split("\n").map((row) => row.split(","));
      const headers = rows[0].map((header) => header.trim());
      setHeaders(headers);

      const data: CSVRow[] = rows
        .slice(1)
        .map((row) => {
          return headers.reduce((obj, header, index) => {
            obj[header] = row[index]?.trim() ?? "";
            return obj;
          }, {} as CSVRow);
        })
        .filter((row) => Object.values(row).some((value) => value !== ""));
      setCsvData(data);
    };

    void fetchCSV();
  }, []);

  return (
    <div className={styles.tableContainer}>
      <Table aria-label="CSV Data Table" className={styles.table}>
        <TableHeader>
          <TableRow>
            {headers.map((header) => (
              <TableHeaderCell key={header}>{header}</TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {csvData.map((row, rowIndex) => (
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
