import { type SelectResultView } from "../schema";

export type EditResultViewFormType = {
  title: string;
  style: SelectResultView["style"];
  unit: SelectResultView["unit"];
  parameters: SelectResultView["parameters"];
  year:
    | {
        start: string | undefined;
        end: string | undefined;
      }
    | undefined;
  areas: string[];
};
