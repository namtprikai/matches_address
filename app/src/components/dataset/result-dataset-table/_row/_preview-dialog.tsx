import {
  Caption1,
  Dialog,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftRegular } from "@fluentui/react-icons";
import { useDialogState } from "../../../../hooks/use-dialog-state";
import { usePagination } from "../../../../hooks/use-pagination";
import { Pagination } from "../../../ui/pagination";
import { DataPreviewTable } from "../../data-preview-table";
import {
  useFetchResultDataSetsWithPagination,
  type ResultDataSetsResponse,
} from "../../../../hooks/use-fetch-result-data-sets-with-pagination";
import { ResultDataSetMetadata } from "../../result-dataset-metadata";
import { ROUTES } from "../../../../routes";
import { usePreviewSearchQuery } from "../../../../hooks/use-preview-search-query";
import { Button } from "../../../ui/button";
import { DialogSurface } from "../../../ui/dialog-surface";
import { DialogTitle } from "../../../ui/dialog-title";
import { DialogBody } from "../../../ui/dialog-body";
import { DialogContent } from "../../../ui/dialog-content";

const useStyles = makeStyles({
  dataPreviewTableContainer: {
    marginTop: tokens.spacingVerticalS,
    minHeight: "80vh",
  },
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
  label: {
    display: "inline-flex",
    alignItems: "center",
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase100,
    borderRadius: tokens.borderRadiusSmall,
    color: "#616161",
  },
});

type Props = {
  title: string;
};

export const PreviewDialog = ({ title }: Props): JSX.Element => {
  const styles = useStyles();
  const dialogState = useDialogState(false);
  const pagination = usePagination(50);

  const navigate = useNavigate();
  const { previewId, previewType } = usePreviewSearchQuery();

  const { data } = useFetchResultDataSetsWithPagination({
    dataSetResultId: previewId ? Number(previewId) : null,
    type: previewType || "building",
    page: pagination.page,
    limitPerPage: pagination.limitPerPage,
  });

  useEffect(() => {
    if (previewId && previewType) {
      dialogState.setIsOpen(true);
    }
  }, [dialogState, previewId, previewType]);

  const { isOpen, setIsOpen } = dialogState;

  return (
    <Dialog
      onOpenChange={(e) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
        if (isOpen) {
          navigate(
            ROUTES.DATASET({
              queryParams: {
                tab: "result",
              },
            }),
          );
        }
      }}
      open={isOpen}
    >
      <DialogSurface onClick={(e) => e.stopPropagation()}>
        <DialogTitle className={styles.dialogTitle}>
          <div className={styles.actions}>
            <Button
              appearance="transparent"
              icon={<ArrowLeftRegular />}
              onClick={() => {
                setIsOpen(false);
                navigate(
                  ROUTES.DATASET({
                    queryParams: {
                      tab: "result",
                    },
                  }),
                );
              }}
            />
            {title}
            <span className={styles.label}>
              ({previewType === "building" ? "建物単位" : "地域単位"})
            </span>
          </div>
        </DialogTitle>
        <DialogBody>
          <DialogContent className={styles.content}>
            <div>
              <Pagination {...pagination} />
              <div className={styles.dataPreviewTableContainer}>
                {data?.length === 0 ? (
                  <Caption1>データがありません</Caption1>
                ) : (
                  <DataPreviewTable data={parseResultDataSets(data)} />
                )}
              </div>
            </div>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

/**
 * 推定結果データのカラム名を日本語名に変換したり値に単位を付与したりする。
 * @param {any} data:ResultDataSetsResponse
 * @returns {any}
 */
function parseResultDataSets(
  data: ResultDataSetsResponse,
): ResultDataSetsResponse {
  if (!data) return data;

  const parsedData = data.map((row) => {
    const newRow: NonNullable<ResultDataSetsResponse>[number] = {};

    for (const enKey in row) {
      const value = row[enKey];
      type MetadataKey = keyof typeof ResultDataSetMetadata;
      const { label: jpKey, unit } =
        ResultDataSetMetadata[enKey as MetadataKey];

      if (unit === "%") {
        if (typeof value === "string" || value === null) {
          newRow[jpKey] = value;
          continue;
        }
        if (value === 0) {
          newRow[jpKey] = "0%";
          continue;
        }
        if (value !== 0 && value < 1) {
          newRow[jpKey] = `${(value * 100).toFixed(0)}${unit}`;
          continue;
        }
        if (value >= 1) {
          newRow[jpKey] = `${value.toFixed(0)}${unit}`;
          continue;
        }
      }
      newRow[jpKey] = unit ? `${value}${unit}` : value;
    }

    return newRow;
  });

  return parsedData;
}
