import {
  DialogSurfaceElement,
  type DialogSurfaceProps,
} from "@fluentui/react-dialog";
import {
  DialogSurface as FUIDialogSurface,
  makeStyles,
  mergeClasses,
  tokens,
} from "@fluentui/react-components";
import { forwardRef } from "react";

const useStyles = makeStyles({
  dialogSurface: {
    boxShadow: tokens.shadow28,
    borderRadius: tokens.borderRadiusXLarge,
    maxWidth: "450px",
  },
});

export const DialogSurface = forwardRef<HTMLDivElement, DialogSurfaceProps>(
  ({ className, ...props }, ref) => {
    const styles = useStyles();

    return (
      <FUIDialogSurface
        {...props}
        ref={ref}
        className={mergeClasses(className, styles.dialogSurface)}
      />
    );
  },
);

DialogSurface.displayName = "DialogSurface";
