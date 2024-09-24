import { useState } from "react";
import {
  Checkbox,
  Dialog,
  DialogActions,
  DialogTrigger,
  makeStyles,
} from "@fluentui/react-components";
import { type FetchAreaGroupsArg } from "../ipc-main-listeners/fetch-area-groups";
import { useFetchAreaGroups } from "../hooks/use-fetch-area-groups";
import { Field } from "./ui/field";
import { Button } from "./ui/button";
import { DialogSurface } from "./ui/dialog-surface";
import { DialogBody } from "./ui/dialog-body";

const useStyles = makeStyles({
  checkBoxOption: {
    height: "300px",
    overflowX: "scroll",
    display: "flex",
    flexWrap: "wrap",
  },
  dialogSurface: {},
  dialogBody: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "16px",
  },
});

export type AreaFilterFormProps = {
  areas: string[];
  onSave: (value: string[]) => void;
} & FetchAreaGroupsArg;

export const AreaFilterForm = (props: AreaFilterFormProps): JSX.Element => {
  const { data } = useFetchAreaGroups({
    dataSetResultId: props.dataSetResultId,
    unit: props.unit,
  });

  const [open, setOpen] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<string[]>(props.areas);

  const handleClick = (): void => {
    props.onSave(selectedAreas);
  };

  const styles = useStyles();

  return (
    <Field label="地域">
      <div>
        <div>
          {props.areas.length === 0
            ? "地域を選択してください"
            : props.areas.map((area) => <p key={area}>{area}</p>)}
        </div>
        <div>
          <Button
            onClick={() => {
              setOpen(true);
            }}
          >
            変更
          </Button>
        </div>
      </div>
      <Dialog
        onOpenChange={() => {
          setOpen((prev) => !prev);
        }}
        open={open}
      >
        <DialogSurface className={styles.dialogSurface}>
          <DialogBody className={styles.dialogBody}>
            <div className={styles.checkBoxOption}>
              {data?.map((area, index) => (
                <div key={index}>
                  <Checkbox
                    checked={selectedAreas.includes(area)}
                    label={area}
                  />
                </div>
              ))}
            </div>
            <DialogActions>
              <Button onClick={handleClick}>保存</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </Field>
  );
};
