import { type result_sheets } from "../schema";

type Props = {
  resultsheet: typeof result_sheets.$inferSelect;
};

export const Resultsheet = ({ resultsheet }: Props): JSX.Element => {
  return <div>Resultsheet - {resultsheet.title}</div>;
};
