import { Button, Field, Input } from "@fluentui/react-components";
import { useEffect, useState } from "react";
import { type FormProps } from "react-router-dom";

export function Home(): JSX.Element {
  const [names, setNames] = useState<string[] | null>(null);
  console.log("github protection test2");

  const updateNames = async (): Promise<void> => {
    const result = await window.ipcRenderer.invoke("getNames");
    setNames(result);
  };

  const sayHelloFromPython = async (): Promise<void> => {
    const result = await window.ipcRenderer.invoke("helloFromPython", "world");
    console.info(result);
  };

  useEffect(() => {
    const asyncEffect = async (): Promise<void> => {
      await sayHelloFromPython();
      await updateNames();
    };
    asyncEffect().catch(console.error);
  }, []);

  const handleSubmit: FormProps["onSubmit"] = (e) => {
    e.preventDefault();
    const asyncSubmit = async (): Promise<void> => {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      await window.ipcRenderer.invoke("saveName", data.name.toString());
      await updateNames();
    };
    asyncSubmit().catch(console.error);
  };

  const handleSubmitPython: FormProps["onSubmit"] = (e) => {
    e.preventDefault();
    const asyncSubmit = async (): Promise<void> => {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      await window.ipcRenderer.invoke(
        "saveNameFromPython",
        data.name.toString(),
      );
      await updateNames();
    };
    asyncSubmit().catch(console.error);
  };

  return (
    <div>
      <h1>Hello, world!</h1>
      <div>
        <a href="#about">Go to about page</a>
      </div>
      <form onSubmit={handleSubmit}>
        <Field label="Save name">
          <Input name="name" />
        </Field>
        <Button appearance="primary" type="submit">
          Submit
        </Button>
        <Button appearance="secondary" type="reset">
          Reset
        </Button>
      </form>
      <form onSubmit={handleSubmitPython}>
        <Field label="Save name from python">
          <Input name="name" />
        </Field>
        <Button appearance="primary" type="submit">
          Submit
        </Button>
        <Button appearance="secondary" type="reset">
          Reset
        </Button>
      </form>
      <div>{names?.map((message, i) => <p key={i}>{message}</p>)}</div>
    </div>
  );
}
