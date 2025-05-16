import { useState } from "react";
import { type KeyedMutator } from "swr";
import { useDialogState } from "../../../hooks/use-dialog-state";
import { useIsLoading } from "../../../hooks/use-is-loading";
import { type SelectDataSetResult } from "../../../schema";
import {
  type UseDialogCreateResultDatasetReturn,
  type FileData,
  type UseReadbleFileReturn,
} from "./type";

type Params = {
  mutate: KeyedMutator<SelectDataSetResult[]>;
};

export const useDialogCreateResultDataset = ({
  mutate,
}: Params): UseDialogCreateResultDatasetReturn => {
  const { isOpen, setIsOpen } = useDialogState(false);

  const buildingFileState = useReadbleFile();
  const areaFileState = useReadbleFile();
  const disabled = !buildingFileState.fileData && !areaFileState.fileData;

  const { isLoading, handleIsLoading } = useIsLoading({ init: false });

  const handleClick = async (): Promise<void> => {
    try {
      handleIsLoading(true);
      if (!buildingFileState.fileData && !areaFileState.fileData) {
        throw new Error("ファイルが選択されていません");
      }

      await window.ipcRenderer.invoke("createResultDatasets", {
        buildingFile: buildingFileState.fileData,
        areaFile: areaFileState.fileData,
      });
      setIsOpen(false);
      await mutate();
    } catch (error) {
      console.error("Error during file upload:", error);
    } finally {
      handleIsLoading(false);
    }
  };

  return {
    dialogState: { isOpen, setIsOpen },
    buildingFileState,
    areaFileState,
    disabled,
    handleClick,
    isLoading,
  };
};

/**
 * クライアントのメモリで一括でファイルを読み込み返却する
 */
const readFile = (file: File): Promise<FileData> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({ name: file.name, content: reader.result as string });
    };
    reader.readAsText(file);
  });
};

const useReadbleFile = (): UseReadbleFileReturn => {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const handleFileChange = async (file: File | null): Promise<void> => {
    if (!file) {
      setFileData(null);
      return;
    }
    const fileData = await readFile(file);
    setFileData(fileData);
  };

  return {
    fileData,
    handleFileChange,
  };
};
