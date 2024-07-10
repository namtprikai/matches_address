import { useEffect, useState } from "react";
import "./App.css";

export function App(): JSX.Element {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    window.ipcRenderer
      .invoke("get-sqlite-rows")
      .then((rows: { id: number; name: string }[]) => {
        setMessage(rows.map((row) => row.name).join(", "));
      });
  }, []);

  return (
    <div>
      <h1>Hello, world!</h1>
      <p>{message}</p>
    </div>
  );
}
