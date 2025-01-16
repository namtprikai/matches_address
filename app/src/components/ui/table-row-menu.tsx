import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  Button,
} from "@fluentui/react-components";
import { MoreVerticalRegular } from "@fluentui/react-icons";
import { DialogDeleteJob } from "../dialog-delete-job";
import { useDialogState } from "../../hooks/use-dialog-state";
import { type SelectJob } from "../../schema";
import {
  type JobType,
  TYPE_DISPLAY_MAP,
} from "../../config/job-type-display-map";

export function TableRowMenu({
  item,
  onDelete,
}: {
  item: SelectJob;
  onDelete?: () => void;
}): JSX.Element {
  const deleteDialogState = useDialogState(false);
  const itemName =
    item.type && TYPE_DISPLAY_MAP[item.type as JobType]
      ? TYPE_DISPLAY_MAP[item.type as JobType]
      : "不明";

  const handleConfirmDelete = async (): Promise<void> => {
    if (!onDelete) return;
    try {
      await onDelete();
    } finally {
      deleteDialogState.setIsOpen(false);
    }
  };

  return (
    <>
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Button
            appearance="subtle"
            aria-label="詳細メニュー"
            icon={<MoreVerticalRegular />}
            onClick={(e) => e.stopPropagation()}
          />
        </MenuTrigger>
        <MenuPopover onClick={(e) => e.stopPropagation()}>
          <MenuList>
            <MenuItem
              disabled={item.status !== "complete" || item.is_named}
              onClick={() => {
                deleteDialogState.setIsOpen(true);
              }}
            >
              削除
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>
      <DialogDeleteJob
        dialogState={deleteDialogState}
        fileName={itemName}
        onDelete={handleConfirmDelete}
      />
    </>
  );
}
