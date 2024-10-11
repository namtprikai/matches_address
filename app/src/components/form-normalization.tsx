import { useForm } from "react-hook-form";
import { type NormalizationParameters } from "../@types/normalization";
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
        dataSetName="ABC"
        name={"data.residentRegister"}
        onChange={(value) => {
          setValue("data.residentRegister", value);
          console.log(value);
        }}
        value={getValues().data.residentRegister}
      />
    </form>
  );
};
