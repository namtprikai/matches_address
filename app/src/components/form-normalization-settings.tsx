import {
  Card,
  makeStyles,
  Radio,
  RadioGroup,
} from "@fluentui/react-components";
import { type NormalizationParameters } from "../@types/normalization";
import { LanguageMap } from "../metadata";
import { Field } from "./ui/field";
import { Input } from "./ui/input";
import { FormNormalizationAdvancedSettings } from "./form-normalization-advanced-settings";

const useStyles = makeStyles({
  basicFields: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
});

type Props = {
  value: NormalizationParameters["settings"];
  onChange: (value: NormalizationParameters["settings"]) => void;
};

export const FormNormalizationSettings = ({
  value,
  onChange,
}: Props): JSX.Element => {
  const styles = useStyles();

  return (
    <Card>
      <p>設定値の変更</p>
      <div className={styles.basicFields}>
        <Field
          label={LanguageMap.NORMALIZATION_PARAMETER_LABEL["referenceDate"]}
        >
          <Input
            defaultValue={value.referenceDate}
            onChange={(_, data) => {
              onChange({
                ...value,
                referenceDate:
                  data.value as NormalizationParameters["settings"]["referenceDate"],
              });
            }}
            type="date"
          />
        </Field>

        <Field
          label={LanguageMap.NORMALIZATION_PARAMETER_LABEL["referenceData"]}
        >
          <RadioGroup
            defaultValue={value.referenceData}
            layout="horizontal"
            onChange={(_, data) => {
              onChange({
                ...value,
                referenceData:
                  data.value as NormalizationParameters["settings"]["referenceData"],
              });
            }}
          >
            <Radio
              label={LanguageMap.NORMALIZATION_DATA_LABEL["waterStatus"]}
              value={"waterStatus"}
            />
            <Radio
              label={LanguageMap.NORMALIZATION_DATA_LABEL["residentRegistry"]}
              value={"residentRegistry"}
            />
          </RadioGroup>
        </Field>
      </div>

      <FormNormalizationAdvancedSettings
        onChange={(data) => {
          onChange({
            ...value,
            advanced: data,
          });
        }}
        value={value.advanced}
      />
    </Card>
  );
};
