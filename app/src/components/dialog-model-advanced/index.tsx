import {
  Dialog,
  makeStyles,
  DialogTrigger,
  tokens,
} from "@fluentui/react-components";
import { DismissFilled } from "@fluentui/react-icons";
import { useForm } from "react-hook-form";
import { type ReturnUseDialogState } from "../../hooks/use-dialog-state";
import { Button } from "../ui/button";
import { DialogSurface } from "../ui/dialog-surface";
import { DialogBody } from "../ui/dialog-body";
import { DialogTitle } from "../ui/dialog-title";
import { DialogContent } from "../ui/dialog-content";
import { DialogActions } from "../ui/dialog-actions";
import { Field } from "../ui/field";
import { Input } from "../ui/input";
import { TextWithTooltip } from "../ui/text-with-tooltip";
import { lang } from "../../lang";
import {
  DEFAULT_CATEGORY_FIELDS,
  OUTLIER_CATEGORY_FIELDS,
  type FormType,
} from "./_const";

const useStyles = makeStyles({
  dialogTitle: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  icon: {
    width: "24px",
    height: "24px",
    ":hover": { cursor: "pointer" },
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  formContents: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  input: {
    left: "0",
    width: "16px",
  },
  categoryTitle: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: tokens.colorBrandForeground1,
  },
});

type Props = {
  dialogState: ReturnUseDialogState;
  onSelected: (selected: FormType["settings"]["advanced"]) => void;
  initialValues: FormType["settings"]["advanced"] | undefined;
};

export const DialogModelAdvanced = ({
  dialogState,
  onSelected,
  initialValues,
}: Props): JSX.Element => {
  const styles = useStyles();

  const { isOpen: isDialogOpen, setIsOpen: setIsDialogOpen } = dialogState;

  /** メインのstateへの反映のタイミングを切り分けるためにformを上流とは別に再作成している */
  const { register, handleSubmit } = useForm<FormType["settings"]["advanced"]>({
    defaultValues: initialValues,
  });

  const handleClick = handleSubmit((data): void => {
    onSelected(data);
    setIsDialogOpen(false);
  });

  return (
    <Dialog
      onOpenChange={(_, { open }) => setIsDialogOpen(open)}
      open={isDialogOpen}
    >
      <DialogSurface>
        <DialogBody>
          <DialogTitle
            action={
              <DialogTrigger action="close">
                <Button
                  appearance="subtle"
                  aria-label="close"
                  icon={
                    <DismissFilled className={styles.icon} strokeWidth={2} />
                  }
                />
              </DialogTrigger>
            }
            className={styles.dialogTitle}
          >
            {lang.components["dialog-model-advanced"].dialogTitle}
          </DialogTitle>
          <DialogContent>
            <div className={styles.form}>
              <div className={styles.formContents}>
                {DEFAULT_CATEGORY_FIELDS.map(
                  ({
                    key,
                    label,
                    placeholder,
                    step,
                    type,
                    description,
                    max,
                    min,
                  }) => (
                    <Field
                      key={key}
                      label={
                        <TextWithTooltip
                          textNode={label}
                          tooltipContent={description}
                        />
                      }
                    >
                      {type === "number" && (
                        <Input
                          {...register(key)}
                          max={max}
                          min={min}
                          placeholder={placeholder}
                          step={step}
                          type="number"
                        />
                      )}
                      {type === "checkbox" && (
                        /** @fixme Checkboxコンポーネント使いたい。だが使うと初期ステートが反映されない */
                        <input
                          className={styles.input}
                          type="checkbox"
                          {...register(key)}
                        />
                      )}
                    </Field>
                  ),
                )}
              </div>

              <div>
                <h3 className={styles.categoryTitle}>
                  <TextWithTooltip
                    textNode={
                      lang.components["dialog-model-advanced"]
                        .outlierSectionTitle
                    }
                    tooltipContent={
                      lang.components["dialog-model-advanced"]
                        .outlierSectionDescription
                    }
                  />
                </h3>
                <div className={styles.formContents}>
                  {OUTLIER_CATEGORY_FIELDS.map(
                    ({
                      key,
                      label,
                      placeholder,
                      step,
                      type,
                      description,
                      max,
                      min,
                    }) => (
                      <Field
                        key={key}
                        label={
                          <TextWithTooltip
                            textNode={label}
                            tooltipContent={description}
                          />
                        }
                      >
                        {type === "number" && (
                          <Input
                            {...register(key)}
                            max={max}
                            min={min}
                            placeholder={placeholder}
                            step={step}
                            type="number"
                          />
                        )}
                        {type === "checkbox" && (
                          /** @fixme Checkboxコンポーネント使いたい。だが使うと初期ステートが反映されない */
                          <input
                            className={styles.input}
                            type="checkbox"
                            {...register(key)}
                          />
                        )}
                      </Field>
                    ),
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={handleClick}>
              {lang.components["dialog-model-advanced"].saveButton}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
