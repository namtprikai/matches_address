import { DeleteRegular, Dismiss24Regular } from "@fluentui/react-icons";
import {
  Dialog,
  DialogTrigger,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { DialogSurface } from "../ui/dialog-surface";
import { DialogBody } from "../ui/dialog-body";
import { DialogTitle } from "../ui/dialog-title";
import { DialogActions } from "../ui/dialog-actions";
import { Button } from "../ui/button";
import { DialogContent } from "../ui/dialog-content";

const useStyles = makeStyles({
  cardHeaderSubtle: {
    padding: `${tokens.spacingHorizontalXXS} ${tokens.spacingVerticalXXS}`,
    border: "none",
    minWidth: "24px",
    minHeight: "24px",
  },
});

export function DeleteDialog({
  onSubmit,
}: {
  onSubmit: () => void;
}): JSX.Element {
  const styles = useStyles();

  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          className={styles.cardHeaderSubtle}
          icon={<DeleteRegular />}
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
            ビューを削除しますか？
          </DialogTitle>
          <DialogContent>削除したビューはもとに戻せません</DialogContent>
          <DialogActions position="start">
            <Button>キャンセル</Button>
          </DialogActions>
          <DialogActions position="end">
            <Button appearance="primary" onClick={onSubmit}>
              削除
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
