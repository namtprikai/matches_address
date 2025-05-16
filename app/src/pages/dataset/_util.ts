import { saveDataSetFile } from "../../utils/save-data-set-file";

export const handleUploadButtonClick = ({
  fileInputRef,
}: {
  fileInputRef: React.RefObject<HTMLInputElement>;
}): void => {
  fileInputRef.current?.click();
};

export const handleUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
  tab: "raw" | "normalization" | "result",
): Promise<void> => {
  const file = e.target.files?.[0];
  try {
    await saveDataSetFile(file, tab);
  } catch (error) {
    console.error("Operation failed:", error);
  }
  e.target.value = ""; // ファイル選択をリセットする
};
