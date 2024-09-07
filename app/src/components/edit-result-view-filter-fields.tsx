import {
  Checkbox,
  Dialog,
  DialogContent,
  DialogTrigger,
  makeStyles,
  Text,
  tokens,
} from "@fluentui/react-components";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { selectedResultViewAtom } from "../state/selected-result-view-atom";
import { Button } from "./ui/button";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogTitle } from "./ui/dialog-title";
import { DialogBody } from "./ui/dialog-body";
import { DialogActions } from "./ui/dialog-actions";
import { Field } from "./ui/field";
import { Select } from "./ui/select";
import { Fieldset } from "./ui/fieldset";
import { FieldLegend } from "./ui/field-legend";

const useStyles = makeStyles({
  form: {
    display: "grid",
    gap: tokens.spacingVerticalXXL,
  },
  year: {
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
  },
  area: {
    display: "flex",
    justifyContent: "space-between",
  },
});

const LOWER_LIMIT = "下限なし";
const UPPER_LIMIT = "上限なし";

const formSchema = z.object({
  year: z.object({
    start: z.number().or(z.enum([LOWER_LIMIT]).optional().default(LOWER_LIMIT)),
    end: z.number().or(z.enum([UPPER_LIMIT]).optional().default(UPPER_LIMIT)),
  }),
  areas: z.array(z.string()).optional().default([]),
});

type FormType = z.infer<typeof formSchema>;
const form_id = "edit-result-view-filter-fields";

export const EditResultViewFilterFields = (): JSX.Element => {
  const styles = useStyles();

  const [areaItems, setAreaItems] = useState<(string | null)[]>([]);

  const { register, handleSubmit, watch, setValue } = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      areas: [],
    },
  });

  const onSubmit = handleSubmit(() => {
    //
  });

  const resultView = useAtomValue(selectedResultViewAtom);

  useEffect(() => {
    // 地域を取得する処理
    (async () => {
      if (!resultView?.data_set_result_id) return;
      const res = await window.ipcRenderer.invoke("readDataSetArea", {
        dataSetResultId: resultView.data_set_result_id,
      });

      /** @todo parse xml(readDataSetAreaが仮でxmlを返すため必要な処理)・ローカルで読むようになったらいらなくなる予定 */
      const parser = new DOMParser();
      if (!res) return;
      const xml = parser.parseFromString(res, "text/xml");
      const citiesList = Array.from(xml.querySelectorAll("city")).map(
        (city) => {
          return city.textContent;
        },
      );

      setAreaItems(citiesList);
    })().catch(console.error);
  }, [resultView]);

  const areas = watch("areas");

  return (
    <form className={styles.form} id={form_id} onSubmit={onSubmit}>
      <Fieldset>
        <FieldLegend>フィルター</FieldLegend>

        <Field label="期間">
          <div className={styles.year}>
            <Select
              {...register("year.start", {
                setValueAs: (v: FormType["year"]["start"]) =>
                  v === LOWER_LIMIT ? v : Number(v),
              })}
            >
              <option value={LOWER_LIMIT}>{LOWER_LIMIT}</option>
              {[...Array(5)]
                .map((_, i) => new Date().getFullYear() - i)
                .reverse()
                .map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
            </Select>
            <span>〜</span>
            <Select
              {...register("year.end", {
                setValueAs: (v: FormType["year"]["end"]) =>
                  v === UPPER_LIMIT ? v : Number(v),
              })}
            >
              <option value={UPPER_LIMIT}>{UPPER_LIMIT}</option>
              {[...Array(5)]
                .map((_, i) => new Date().getFullYear() - i)
                .reverse()
                .map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
            </Select>
          </div>
        </Field>

        <Field label="地域">
          <div className={styles.area}>
            <div>
              {areas.map((item, inedx) =>
                areas.length - 1 === inedx ? (
                  <Text key={item}>{item}</Text>
                ) : (
                  <Text key={item}>
                    {item}
                    <span>/</span>
                  </Text>
                ),
              )}
            </div>

            <Dialog>
              <DialogTrigger disableButtonEnhancement>
                <Button>変更</Button>
              </DialogTrigger>
              <DialogSurface>
                <DialogBody>
                  <DialogTitle>地域でフィルター</DialogTitle>
                  <DialogContent>
                    {areaItems.map(
                      (item) =>
                        item && (
                          <Checkbox
                            key={item}
                            checked={areas?.includes(item)}
                            id={item}
                            label={item}
                            value={item}
                            {...register("areas")}
                          />
                        ),
                    )}
                  </DialogContent>
                  <DialogActions position="start">
                    <Button
                      appearance="subtle"
                      onClick={() => setValue("areas", [])}
                    >
                      すべてクリア
                    </Button>
                  </DialogActions>
                  <DialogActions position="end">
                    <DialogTrigger>
                      <Button appearance="primary">変更内容を適用</Button>
                    </DialogTrigger>
                  </DialogActions>
                </DialogBody>
              </DialogSurface>
            </Dialog>
          </div>
        </Field>
      </Fieldset>

      <Button type="submit">フィルターを実行</Button>
    </form>
  );
};
