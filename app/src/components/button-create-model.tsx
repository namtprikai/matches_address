import { AddFilled } from "@fluentui/react-icons";
import {
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  tokens,
} from "@fluentui/react-components";
import { Button } from "./ui/button";

export const ButtonCreateModel = (): JSX.Element => {
  return (
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
          <MenuItem>正規化処理から始める</MenuItem>
          <MenuItem>正規化処理済データから始める</MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  );
};
