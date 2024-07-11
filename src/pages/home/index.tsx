import { type FormEvent, useEffect, useState } from "react";
import { Form, TextField, ButtonGroup, Button } from "@adobe/react-spectrum";

export function Home(): JSX.Element {
  const [messages, setMessages] = useState<string[] | null>(null);
  const [submitted, setSubmitted] = useState<{
    [key: string]: FormDataEntryValue;
  } | null>(null);

  useEffect(() => {
    window.ipcRenderer
      .invoke("getSqliteRows")
      .then((rows: { id: number; name: string }[]) => {
        setMessages(rows.map((row) => row.name));
      });
  }, []);

  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setSubmitted(data);
  };

  return (
    <div>
      <h1>Hello, world!</h1>
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
        <div>
          {submitted ? (
            <div>
              You submitted: <code>{JSON.stringify(submitted)}</code>
            </div>
          ) : null}
        </div>
      </Form>
      {messages?.map((message, i) => (
        <p key={i}>{message}</p>
      ))}
      <div>
        <a href="#about">Go to about page</a>
      </div>
    </div>
  );
}
