import {
  DialogTitle as FUIDialogTitle,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import { forwardRef } from "react";

const useStyles = makeStyles({
  dialogTitle: {
    fontSize: tokens.fontSizeBase400,
    lineHeight: "24px",
    height: "24px",
  },
});

export const DialogTitle = forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof FUIDialogTitle>
>(({ className, ...props }, ref) => {
  const styles = useStyles();

  return (
    <FUIDialogTitle
      {...props}
      ref={ref}
      className={mergeClasses(className, styles.dialogTitle)}
    />
  );
});

DialogTitle.displayName = "DialogTitle";
