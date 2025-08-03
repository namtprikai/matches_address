import {
  makeStyles,
  tokens,
  Dialog,
  Field,
  Radio,
  RadioGroup,
  DialogTrigger,
  Option,
} from "@fluentui/react-components";
import { useState } from "react";
import { ArrowDownloadRegular } from "@fluentui/react-icons";
import { type ReferenceDate } from "../../../../ipc-main-listeners/select-reference-dates";
import { Dropdown } from "../../../ui/dropdown";
import { OUTPUT_FILE_TYPES } from "../../../../config/file-types";
import { type SelectDataSetResult } from "../../../../schema";
import { DialogBody } from "../../../ui/dialog-body";
import { DialogTitle } from "../../../ui/dialog-title";
import { DialogContent } from "../../../ui/dialog-content";
import { DialogActions } from "../../../ui/dialog-actions";
import { DialogSurface } from "../../../ui/dialog-surface";
import { useDialogState } from "../../../../hooks/use-dialog-state";
import { Button } from "../../../ui/button";
import { type ResultDataSetUnit } from "../types";
import { OUTPUT_COORDINATES } from "../../../../config/output-coordinates";

const useStyles = makeStyles({
  radioGroup: {
    marginTop: tokens.spacingVerticalM,
    marginLeft: "-8px",
  },
  dropdown: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
    "& > label": {
      fontSize: "12px",
    },
  },
});

export function DownloadDialog({
  referenceDates,
  dataSetResultId,
  onSubmit,
}: {
  referenceDates: ReferenceDate[];
  dataSetResultId: SelectDataSetResult["id"];
  onSubmit: () => void;
}): JSX.Element {
  const styles = useStyles();
  const { isOpen, setIsOpen } = useDialogState(false);
  const [selectedUnit, setSelectedUnit] =
    useState<ResultDataSetUnit>("building");
  const [selectedFileType, setSelectedFileType] = useState<string>(
    OUTPUT_FILE_TYPES[0].type,
  );
  const [selectedCoordinate, setSelectedCoordinate] = useState(
    OUTPUT_COORDINATES[0].code,
  );
  const [selectedReferenceDate, setSelectedReferenceDate] = useState<string>(
    referenceDates[0],
  );

  const handleDownload = async (): Promise<void> => {
    await window.ipcRenderer
      .invoke("exportData", {
        data: {
          parameterType: "export",
          data_set_results_id: dataSetResultId,
          target_unit: selectedUnit,
          output_file_type: selectedFileType,
          output_coordinate: selectedCoordinate,
          reference_date: selectedReferenceDate,
        },
      })
      .then(onSubmit);
  };

  return (
    <Dialog onOpenChange={(_, { open }) => setIsOpen(open)} open={isOpen}>
      <DialogTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          aria-label="ダウンロード"
          icon={<ArrowDownloadRegular />}
          onClick={(e) => e.stopPropagation()}
        />
      </DialogTrigger>
      <DialogSurface onClick={(e) => e.stopPropagation()}>
        <DialogBody>
          <DialogTitle>データのダウンロード</DialogTitle>
          <DialogContent>
            <div>
              <p>
                空き家推定結果データは以下の2つのデータが含まれます。
                どちらか選択してください。
              </p>
              <Field className={styles.radioGroup}>
                <RadioGroup
                  defaultValue={selectedUnit}
                  onChange={(_, data) =>
                    setSelectedUnit(data.value as ResultDataSetUnit)
                  }
                >
                  <Radio label="建物単位" value="building" />
                  <Radio label="地域単位" value="area" />
                </RadioGroup>
              </Field>
            </div>

            <div className={styles.dropdown}>
              <label id="output-file-type">出力ファイル形式</label>
              <Dropdown
                aria-labelledby="output-file-type"
                defaultSelectedOptions={[OUTPUT_FILE_TYPES[0].type]}
                defaultValue={OUTPUT_FILE_TYPES[0].name}
                onOptionSelect={(_, data) =>
                  data.optionValue && setSelectedFileType(data.optionValue)
                }
              >
                {OUTPUT_FILE_TYPES.map((option) => (
                  <Option
                    key={option.type}
                    text={option.name}
                    value={option.type}
                  >
                    {option.name}
                  </Option>
                ))}
              </Dropdown>
            </div>
            <div className={styles.dropdown}>
              <label id="output-coordinate">出力座標系</label>
              <Dropdown
                aria-labelledby="output-coordinate"
                defaultSelectedOptions={[OUTPUT_COORDINATES[0].code]}
                defaultValue={OUTPUT_COORDINATES[0].name}
                onOptionSelect={(_, data) =>
                  data.optionValue && setSelectedCoordinate(data.optionValue)
                }
              >
                {OUTPUT_COORDINATES.map((option) => (
                  <Option
                    key={option.code}
                    text={option.name}
                    value={option.code}
                  >
                    {option.name}
                  </Option>
                ))}
              </Dropdown>
            </div>
            <div className={styles.dropdown}>
              <label id="reference-date">推定日</label>
              {selectedReferenceDate && (
                <Dropdown
                  aria-labelledby="reference-date"
                  defaultSelectedOptions={[selectedReferenceDate]}
                  defaultValue={selectedReferenceDate}
                  onOptionSelect={(_, data) =>
                    setSelectedReferenceDate(data.optionValue || "")
                  }
                >
                  {referenceDates?.map((date) => (
                    <Option key={date} value={date}>
                      {date}
                    </Option>
                  ))}
                </Dropdown>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              appearance="primary"
              onClick={() => {
                void handleDownload();
                setIsOpen(false);
              }}
              size="medium"
            >
              ダウンロード準備を開始する
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
