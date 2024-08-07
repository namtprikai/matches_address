import { Field, Input, Select } from "@fluentui/react-components";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { result_views } from "../schema";
import { LanguageMap } from "../lang";

const schema = z.object({
  title: z.string().min(1).max(255),
  unit: z.enum(result_views.unit.enumValues).default("building"),
  style: z.enum(result_views.style.enumValues).default("map"),
});

type EditResultViewFormType = z.infer<typeof schema>;

export const EditResultViewForm = (): JSX.Element => {
  const { register, handleSubmit } = useForm<EditResultViewFormType>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async (data) => {
    console.log("onSubmit", { data });
  });

  return (
    <form onSubmit={onSubmit}>
      <button hidden type="submit" />
      <Field label="データセット">
        <Input disabled placeholder="選択中のデータセット名が入る" />
      </Field>
      <Field label="ビューのタイトル">
        <Input
          placeholder="選択中のビューのタイトルを入力する"
          {...register("title")}
          required
        />
      </Field>
      <fieldset>
        <legend>パラメーター</legend>
        <Field label="スタイル">
          <Select {...register("style")}>
            {result_views.style.enumValues.map((item) => (
              <option key={item} value={item}>
                {LanguageMap["RESULT_VIEWS_STYLE"][item]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="集計単位">
          <Select {...register("unit")}>
            {result_views.unit.enumValues.map((item) => (
              <option key={item} value={item}>
                {LanguageMap["RESULT_VIEWS_UNIT"][item]}
              </option>
            ))}
          </Select>
        </Field>
      </fieldset>
    </form>
  );
};
