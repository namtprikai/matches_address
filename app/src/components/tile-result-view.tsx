import { ArchiveRegular, Dismiss24Regular } from "@fluentui/react-icons";
import {
  Card,
  CardHeader,
  type CardProps,
  Dialog,
  DialogContent,
  DialogTrigger,
  makeStyles,
  mergeClasses,
  Subtitle2,
  tokens,
} from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";
import { type SelectResultView, type SelectDataSetResult } from "../schema";
import { THEME_COLORS } from "../config/theme-colors";
import { TileViewStyle } from "./tile-view-style";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogBody } from "./ui/dialog-body";
import { DialogTitle } from "./ui/dialog-title";
import { DialogActions } from "./ui/dialog-actions";
import { Button } from "./ui/button";

type Props = CardProps & {
  resultView: SelectResultView;
  dataSetResult: SelectDataSetResult | null;
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
    gap: tokens.spacingVerticalXL,
  },
  cardHeaderSubtle: {
    padding: `${tokens.spacingHorizontalXXS} ${tokens.spacingVerticalXXS}`,
    border: "none",
    minWidth: "24px",
    minHeight: "24px",
  },
});

export const TileResultView = ({
  resultView,
  dataSetResult,
  selected,
  ...cardProps
}: Props): JSX.Element => {
  const styles = useStyles();
  const navigate = useNavigate();

  const deleteResultView = async (): Promise<void> => {
    await window.ipcRenderer.invoke("deleteResultView", {
      resultViewId: resultView.id,
    });
  };

  const handleDelete = async (): Promise<void> => {
    await deleteResultView();
    navigate(0);
  };

  if (
    !resultView.style ||
    !resultView.unit ||
    (resultView.style !== "map" && !resultView.parameters)
  ) {
    return (
      <Card
        {...cardProps}
        className={mergeClasses(
          styles.cardSurface,
          selected && styles.selected,
        )}
      >
        <CardHeader
          action={
            <Dialog>
              <DialogTrigger disableButtonEnhancement>
                <Button
                  appearance="subtle"
                  className={styles.cardHeaderSubtle}
                  icon={<ArchiveRegular />}
                />
              </DialogTrigger>
              <DialogSurface>
                <DialogBody>
                  <DialogTitle
                    action={
                      <DialogTrigger action="close">
                        <Button
                          appearance="subtle"
                          aria-label="close"
                          icon={
                            <Dismiss24Regular
                              color={tokens.colorNeutralForeground1}
                              strokeWidth={2}
                            />
                          }
                        />
                      </DialogTrigger>
                    }
                  >
                    タイルを削除しますか？
                  </DialogTitle>
                  <DialogContent>
                    削除したタイルはもとに戻せません
                  </DialogContent>
                  <DialogActions position="start">
                    <Button>キャンセル</Button>
                  </DialogActions>
                  <DialogActions position="end">
                    <Button appearance="primary" onClick={handleDelete}>
                      削除
                    </Button>
                  </DialogActions>
                </DialogBody>
              </DialogSurface>
            </Dialog>
          }
          header={
            <Subtitle2>{`${resultView.title || "タイトル未入力"}`}</Subtitle2>
          }
        />
        <div>パラメーターの値を正しく設定してください</div>
      </Card>
    );
  }

  return (
    <Card
      {...cardProps}
      className={mergeClasses(styles.cardSurface, selected && styles.selected)}
    >
      <CardHeader
        action={
          <Dialog>
            <DialogTrigger disableButtonEnhancement>
              <Button
                appearance="subtle"
                className={styles.cardHeaderSubtle}
                icon={<ArchiveRegular />}
              />
            </DialogTrigger>
            <DialogSurface>
              <DialogBody>
                <DialogTitle
                  action={
                    <DialogTrigger action="close">
                      <Button
                        appearance="subtle"
                        aria-label="close"
                        icon={
                          <Dismiss24Regular
                            color={tokens.colorNeutralForeground1}
                            strokeWidth={2}
                          />
                        }
                      />
                    </DialogTrigger>
                  }
                >
                  タイルを削除しますか？
                </DialogTitle>
                <DialogContent>削除したタイルはもとに戻せません</DialogContent>
                <DialogActions position="start">
                  <Button>キャンセル</Button>
                </DialogActions>
                <DialogActions position="end">
                  <Button appearance="primary" onClick={handleDelete}>
                    削除
                  </Button>
                </DialogActions>
              </DialogBody>
            </DialogSurface>
          </Dialog>
        }
        header={
          <Subtitle2>{`${resultView.title || "タイトル未入力"}`}</Subtitle2>
        }
      />
      {dataSetResult === null ? (
        <div>データセットが選択されていません</div>
      ) : (
        <TileViewStyle
          parameters={resultView.parameters}
          resultId={dataSetResult.id}
          style={resultView.style}
          type={resultView.unit}
        />
      )}
    </Card>
  );
};
