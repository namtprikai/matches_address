import { useState } from "react";
import { DialogDatasetImporter } from "../components/dialog-dataset-importer";

export const useDatasetImporter = ({
  onSelected,
}: {
  onSelected?: (id: number) => void;
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
