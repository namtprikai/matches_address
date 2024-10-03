import { makeStyles } from "@fluentui/react-components";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ArchiveRegular } from "@fluentui/react-icons";
import { formatByteValue } from "../utils/format-byte-value";
import { Button } from "./ui/button";

type Props = {
  variant?: "default" | "simple";
};

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: "200px",
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
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const styles = useStyles();

  if (variant === "default") {
    return (
      <div {...getRootProps()} className={styles.root}>
        <input hidden type="file" {...getInputProps()} />
        {selectedFile ? (
          <div>
            <div>
              <p>{selectedFile.path}</p>
              <p>
                {formatByteValue(selectedFile.size, {
                  unit: "MB",
                })}
              </p>
              <div>
                <Button
                  appearance="subtle"
                  icon={<ArchiveRegular />}
                  type="button"
                />
              </div>
            </div>
          </div>
        ) : isDragActive ? (
          <p>ファイルをそのままドロップ</p>
        ) : (
          <p>ここにドラッグ&ドロップ</p>
        )}
      </div>
    );
  }

  // simple の場合のコンポーネントを追加
  return <></>;
};
