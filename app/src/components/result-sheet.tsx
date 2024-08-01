import { useEffect, useState } from "react";
import { Card } from "@fluentui/react-components";
import { type result_views, type result_sheets } from "../schema";
import { Button } from "./button";

type ResultViews = typeof result_views.$inferSelect;

type Props = {
  resultsheet: typeof result_sheets.$inferSelect;
};

export const Resultsheet = ({ resultsheet: { id } }: Props): JSX.Element => {
  const [resultViews, setResultViews] = useState<ResultViews[]>([]);

  const fetchResultSheets = async (sheetId: number): Promise<void> => {
    const result = await window.ipcRenderer.invoke("selectResultViews", {
      sheetId,
    });
    setResultViews(result);
  };

  useEffect(() => {
    if (!id) return;
    fetchResultSheets(id).catch(console.error);
  }, [id]);

  return (
    <div>
      <div>
        {resultViews.length === 0 && <p>ビューがありません</p>}
        {resultViews.map((resultView) => (
          <Card key={resultView.id}>{resultView.title}</Card>
        ))}
      </div>
      <Button appearance="primary">保存</Button>
    </div>
  );
};
