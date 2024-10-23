import { AddFilled } from "@fluentui/react-icons";
import {
  makeStyles,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  tokens,
} from "@fluentui/react-components";
import { Link } from "react-router-dom";
import { useDialogState } from "../hooks/use-dialog-state";
import { Button } from "./ui/button";
import { DialogImportDataset } from "./dialog-import-dataset";

const useStyles = makeStyles({
  navigationToNormalization: {
    textDecoration: "none",
    color: "inherit",
    display: "block",
  },
});

export const ButtonCreateModel = (): JSX.Element => {
  const styles = useStyles();

  const dialogState = useDialogState(false);

  return (
    <>
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Button
            icon={
              <AddFilled
                color={tokens.colorNeutralForeground1}
                fontSize={tokens.fontSizeBase400}
                strokeWidth={2}
              />
            }
            size="small"
          >
            新規モデル作成
          </Button>
        </MenuTrigger>

        <MenuPopover>
          <MenuList>
            <MenuItem>
              <Link
                className={styles.navigationToNormalization}
                to={"/normalization"}
              >
                正規化処理から始める
              </Link>
            </MenuItem>
            <MenuItem>
              <Link
                className={styles.navigationToNormalization}
                to={"/model/create"}
              >
                正規化処理済データから始める
              </Link>
            </MenuItem>
          </MenuList>
        </MenuPopover>
      </Menu>

      <DialogImportDataset dialogState={dialogState} />
    </>
  );
};
