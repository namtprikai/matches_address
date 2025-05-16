import { type ReturnUseDialogState } from "../../../hooks/use-dialog-state";

export type FileData = {
  name: string;
  content: string;
};

export type UseReadbleFileReturn = {
  fileData: FileData | null;
  handleFileChange: (file: File | null) => Promise<void>;
};

export type UseDialogCreateResultDatasetReturn = {
  dialogState: ReturnUseDialogState;
  buildingFileState: UseReadbleFileReturn;
  areaFileState: UseReadbleFileReturn;
  disabled: boolean;
  handleClick: () => Promise<void>;
  isLoading: boolean;
};
