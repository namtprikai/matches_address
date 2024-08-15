import {
  type InputProps,
  makeStyles,
  mergeClasses,
  tokens,
  Input as FUIInput,
} from "@fluentui/react-components";
import { forwardRef } from "react";

const useStyles = makeStyles({
  input: {
    "&:after": {
      display: "none",
    },
    padding: `${tokens.spacingVerticalSNudge} ${tokens.spacingHorizontalM}`,
    "& input": {
      padding: 0,
    },
  },
});

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const styles = useStyles();
    return (
      <FUIInput
        {...props}
        ref={ref}
        className={mergeClasses(className, styles.input)}
      />
    );
  },
);

Input.displayName = "Input";
