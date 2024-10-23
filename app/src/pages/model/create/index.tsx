import {
  Body1,
  Card,
  Dialog,
  DialogTrigger,
  makeStyles,
  Subtitle2,
  tokens,
} from "@fluentui/react-components";
import { ArrowLeftFilled } from "@fluentui/react-icons";
import { Button } from "../../../components/ui/button";
import { DialogSurface } from "../../../components/ui/dialog-surface";
import { DialogBody } from "../../../components/ui/dialog-body";
import { DialogTitle } from "../../../components/ui/dialog-title";
import { DialogContent } from "../../../components/ui/dialog-content";
import { DialogActions } from "../../../components/ui/dialog-actions";

const useStyles = makeStyles({
  root: {
    display: "flex",
    gap: tokens.spacingVerticalXXL,
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  },
  heading: {
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase600,
    height: "34px",
  },
  contents: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXL,
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: tokens.spacingHorizontalXL,
    height: "68px",
  },
});

export const ModelCreate = (): JSX.Element => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>
        <a href="#model">
          <ArrowLeftFilled />
        </a>
        モデル構築
      </h2>

      <div className={styles.contents}>
        <Card>
          <Subtitle2>① ファイルをインポート</Subtitle2>
          <div>sample.csv</div>
        </Card>

        <Card>
          <Subtitle2>② 説明変数に使うカラムの選択</Subtitle2>
          <div>住所, ほげ, ほげ</div>
          <div>
            <Button appearance="primary">カラムを変更</Button>
          </div>
        </Card>

        <Card>
          <Subtitle2>③ パラメーターを変更</Subtitle2>
          <div>項目</div>
          <div>
            <Button appearance="transparent">高度な設定を変更</Button>
          </div>
        </Card>
      </div>

      <div className={styles.footer}>
        <Dialog>
          <DialogTrigger>
            <Button
              appearance="primary"
              onClick={async () => {
                await window.ipcRenderer.invoke("buildModel", {
                  foo: "bar",
                });
              }}
              size="large"
            >
              モデル作成
            </Button>
          </DialogTrigger>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>モデル作成処理を開始しました</DialogTitle>
              <DialogContent>
                <Body1>
                  前処理が完了するまで一定の時間がかかります
                  <br />
                  ステータスは「非同期処理一覧画面」で確認できます。
                </Body1>
              </DialogContent>
              <DialogActions>
                <a href="#job">
                  <Button appearance="primary">非同期処理一覧画面へ</Button>
                </a>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>
    </div>
  );
};
