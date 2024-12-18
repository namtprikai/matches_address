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

export const DialogExportMessage = ({ dialogState }: Props): JSX.Element => {
  const { isOpen: isDialogOpen, setIsOpen: setIsDialogOpen } = dialogState;

  return (
    <Dialog
      onOpenChange={(_, { open }) => setIsDialogOpen(open)}
      open={isDialogOpen}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle>ダウンロード処理を開始しました</DialogTitle>
          <DialogContent>
            <Body1>
              処理が完了すると「非同期処理一覧画面」からファイルがダウンロードできます
            </Body1>
          </DialogContent>
          <DialogActions>
            <a href="#job">
              <Button appearance="primary">非同期処理一覧画面へ</Button>
            </a>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
