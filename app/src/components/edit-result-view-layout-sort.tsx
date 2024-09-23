import { Field } from "./ui/field";
import { Input } from "./ui/input";

export const EditResultViewLayoutSort = (): JSX.Element => {
  return (
    <div>
      <Field label="ビューのタイトル">
        <Input placeholder="選択中のビューのタイトルを入力する" />
      </Field>
      <Field label="ビューのタイトル">
        <Input placeholder="選択中のビューのタイトルを入力する" />
      </Field>
    </div>
  );
};
