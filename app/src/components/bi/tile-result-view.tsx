import { ArchiveRegular, Dismiss24Regular } from "@fluentui/react-icons";
import {
  Card,
  CardHeader,
  type CardProps,
  Dialog,
  DialogTrigger,
  makeStyles,
  mergeClasses,
  Subtitle2,
  tokens,
} from "@fluentui/react-components";
import { useAtom } from "jotai";
import { type SelectResultView } from "../../schema";
import { THEME_COLORS } from "../../config/theme-colors";
import { useFetchResultViews } from "../../hooks/use-fetch-result-views";
import { selectedResultViewIdAtom } from "../../state/selected-result-view-id-atom";
import { DialogSurface } from "../ui/dialog-surface";
import { DialogBody } from "../ui/dialog-body";
import { DialogTitle } from "../ui/dialog-title";
import { DialogActions } from "../ui/dialog-actions";
import { Button } from "../ui/button";
import { DialogContent } from "../ui/dialog-content";
import { TileViewStyle } from "./tile-view-style";

type Props = {
  resultView: SelectResultView;
  className?: string;
  focusable?: boolean;
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
    gap: tokens.spacingVerticalXL,
  },
  cardHeaderSubtle: {
    padding: `${tokens.spacingHorizontalXXS} ${tokens.spacingVerticalXXS}`,
    border: "none",
    minWidth: "24px",
    minHeight: "24px",
  },
  title: {
    minHeight: "22px",
  },
});

export const TileResultView = ({
  resultView,
  className,
  focusable,
}: Props): JSX.Element => {
  const styles = useStyles();
  const [selectedResultViewId, setSelectedResultViewId] = useAtom(
    selectedResultViewIdAtom,
  );

  const { data: resultViews, mutate } = useFetchResultViews({
    sheetId: resultView.sheet_id,
  });

  const handleClick = (): void => {
    setSelectedResultViewId(resultView.id);
  };

  const handleDelete = async (): Promise<void> => {
    if (!resultView.sheet_id) return;
    await window.ipcRenderer.invoke("deleteResultView", {
      resultViewId: resultView.id,
      sheetId: resultView.sheet_id,
    });
    void mutate();
    const firstView = resultViews?.find((view) => view.layoutIndex === 1);
    if (firstView) {
      setSelectedResultViewId(firstView.id);
    }
  };

  const selected = resultView.id === selectedResultViewId;

  if (
    !resultView.style ||
    !resultView.unit ||
    (resultView.style !== "map" && !resultView.parameters)
  ) {
    return (
      <Card
        className={mergeClasses(
          styles.cardSurface,
          selected && styles.selected,
          className,
        )}
        onClick={focusable ? handleClick : undefined}
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
            <Subtitle2 className={styles.title}>
              {resultView.title ?? ""}
            </Subtitle2>
          }
        />
        <div>パラメーターの値を正しく設定してください</div>
      </Card>
    );
  }

  return (
    <Card
      className={mergeClasses(
        styles.cardSurface,
        selected && styles.selected,
        className,
      )}
      onClick={focusable ? handleClick : undefined}
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
          <Subtitle2 className={styles.title}>
            {resultView.title ?? ""}
          </Subtitle2>
        }
      />
      {resultView.data_set_result_id ? (
        <TileViewStyle
          parameters={resultView.parameters}
          resultId={resultView.data_set_result_id}
          style={resultView.style}
          type={resultView.unit}
        />
      ) : (
        <div>データセットが選択されていません</div>
      )}
    </Card>
  );
};
