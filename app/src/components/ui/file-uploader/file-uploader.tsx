import { makeStyles } from "@fluentui/react-components";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { SelectedFile } from "./selected-file";
import { UploadFileSymbol } from "./upload-file-symbol";
import { DropFileSymbol } from "./drop-file-symbol";

type Props = {
  variant?: "default" | "simple";
  value: File | null;
  onChange: (file: File | null) => void;
};

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    border: "2px dashed #ccc",
    borderRadius: "5px",
    cursor: "pointer",
  },
});

export const FileUploader = ({ variant = "default" }: Props): JSX.Element => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFile(acceptedFiles[0]);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const styles = useStyles();

  if (variant === "default") {
    return (
      <div {...getRootProps()} className={styles.root}>
        <input hidden type="file" {...getInputProps()} />
        {selectedFile ? (
          <SelectedFile
            file={selectedFile}
            onDelete={(event) => {
              event.stopPropagation(); // ファイル選択のイベントが発火しないようにする
              setSelectedFile(null);
            }}
          />
        ) : isDragActive ? (
          <DropFileSymbol />
        ) : (
          <UploadFileSymbol />
        )}
      </div>
    );
  }

  // simple の場合のコンポーネントを追加
  return <></>;
};
