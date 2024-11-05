import { makeStyles, tokens } from "@fluentui/react-components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormNormalization } from "../../components/form-normalization";
import { type NormalizationParameters } from "../../@types/normalization";
import { getDefaultNormalizationParameter } from "../../utils/get-default-normalization-parameter";
import { Button } from "../../components/ui/button";

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
  const navigator = useNavigate();
  const [parameters, setParameters] = useState<NormalizationParameters>(
    getDefaultNormalizationParameter,
  );

  const execE001 = async (): Promise<void> => {
    const result = await window.ipcRenderer.invoke("execE001", {
      parameters,
    });
    if (result) {
      navigator("/job");
    }
  };
  const styles = useStyles();

  return (
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
        <Button appearance="primary" onClick={execE001} size="medium">
          開始する
        </Button>
      </div>
    </div>
  );
}
