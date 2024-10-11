import { Card } from "@fluentui/react-components";
import { useEffect, useState } from "react";
import { type FieldValues, type Path } from "react-hook-form";
import { FileUploader } from "./ui/file-uploader/file-uploader";

export const FormDataset = <
  FORM_TYPE extends FieldValues,
  COLUMN_TYPE extends object,
>(props: {
  value: {
    columns: COLUMN_TYPE;
    path: string;
  };
  name: Path<FORM_TYPE>;
  dataSetName: string;
  onChange?: (value: typeof props.value) => void;
}): JSX.Element => {
  const [value, setValue] = useState<typeof props.value>(props.value);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    props.onChange?.(value);
  }, [value, props]);

  return (
    <Card>
      <FileUploader
        onChange={(file) => {
          setValue((prev) => ({
            ...prev,
            path: file?.path ?? "",
          }));
        }}
        value={file}
      />
    </Card>
  );
};
