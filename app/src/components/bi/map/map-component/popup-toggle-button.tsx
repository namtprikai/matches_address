import { Button } from "@fluentui/react-components";
import styles from "./popup-shared.module.css";
import { POPUP_ELEMENT_IDS } from "./_const/popup-constants";

interface PopupToggleButtonProps {
  buttonText: string;
}

export const PopupToggleButton = ({
  buttonText,
}: PopupToggleButtonProps): JSX.Element => {
  return (
    <div className={styles.toggleButtonContainer}>
      <Button
        appearance="subtle"
        className={styles.toggleButton}
        id={POPUP_ELEMENT_IDS.TOGGLE_BUTTON}
        type="button"
      >
        {buttonText}
      </Button>
    </div>
  );
};
