import { makeStyles, mergeClasses, tokens } from "@fluentui/react-components";
import { type ComponentPropsWithoutRef, forwardRef } from "react";

const useStyles = makeStyles({
  form: {
    "& span:has(> input)": {
      border: `1px solid ${tokens.colorNeutralStroke1}`,
      borderRadius: tokens.borderRadiusXLarge,
      "&:active, &:hover, &:focus, &:focus-within": {
        border: `1px solid ${tokens.colorNeutralStroke1Pressed}`,
      },
    },
  },
});

export const Form = forwardRef<
  HTMLFormElement,
  ComponentPropsWithoutRef<"form">
>(({ className, ...props }, ref) => {
  const styles = useStyles();

  return (
    <form
      className={mergeClasses(className, styles.form)}
      {...props}
      ref={ref}
    />
  );
});

Form.displayName = "Form";
