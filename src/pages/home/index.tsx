import { useEffect, useState } from "react";
import { Form, TextField, ButtonGroup, Button } from "@adobe/react-spectrum";
import { type FormProps } from "react-router-dom";

export function Home(): JSX.Element {
  const [names, setNames] = useState<string[] | null>(null);

  const updateNames = async (): Promise<void> => {
    const rows: { id: number; name: string }[] =
      await window.ipcRenderer.invoke("getNames");
    setNames(rows.map((row) => row.name));
  };

  useEffect(() => {
    updateNames();
  }, []);

  const onSubmit: FormProps["onSubmit"] = (e): void => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    window.ipcRenderer.invoke("saveName", data.name);
    updateNames();
  };

  return (
    <div>
      <h1>Hello, world!</h1>
      <div>
        <a href="#about">Go to about page</a>
      </div>
      <Form maxWidth="size-3000" onSubmit={onSubmit}>
        <TextField label="Name" name="name" />
        <ButtonGroup>
          <Button type="submit" variant="primary">
            Submit
          </Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
        </ButtonGroup>
      </Form>
      {names?.map((message, i) => (
        <p key={i}>{message}</p>
      ))}
    </div>
  );
}
