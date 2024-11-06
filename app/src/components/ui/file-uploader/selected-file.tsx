import { DeleteRegular } from "@fluentui/react-icons";
import { type MouseEventHandler } from "react";
import { makeStyles, tokens } from "@fluentui/react-components";
import { formatByteValue } from "../../../utils/format-byte-value";
import { Button } from "../button";

const useStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "flex-start",
    gap: tokens.spacingHorizontalXXXL,
  },
  fileSize: {
    fontSize: tokens.fontSizeBase300,
  },
});

type Props = {
  file: File;
  onDelete: MouseEventHandler<HTMLButtonElement>;
};

export const SelectedFile = ({ file, onDelete }: Props): JSX.Element => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <div>
        <p>{file.path}</p>
        <p className={styles.fileSize}>
          {formatByteValue(file.size, {
            unit: "MB",
          })}
        </p>
      </div>
      <div>
        <Button
          appearance="subtle"
          icon={<DeleteRegular />}
          onClick={onDelete}
          type="button"
        />
      </div>
    </div>
  );
};
