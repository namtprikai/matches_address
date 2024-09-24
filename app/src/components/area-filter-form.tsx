import { Fragment, useState } from "react";
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
import { DialogTitle } from "./ui/dialog-title";

const useStyles = makeStyles({
  options: {
    height: "300px",
    overflowX: "scroll",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gridAutoRows: "1fr",
    width: "100%",
  },
  dialogSurface: {},
  dialogBody: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "16px",
  },
  selectedOptions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px 8px",
    fontSize: "12px",
  },
  layout: {
    display: "flex",
    gap: "4px",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  editButton: {
    minWidth: "50px",
    fontSize: "12px",
  },
  noSelectedLabel: {
    lineHeight: "32px",
    fontSize: "12px",
  },
});

type AreaFilterFormProps = {
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
      <div className={styles.layout}>
        <div>
          {props.areas.length === 0 ? (
            <p className={styles.noSelectedLabel}>地域を選択してください</p>
          ) : (
            <div className={styles.selectedOptions}>
              {props.areas.map((area, index) => (
                <Fragment key={area}>
                  {index !== 0 && <span>/</span>}
                  <span key={area}>{area}</span>
                </Fragment>
              ))}
            </div>
          )}
        </div>
        <div>
          <Button
            className={styles.editButton}
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
          <DialogTitle>地域を選択</DialogTitle>
          <DialogBody className={styles.dialogBody}>
            <div className={styles.options}>
              {data?.map((area, index) => (
                <div key={index}>
                  <Checkbox
                    checked={selectedAreas.includes(area)}
                    id={area}
                    label={area}
                    name={area}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAreas((prev) => {
                          if (prev.includes(area)) {
                            return prev;
                          }
                          return [...prev, area].sort();
                        });
                      } else {
                        setSelectedAreas((prev) =>
                          prev
                            .filter((selectedArea) => selectedArea !== area)
                            .sort(),
                        );
                      }
                    }}
                  />
                </div>
              ))}
            </div>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="primary" onClick={handleClick}>
                  保存
                </Button>
              </DialogTrigger>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </Field>
  );
};
