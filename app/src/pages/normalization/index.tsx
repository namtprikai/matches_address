import {
  Dialog,
  DialogTrigger,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dismiss24Regular } from "@fluentui/react-icons";
import { FormNormalization } from "../../components/form-normalization";
import { type NormalizationParameters } from "../../@types/normalization";
import { defaultNormalizationParameters } from "../../utils/default-normalization-parameters";
import { Button } from "../../components/ui/button";
import { DialogSurface } from "../../components/ui/dialog-surface";
import { DialogBody } from "../../components/ui/dialog-body";
import { DialogTitle } from "../../components/ui/dialog-title";
import { DialogContent } from "../../components/ui/dialog-content";
import { DialogActions } from "../../components/ui/dialog-actions";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gap: tokens.spacingVerticalL,
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
  },
  heading: {
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase600,
  },
  content: {
    display: "block",
    minHeight: "300px",
  },
  stickyWrapper: {
    position: "relative",
    width: "100%",
    height: "100vh",
    overflowY: "scroll",
  },
  footerActions: {
    position: "sticky",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: `${tokens.spacingVerticalMNudge} ${tokens.spacingHorizontalXXL}`,
    display: "flex",
    justifyContent: "flex-end",
  },
});

export function Normalization(): JSX.Element {
  const styles = useStyles();
  const navigator = useNavigate();
  const [parameters, setParameters] = useState<NormalizationParameters>(
    defaultNormalizationParameters,
  );

  const handleClick = async (): Promise<void> => {
    // TODO: jobの登録はpython側で行うため後で削除する
    await window.ipcRenderer.invoke("_debugInsertJobs", {
      parameters,
      type: "preprocess",
    });

    // TODO: parametersが正しいかどうかのバリデーションを行う必要がある
    await window.ipcRenderer.invoke("execE001", {
      parameters,
    });
  };

  return (
    <>
      <div className={styles.stickyWrapper}>
        <div className={styles.root}>
          <h2 className={styles.heading}>データ正規化処理</h2>
          <div>
            <FormNormalization
              onSave={(parameters) => {
                setParameters(parameters);
              }}
              value={parameters}
            />
          </div>
        </div>
        <div className={styles.footerActions}>
          <Dialog>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="primary" onClick={handleClick} size="medium">
                開始する
              </Button>
            </DialogTrigger>
            <DialogSurface>
              <DialogBody>
                <DialogTitle
                  action={
                    <DialogTrigger action="close">
                      <Button
                        appearance="subtle"
                        aria-label="close"
                        icon={
                          <Dismiss24Regular
                            color={tokens.colorNeutralForeground1}
                            strokeWidth={2}
                          />
                        }
                      />
                    </DialogTrigger>
                  }
                >
                  データ正規化処理を開始しました
                </DialogTitle>
                <DialogContent>
                  前処理が完了するまで一定の時間がかかります。
                  <br />
                  ステータスは「非同期処理一覧画面」で確認できます
                </DialogContent>
                <DialogActions>
                  <DialogTrigger disableButtonEnhancement>
                    <Button appearance="outline">キャンセル</Button>
                  </DialogTrigger>
                  <Button
                    appearance="primary"
                    onClick={() => {
                      navigator("/job");
                    }}
                  >
                    非同期処理一覧画面へ
                  </Button>
                </DialogActions>
              </DialogBody>
            </DialogSurface>
          </Dialog>
        </div>
      </div>
    </>
  );
}
