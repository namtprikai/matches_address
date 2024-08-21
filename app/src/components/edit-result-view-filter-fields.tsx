import {
  Checkbox,
  Dialog,
  DialogContent,
  DialogTrigger,
  makeStyles,
  Text,
} from "@fluentui/react-components";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
  area: {
    display: "flex",
    justifyContent: "space-between",
  },
});

/** 仮 */
const AREA_ITEMS = [
  "中区",
  "中村区",
  "中川区",
  "昭和区",
  "瑞穂区",
  "熱田区",
  "千種区",
  "東区",
  "北区",
  "西区",
  "名東区",
  "港区",
  "南区",
  "守山区",
  "天白区",
  "緑区",
  "北名古屋市",
  "弥富市",
];

const formSchema = z.object({
  period: z.string().optional() /** 仮: 範囲指定になるらしい */,
  areas: z.array(z.string()).optional().default([]),
});

type FormType = z.infer<typeof formSchema>;
const form_id = "edit-result-view-filter-fields";

export const EditResultViewFilterFields = (): JSX.Element => {
  const styles = useStyles();

  const { register, handleSubmit, watch, setValue } = useForm<FormType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      areas: [],
    },
  });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

  const areas = watch("areas");

  return (
    <form id={form_id} onSubmit={onSubmit}>
      <Fieldset>
        <FieldLegend>フィルター</FieldLegend>

        <Field label="期間">
          <Select
            {...register("period")}
            defaultValue={new Date().getFullYear()}
          >
            {[...Array(30)]
              .map((_, i) => new Date().getFullYear() - i)
              .reverse()
              .map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
          </Select>
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
                    {AREA_ITEMS.map((item) => (
                      <Checkbox
                        key={item}
                        checked={areas?.includes(item)}
                        id={item}
                        label={item}
                        value={item}
                        {...register("areas")}
                      />
                    ))}
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
