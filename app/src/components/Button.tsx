import {
  type ButtonProps,
  Button as FUIButton,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import { forwardRef } from "react";

const useStyles = makeStyles({
  root: {
    borderRadius: tokens.borderRadiusCircular,
  },
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
  (props, ref) => {
    const styles = useStyles();

    if (props.appearance === "secondary") {
      return (
        <FUIButton
          {...props}
          ref={ref}
          className={mergeClasses(styles.root, styles.secondary)}
        />
      );
    }

    return <FUIButton {...props} ref={ref} className={styles.root} />;
  },
);

Button.displayName = "Button";
