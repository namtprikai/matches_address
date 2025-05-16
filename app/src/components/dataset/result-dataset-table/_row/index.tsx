import {
  TableRow,
  TableCell,
  makeStyles,
  tokens,
  TableSelectionCell,
} from "@fluentui/react-components";
import { type MouseEvent } from "react";
import { type SelectDataSetResult } from "../../../../schema";
import { formatDate } from "../../../../utils/format-date";
import { useDialogState } from "../../../../hooks/use-dialog-state";
import { useFetchReferenceDates } from "../../../../hooks/use-fetch-reference-dates";

import { DialogExportMessage } from "../../../dialog-export-message";
import { DownloadDialog } from "./_download-dialog";
import { SelectUnitDialog } from "./_select-unit-dialog";
import { RowMenu } from "./_menu";

const useStyles = makeStyles({
  cellActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: tokens.spacingHorizontalM,
  },
  dataPreviewTableContainer: {
    marginTop: tokens.spacingVerticalS,
  },
});

interface RowProps {
  item: SelectDataSetResult;
  selected: boolean;
  appearance: "brand" | "none";
  onClick: (e: MouseEvent) => void;
  onDelete: () => void;
  onPreviewSelect: () => void;
}

export function Row({
  item,
  selected,
  appearance,
  onClick,
  onDelete,
  onPreviewSelect,
}: RowProps): JSX.Element {
  const styles = useStyles();
  const exportDialogState = useDialogState(false);

  const { data: referenceDates, isLoading: isLoadingReferenceDates } =
    useFetchReferenceDates({ dataSetResultId: item.id });

  return (
    <>
      <TableRow
        key={item.id}
        appearance={appearance}
        aria-selected={selected}
        onClick={onClick}
      >
        <TableSelectionCell
          checkboxIndicator={{ "aria-label": "Select row" }}
          checked={selected}
        />
        <TableCell>
          <SelectUnitDialog
            dataSetResultId={item.id}
            datasetName={item.title}
            onPreviewSelect={onPreviewSelect}
          />
        </TableCell>
        <TableCell>{formatDate(item.updated_at, "YYYY/MM/DD")}</TableCell>
        <TableCell className={styles.cellActions}>
          {isLoadingReferenceDates ? null : (
            <DownloadDialog
              dataSetResultId={item.id}
              onSubmit={() => exportDialogState.setIsOpen(true)}
              referenceDates={referenceDates || []}
            />
          )}
          <DialogExportMessage dialogState={exportDialogState} />
          <RowMenu item={item} onDelete={onDelete} />
        </TableCell>
      </TableRow>
    </>
  );
}
