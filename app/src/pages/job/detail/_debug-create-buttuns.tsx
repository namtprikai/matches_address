import { Button, Caption1Strong } from "@fluentui/react-components";

export const DebugCreateButtons = (): JSX.Element => {
  return (
    <div style={{ display: "grid", gap: 4 }}>
      <Caption1Strong>非同期処理疑似データ作成(debug)</Caption1Strong>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2px" }}>
        <Button
          onClick={() => {
            window.ipcRenderer
              .invoke("_debugCreateJob", {
                job: "処理開始",
                jobType: "preprocess",
                parameters: {},
              })
              .catch(console.error);
          }}
          size="small"
        >
          前処理開始
        </Button>
        <Button
          onClick={() => {
            window.ipcRenderer
              .invoke("_debugCreateJob", {
                job: "処理完了",
                jobType: "preprocess",
              })
              .catch(console.error);
          }}
          size="small"
        >
          前処理完了
        </Button>
        <Button
          onClick={() => {
            window.ipcRenderer
              .invoke("_debugCreateJob", {
                job: "処理失敗",
                jobType: "preprocess",
              })
              .catch(console.error);
          }}
          size="small"
        >
          前処理失敗
        </Button>
        <Button
          onClick={() => {
            window.ipcRenderer
              .invoke("_debugCreateJob", {
                job: "処理開始",
                jobType: "ml",
                parameters: {
                  output_path: "output.csv",
                  database_path: "database.db",
                  input_path: "test.csv",
                  settings: {
                    explanatory_variables: ["水道番号", "メータ番号"],
                    advanced: {
                      test_size: 0.3,
                      n_splits: 3,
                      undersample: true,
                      undersample_ratio: 3,
                      threshold: 0.3,
                      hyperparameter_flag: true,
                      n_trials: 100,
                      lambda_l1: 0,
                      lambda_l2: 0,
                      num_leaves: 31,
                      feature_fraction: 1,
                      bagging_fraction: 1,
                      bagging_freq: 0,
                      min_data_in_leaf: 20,
                    },
                  },
                },
              })
              .catch(console.error);
          }}
          size="small"
        >
          モデル作成開始
        </Button>
        <Button
          onClick={() => {
            window.ipcRenderer
              .invoke("_debugCreateJob", {
                job: "処理完了",
                jobType: "ml",
              })
              .catch(console.error);
          }}
          size="small"
        >
          モデル作成完了
        </Button>
        <Button
          onClick={() => {
            window.ipcRenderer
              .invoke("_debugCreateJob", {
                job: "処理失敗",
                jobType: "ml",
              })
              .catch(console.error);
          }}
          size="small"
        >
          モデル作成失敗
        </Button>
        <Button
          onClick={() => {
            window.ipcRenderer
              .invoke("_debugCreateJob", {
                job: "処理開始",
                jobType: "result",
                // parameters:,
              })
              .catch(console.error);
          }}
          size="small"
        >
          判定開始
        </Button>
        <Button
          onClick={() => {
            window.ipcRenderer
              .invoke("_debugCreateJob", {
                job: "処理完了",
                jobType: "result",
              })
              .catch(console.error);
          }}
          size="small"
        >
          判定完了
        </Button>
        <Button
          onClick={() => {
            window.ipcRenderer
              .invoke("_debugCreateJob", {
                job: "処理失敗",
                jobType: "result",
              })
              .catch(console.error);
          }}
          size="small"
        >
          判定失敗
        </Button>
      </div>
    </div>
  );
};
