import { Dialog, DialogTrigger, makeStyles } from "@fluentui/react-components";
import { DialogSurface } from "../ui/dialog-surface";
import { DialogTitle } from "../ui/dialog-title";
import { DialogActions } from "../ui/dialog-actions";
import { DialogBody } from "../ui/dialog-body";
import { DialogContent } from "../ui/dialog-content";
import { Button } from "../ui/button";

const useStyles = makeStyles({
  menuItemButton: {
    justifyContent: "flex-start",
    padding: 0,
    fontWeight: "normal",
  },
});

interface Props {
  onDelete: () => void;
}

export function DeleteRowDialog({ onDelete }: Props): JSX.Element {
  const styles = useStyles();
  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement>
        <Button
          appearance="transparent"
          className={styles.menuItemButton}
          onClick={(e) => e.stopPropagation()}
        >
          削除
        </Button>
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>このデータを削除しますか？</DialogTitle>
          <DialogContent>
            削除したデータを復元することはできません
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={onDelete} size="medium">
              削除
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
