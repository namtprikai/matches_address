import { useEffect, useState } from "react";
import {
  Form,
  TextField,
  ButtonGroup,
  Button,
  Flex,
} from "@adobe/react-spectrum";
import { type FormProps } from "react-router-dom";

export function Home(): JSX.Element {
  const [names, setNames] = useState<string[] | null>(null);

  const updateNames = async (): Promise<void> => {
    const result = await window.ipcRenderer.invoke("getNames");
    setNames(result);
  };

  const sayHelloFromPython = async (): Promise<void> => {
    const result = await window.ipcRenderer.invoke("helloFromPython", "world");
    console.info(result);
  };

  useEffect(() => {
    sayHelloFromPython();
    updateNames();
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
        data.name.toString()
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
      <Flex gap="size-400" justifyContent="center" marginTop="size-400">
        <Flex direction="column" gap="size-200">
          <Form maxWidth="size-3000" onSubmit={handleSubmit}>
            <TextField label="Save name" name="name" />
            <ButtonGroup>
              <Button type="submit" variant="primary">
                Submit
              </Button>
              <Button type="reset" variant="secondary">
                Reset
              </Button>
            </ButtonGroup>
          </Form>
          <Form maxWidth="size-3000" onSubmit={handleSubmitPython}>
            <TextField label="Save name from python" name="name" />
            <ButtonGroup>
              <Button type="submit" variant="primary">
                Submit
              </Button>
              <Button type="reset" variant="secondary">
                Reset
              </Button>
            </ButtonGroup>
          </Form>
        </Flex>
        <div>
          {names?.map((message, i) => (
            <p key={i}>{message}</p>
          ))}
        </div>
      </Flex>
    </div>
  );
}
