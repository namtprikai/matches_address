import { useEffect, useState } from "react";

export function Home(): JSX.Element {
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    window.ipcRenderer
      .invoke("getSqliteRows")
      .then((rows: { id: number; name: string }[]) => {
        setMessage(rows.map((row) => row.name).join(", "));
      });
  }, []);

  return (
    <div>
      <h1>Hello, world!</h1>
      <p>{message}</p>
      <div>
        <a href="#about">Go to about page</a>
      </div>
    </div>
  );
}
