import { makeStyles, tokens } from "@fluentui/react-components";
import { FormNormalization } from "../../components/form-normalization";

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

  return (
    <div className={styles.root}>
      <h2 className={styles.heading}>データ正規化処理</h2>
      <div>
        <FormNormalization
          onSave={(parameters) => {
            console.log(parameters);
          }}
          value={{
            settings: {
              referencedData: "waterSupply",
              referenceDate: "2021-01-01",
              advanced: {
                similarityThreshold: 0.8,
                nGramSize: 2,
                joiningMethod: "intersection",
              },
            },
            data: {
              residentRegister: {
                path: "path/to/residentRegister.csv",
                columns: {
                  householdCode: "",
                  age: "",
                  gender: "",
                  address: "",
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
