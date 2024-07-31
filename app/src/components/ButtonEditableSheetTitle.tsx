import { Input, makeStyles, tokens } from "@fluentui/react-components";
import { useState } from "react";
import { type FormProps } from "react-router-dom";
import { type result_sheets } from "../schema";
import { Button } from "./Button";

type ResultSheet = typeof result_sheets.$inferSelect;

type Props = {
  resultSheet: ResultSheet;
};

const useStyles = makeStyles({
  root: {
    padding: tokens.spacingVerticalNone,
  },
});

export const ButtonEditableSheetTitle = ({
  resultSheet,
}: Props): JSX.Element => {
  const styles = useStyles();
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit: FormProps["onSubmit"] = (e) => {
    e.preventDefault();
    const asyncSubmit = async (): Promise<void> => {
      const data = Object.fromEntries(new FormData(e.currentTarget));
    //   await window.ipcRenderer.invoke("", {
    //     title: data.title.toString(),
    //   });
    };
    asyncSubmit().catch(console.error);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit}>
        <Input defaultValue={resultSheet.title || ""} size="small" />
      </form>
    );
  }

  return (
    <Button
      appearance="subtle"
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- 期待通りの動作をしているため無視。本来はaかbuttonのみ許容するよう。
      /* @ts-ignore */
      as="div"
      className={styles.root}
      onDoubleClick={(): void => setIsEditing(true)}
      shape="square"
    >
      {resultSheet.title}
    </Button>
  );
};
