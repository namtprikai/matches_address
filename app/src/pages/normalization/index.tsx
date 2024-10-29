import { makeStyles, tokens } from "@fluentui/react-components";
import { useState } from "react";
import { FormNormalization } from "../../components/form-normalization";
import { type NormalizationParameters } from "../../@types/normalization";
import { getDefaultNormalizationParameter } from "../../utils/get-default-normalization-parameter";

const useStyles = makeStyles({
  root: {
    display: "grid",
    gap: tokens.spacingVerticalL,
  },
  heading: {
    fontSize: tokens.fontSizeBase500,
    lineHeight: tokens.lineHeightBase600,
  },
  content: {
    display: "block",
    minHeight: "300px",
  },
});

export function Normalization(): JSX.Element {
  const styles = useStyles();
  const [parameters, setParameters] = useState<NormalizationParameters>(
    getDefaultNormalizationParameter,
  );

  return (
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
  );
}
