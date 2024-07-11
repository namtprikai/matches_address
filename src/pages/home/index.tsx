import { useEffect, useState } from "react";

export function Home(): JSX.Element {
  const [messages, setMessages] = useState<string[] | null>(null);

  useEffect(() => {
    window.ipcRenderer
      .invoke("getSqliteRows")
      .then((rows: { id: number; name: string }[]) => {
        setMessages(rows.map((row) => row.name));
      });
  }, []);

  return (
    <div>
      <h1>Hello, world!</h1>
      {messages?.map((message, i) => (
        <p key={i}>{message}</p>
      ))}
      <div>
        <a href="#about">Go to about page</a>
      </div>
    </div>
  );
}
