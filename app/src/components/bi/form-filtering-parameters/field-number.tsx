import {
  Checkbox,
  Label,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { type UseFormSetValue, type UseFormRegister } from "react-hook-form";
import { Delete20Regular } from "@fluentui/react-icons";
import { type FilterCondition } from "../../../bi-modules/interfaces/parameter";
import { Field } from "../../ui/field";
import { Select } from "../../ui/select";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { type EditViewFormType } from "../../../bi-modules/interfaces/edit-view-form";

const useStyles = makeStyles({
  groupField: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXXL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    fontSize: "14px",
  },
  inputValue: {
    flexGrow: 1,
    flexBasis: "128px",
    flexShrink: 1,
  },
  inputRangeValue: {
    flexGrow: 1,
    width: "128px",
  },
  inputLabelValue: {
    width: "128px",
  },
  includesField: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
    justifyContent: "center",
    fontSize: "12px",
    lineHeight: "12px",
    height: "36px",
    marginBottom: 0,
  },
  checkbox: {
    "&  div": {
      margin: "0",
    },
  },
});

type Props = {
  field: FilterCondition;
  label: string;
  unit: string;
  register: UseFormRegister<EditViewFormType>;
  setValue: UseFormSetValue<EditViewFormType>;
  index: number;
  handleRemove: () => void;
  update: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export const FieldNumber = ({
  field,
  label,
  unit,
  register,
  setValue,
  index,
  handleRemove,
  update,
}: Props): JSX.Element => {
  const styles = useStyles();

  if (
    !(
      field.value.referenceColumnType === "float" ||
      field.value.referenceColumnType === "floatRange" ||
      field.value.referenceColumnType === "integer" ||
      field.value.referenceColumnType === "integerRange"
    )
  )
    return <></>;

  return (
    <Field className={styles.groupField}>
      <Label>{label}</Label>
      <Select onChange={update} value={field.value.operation ?? "eq"}>
        <option value="eq">等しい</option>
        <option value="noteq">等しくない</option>
        <option value="gt">より大きい</option>
        <option value="lt">より小さい</option>
        <option value="gte">以上</option>
        <option value="lte">以下</option>
        <option value="range">次の範囲</option>
      </Select>
      {field.value.operation === "range" ? (
        <>
          <Input
            className={styles.inputRangeValue}
            defaultValue={
              field.value.startValue ? field.value.startValue.toString() : ""
            }
            max={100}
            min={0}
            onBlur={(e) => {
              const parsed = parseFloat(e.target.value);
              const value =
                unit === "%" ? Math.max(0, Math.min(100, parsed)) : parsed;
              e.target.value = `${value}`;
              setValue(`parameters.${index}.value.startValue`, value);
            }}
            placeholder="開始値"
            type="number"
          />
          {unit ?? ""}
          <div className={styles.includesField}>
            <span>含</span>
            <Checkbox
              className={styles.checkbox}
              defaultChecked={field.value.includesStart ?? true}
              {...register(`parameters.${index}.value.includesStart`)}
            />
          </div>
          <span>〜</span>
          <Input
            className={styles.inputRangeValue}
            defaultValue={
              field.value.lastValue ? field.value.lastValue.toString() : ""
            }
            max={100}
            min={0}
            onBlur={(e) => {
              const parsed = parseFloat(e.target.value);
              const value =
                unit === "%" ? Math.max(0, Math.min(100, parsed)) : parsed;
              e.target.value = `${value}`;
              setValue(`parameters.${index}.value.lastValue`, value);
            }}
            placeholder="終了値"
            type="number"
          />
          {unit ?? ""}
          <div className={styles.includesField}>
            <span>含</span>
            <Checkbox
              className={styles.checkbox}
              defaultChecked={field.value.includesLast ?? true}
              {...register(`parameters.${index}.value.includesLast`)}
            />
          </div>
        </>
      ) : (
        <>
          <Input
            className={styles.inputValue}
            defaultValue={field.value.value ? field.value.value.toString() : ""}
            max={100}
            min={0}
            onBlur={(e) => {
              const parsed = parseFloat(e.target.value);
              const value =
                unit === "%" ? Math.max(0, Math.min(100, parsed)) : parsed;
              e.target.value = `${value}`;
              setValue(`parameters.${index}.value.value`, value);
            }}
            placeholder="値"
            type="number"
          />
          {unit ?? ""}
        </>
      )}

      <Button
        appearance="subtle"
        icon={<Delete20Regular />}
        onClick={() => {
          handleRemove();
        }}
        type="button"
      ></Button>
    </Field>
  );
};
