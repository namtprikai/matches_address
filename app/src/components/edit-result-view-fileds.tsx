import { Field, Input, Select } from "@fluentui/react-components";
import { result_views } from "../schema";
import { LanguageMap } from "../lang";

export const EditResultViewFileds = (): JSX.Element => {
  return (
    <>
      <Field label="データセット">
        <Input disabled placeholder="選択中のデータセット名が入る" />
      </Field>
      <Field label="ビューのタイトル">
        <Input placeholder="選択中のビューのタイトルを入力する" />
      </Field>
      <fieldset>
        <legend>パラメーター</legend>
        <Field label="スタイル">
          <Select>
            {result_views.style.enumValues.map((item) => (
              <option key={item} value={item}>
                {LanguageMap["RESULT_VIEWS_STYLE"][item]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="集計単位">
          <Select>
            {result_views.unit.enumValues.map((item) => (
              <option key={item} value={item}>
                {LanguageMap["RESULT_VIEWS_UNIT"][item]}
              </option>
            ))}
          </Select>
        </Field>
      </fieldset>
    </>
  );
};
