import { Dialog, makeStyles, DialogTrigger } from "@fluentui/react-components";
import { DismissFilled } from "@fluentui/react-icons";
import { useForm, type FieldPath } from "react-hook-form";
import { type z } from "zod";
import { type ReturnUseDialogState } from "../hooks/use-dialog-state";
import { type schema as formModelCreateSchema } from "../hooks/use-form-model-create";
import { Button } from "./ui/button";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogBody } from "./ui/dialog-body";
import { DialogTitle } from "./ui/dialog-title";
import { DialogContent } from "./ui/dialog-content";
import { DialogActions } from "./ui/dialog-actions";
import { Field } from "./ui/field";
import { Input } from "./ui/input";

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
  formContents: {
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "repeat(2, 1fr)",
  },
  input: {
    left: "0",
    width: "16px",
  },
});

type FormType = z.infer<typeof formModelCreateSchema>;

type Props = {
  dialogState: ReturnUseDialogState;
  onSelected: (selected: FormType["settings"]["advanced"]) => void;
  initialValues: FormType["settings"]["advanced"];
};

/**
 * ラベル名は仮: @todo 変数の置き場所考えたい
 */
type AdvancedField = {
  key: FieldPath<FormType["settings"]["advanced"]>;
  label: string;
  placeholder: string;
  step?: string;
  type: "number" | "checkbox";
};
const Fields: AdvancedField[] = [
  {
    key: "test_size",
    label: "Test Size",
    placeholder: "0.0",
    step: "0.1",
    type: "number",
  },
  {
    key: "n_splits",
    label: "N Splits",
    placeholder: "0",
    step: "1",
    type: "number",
  },
  {
    key: "undersample",
    label: "Undersample",
    placeholder: "false",
    step: "1",
    type: "checkbox",
  },
  {
    key: "undersample_ratio",
    label: "Undersample Ratio",
    placeholder: "0.0",
    step: "0.1",
    type: "number",
  },
  {
    key: "threshold",
    label: "Threshold",
    placeholder: "0.0",
    step: "0.1",
    type: "number",
  },
  {
    key: "hyperparameter_flag",
    label: "Hyperparameter Flag",
    placeholder: "false",
    step: "1",
    type: "checkbox",
  },
  {
    key: "n_trials",
    label: "N Trials",
    placeholder: "0",
    step: "1",
    type: "number",
  },
  {
    key: "lambda_l1",
    label: "Lambda L1",
    placeholder: "0.0",
    step: "0.1",
    type: "number",
  },
  {
    key: "lambda_l2",
    label: "Lambda L2",
    placeholder: "0.0",
    step: "0.1",
    type: "number",
  },
  {
    key: "num_leaves",
    label: "Num Leavs",
    placeholder: "0",
    step: "1",
    type: "number",
  },
  {
    key: "feature_fraction",
    label: "Feature Fraction",
    placeholder: "0.0",
    step: "0.1",
    type: "number",
  },
  {
    key: "bagging_fraction",
    label: "Bagging Fraction",
    placeholder: "0.0",
    step: "0.1",
    type: "number",
  },
  {
    key: "bagging_freq",
    label: "Bagging Freq",
    placeholder: "0",
    step: "1",
    type: "number",
  },
];

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
            高度な設定を変更
          </DialogTitle>
          <DialogContent className={styles.formContents}>
            {Fields.map(({ key, label, placeholder, step, type }) => (
              <Field key={key} label={label}>
                {type === "number" && (
                  <Input
                    {...register(key)}
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
            ))}
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={handleClick}>
              保存
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
