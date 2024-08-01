import { useEffect } from "react";
import { type result_sheets } from "../schema";
import { Button } from "./button";

type Props = {
  resultsheet: typeof result_sheets.$inferSelect;
};

export const Resultsheet = ({ resultsheet }: Props): JSX.Element => {

  useEffect(()=>{
    // todo: fetch
  },[resultsheet])

  return (
    <div>
      <Button appearance="primary">保存</Button>
    </div>
  );
};
