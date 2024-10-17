import { useState } from "react";
import { DialogDatasetImporter } from "../components/dialog-dataset-importer";
import { type SelectRawDataSet } from "../schema";

export const useDatasetImporter = ({
  onSelected,
}: {
  onSelected?: (data: SelectRawDataSet) => void;
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type -- 型推論を利用したいため
}) => {
  const [open, setOpen] = useState(false);

  return {
    Dialog: () =>
      DialogDatasetImporter({
        open,
        onOpenChange: () => {
          setOpen(!open);
        },
        onSelected,
      }),
    open,
    setOpen,
  };
};
