import { useForm } from "react-hook-form";
import { type NormalizationParameters } from "../@types/normalization";
import { LanguageMap } from "../metadata";
import { FormDataset } from "./form-dataset";

type Props = {
  value: NormalizationParameters;
  onSave: (parameters: NormalizationParameters) => void;
};

export const FormNormalization = ({ value, onSave }: Props): JSX.Element => {
  const { handleSubmit, setValue, getValues } =
    useForm<NormalizationParameters>({
      defaultValues: value,
    });

  const onSubmit = handleSubmit((data) => {
    onSave(data);
  });

  return (
    <form onSubmit={onSubmit}>
      <FormDataset
        appearance="large"
        dataSetName={LanguageMap.NORMALIZATION_DATA_LABEL.residentRegistry}
        name={"data.residentRegistry"}
        onChange={(value) => {
          setValue("data.residentRegistry", value);
        }}
        value={getValues().data.residentRegistry}
      />
    </form>
  );
};
