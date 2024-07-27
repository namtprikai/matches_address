import {
  type ButtonProps,
  Button as FUIButton,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { forwardRef } from "react";

const useStyles = makeStyles({
  secondary: {
    backgroundColor: tokens.colorNeutralForeground2,
    color: tokens.colorNeutralForegroundInverted,
    "&:hover": {
      backgroundColor: tokens.colorNeutralForeground2,
      color: tokens.colorNeutralForegroundInverted,
      opacity: 0.8,
    },
  },
});

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({shape = "circular", ...props}, ref) => {
    const styles = useStyles();

    if (props.appearance === "secondary") {
      return (
        <FUIButton
          {...props}
          ref={ref}
          className={styles.secondary}
          shape={shape}
        />
      );
    }

    return <FUIButton {...props} ref={ref} shape={shape} />;
  },
);

Button.displayName = "Button";
