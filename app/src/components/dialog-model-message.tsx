import { Dialog, Body1 } from "@fluentui/react-components";
import { type ReturnUseDialogState } from "../hooks/use-dialog-state";
import { Button } from "./ui/button";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogBody } from "./ui/dialog-body";
import { DialogTitle } from "./ui/dialog-title";
import { DialogContent } from "./ui/dialog-content";
import { DialogActions } from "./ui/dialog-actions";

type Props = {
  dialogState: ReturnUseDialogState;
};

export const DialogModelMessage = ({ dialogState }: Props): JSX.Element => {
  const { isOpen: isDialogOpen, setIsOpen: setIsDialogOpen } = dialogState;

  return (
    <Dialog
      onOpenChange={(_, { open }) => setIsDialogOpen(open)}
      open={isDialogOpen}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>モデル作成処理を開始しました</DialogTitle>
          <DialogContent>
            <Body1>前処理が完了するまで一定の時間がかかります</Body1>
          </DialogContent>
          <DialogActions>
            <a href="/model">
              <Button appearance="primary">処理のステータスを確認する</Button>
            </a>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
