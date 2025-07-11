import {
  Card,
  CardHeader,
  type CardProps,
  makeStyles,
  mergeClasses,
  Subtitle2,
  tokens,
} from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";
import { type SelectResultView } from "../../schema";
import { THEME_COLORS } from "../../config/theme-colors";
import { useDialogState } from "../../hooks/use-dialog-state";
import { DialogExportMessage } from "../dialog-export-message";
import { type View } from "../../bi-modules/interfaces/view";
import { ROUTES } from "../../routes";
import { useWorkbookIdsSearchQuery } from "../../bi-modules/hooks/use-workbook-ids-search-query";
import { useViewContainer } from "../../bi-modules/hooks/use-view-container";
import { ViewStyle } from "./view-style";
import { DownloadDialog } from "./dialog-download";
import { DeleteDialog } from "./dialog-delete";

type Props = {
  resultView: SelectResultView;
  className?: string;
  isPreview?: boolean;
  cardProps?: CardProps;
};

const useStyles = makeStyles({
  selected: {
    border: `2px solid ${THEME_COLORS.primary}`,
  },
  cardSurface: {
    border: `2px solid transparent`,
    transition: "border,background-color 0.2s",
    boxShadow: tokens.shadow16,
    // border分を引いている
    padding: `calc(${tokens.spacingHorizontalXXL} - 2px) calc(${tokens.spacingVerticalXXL} - 2px)`,
    gap: 0,
  },
  cardHeaderActions: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
  },
  title: {
    minHeight: "22px",
  },
  dialogContent: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  dropdown: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    "& > label": {
      fontSize: "12px",
    },
  },
});

/** ビュー内の共通のステートを扱う */
export const ViewContainer = ({
  resultView,
  className,
  isPreview = false,
}: Props): JSX.Element => {
  const styles = useStyles();
  const navigate = useNavigate();

  const { workbookId, viewId } = useWorkbookIdsSearchQuery();
  const selected = String(resultView.id) === viewId;
  const handleClick = (): void => {
    navigate(
      ROUTES.ANALYSIS.WORKBOOK_EDIT({
        id: workbookId || "",
        queryParams: {
          sheetId: resultView.sheet_id,
          viewId: resultView.id,
        },
      }),
    );
  };

  const { handleDelete, handleDownload, isInvalidParameters } =
    useViewContainer({
      resultView,
    });

  const exportMessageDialogState = useDialogState();

  return (
    <Card
      className={mergeClasses(
        styles.cardSurface,
        selected && styles.selected,
        className,
      )}
      onClick={isPreview ? handleClick : undefined}
    >
      <CardHeader
        action={
          <div className={styles.cardHeaderActions}>
            {resultView.data_set_result_id && (
              <DownloadDialog
                onSubmit={(fileType, coordinate) =>
                  handleDownload(fileType, coordinate).then(() => {
                    exportMessageDialogState.setIsOpen(true);
                  })
                }
              />
            )}
            <DeleteDialog onSubmit={handleDelete} />
          </div>
        }
        header={
          <Subtitle2 className={styles.title}>
            {resultView.title ?? ""}
          </Subtitle2>
        }
      />
      {isInvalidParameters ? (
        <div>パラメーターの値を正しく設定してください</div>
      ) : resultView.unit && resultView.data_set_result_id ? (
        <ViewStyle
          isPreview={isPreview}
          view={
            {
              id: resultView.id,
              dataSetResultId: resultView.data_set_result_id,
              style: resultView.style,
              unit: resultView.unit,
              title: resultView.title,
              parameters: resultView.parameters,
            } as View /** @todo parametersの定義が一致していないため仮 */
          }
        />
      ) : (
        <div>データセットが選択されていません</div>
      )}
      <DialogExportMessage dialogState={exportMessageDialogState} />
    </Card>
  );
};
