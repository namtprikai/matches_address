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
  const files = e.target.files;
  if (!files || files.length === 0) {
    return;
  }
  try {
    await Promise.all(
      Array.from(files).map((file) => saveDataSetFile(file, tab)),
    );
  } catch (error) {
    console.error("Operation failed:", error);
  }

  e.target.value = ""; // ファイル選択をリセットする
};
