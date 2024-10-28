import {
  Card,
  makeStyles,
  Subtitle2,
  tokens,
  typographyStyles,
} from "@fluentui/react-components";
import { DeleteRegular, AddRegular } from "@fluentui/react-icons";
import { Button } from "../../components/ui/button";

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
  restartButton: {
    backgroundColor: "#6264A7",
    color: "#fff",
    borderRadius: "100px",
    padding: `${tokens.spacingVerticalMNudge} ${tokens.spacingHorizontalL}`,
    height: "40px",
  },
  file: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
  },
  deleteIconWrapper: {
    width: "32px",
    height: "32px",
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ":hover": {
      cursor: "pointer",
    },
  },
  button: {
    width: "130px",
  },
  text: typographyStyles.caption1Strong,
});

export const JobEvaluation = (): JSX.Element => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>空き家判定</h2>

      <div className={styles.contents}>
        <Card>
          <Subtitle2>① ファイルをインポート</Subtitle2>
          <div className={styles.file}>
            <a href="">sample.csv</a>
            <span className={styles.deleteIconWrapper}>
              <DeleteRegular fontSize={16} />
            </span>
          </div>
        </Card>

        <Card>
          <Subtitle2>② 分析対象のデータを選択</Subtitle2>
          <div className={styles.file}>
            <a href="">sample.csv</a>
            <span className={styles.deleteIconWrapper}>
              <DeleteRegular fontSize={16} />
            </span>
          </div>
          <Button
            appearance="outline"
            className={styles.button}
            icon={<AddRegular />}
          >
            <span className={styles.text}>データを追加</span>
          </Button>
        </Card>
      </div>

      <div className={styles.footer}>
        <Button className={styles.restartButton}>分析開始</Button>
      </div>
    </div>
  );
};
