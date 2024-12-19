/**
 * @description
 * #### 言語とツールチップをマッピングするためのファイル
 * - app/src/components/ui/text-with-tooltip.tsx とセットで利用することを想定している
 * - ツールチップの内容を変更する場合は、このファイルを編集する
 * - オブジェクトの階層構成は /pages, /components 配下と同期させる
 * - pages[model/create] のように、pages, components 以下のファイルパスを表現する(オブジェクトの3階層目には必ず画面の言語Keyがくる)
 * - 言語keyは、labelを必須・descriptionを任意で持つ
 */
export const lang = {
  pages: {
    "model/create": {
      subtitle1: {
        label: "① ファイルをインポート",
        description: `空き家確率を推定するモデルを構築するため、「名寄せ済みデータセット」を選択します。名寄せ済みのデータセットが無い場合には、「名寄せ処理」を実施してください。`,
      },
      subtitle2: {
        label: "② 説明変数に使うカラムの選択",
        description: `①で名寄せ済みデータセットを選択すると、説明変数に使うカラムを選択できます。名寄せ処理済みデータセットのうち、説明変数に必ず使うカラムはすでに選択されます。それ以外に機械学習に使いたい情報があれば、カラムを選択してください。

※「説明変数」とは、機械学習によって空き家確率を推定するための情報のことです。
（例）「水道閉開栓状態と水道使用量から、空き家かどうかを推定したい」 → 「水道開閉栓状況」と「水道使用量」を説明変数として選択します。`,
      },
      subtitle3: {
        label: "③ パラメーターを変更",
        description: `機械学習によるモデル構築の精度を調整するパラメータを変更できます。特に変更の必要がない場合には、デフォルトの状態のままにしてください。`,
      },
    },
    "evaluation/create": {
      subtitle1: {
        label: "① 利用するモデルを選択",
        description: `空き家確率の推定に使う構築済みモデルを選択してください。モデルの構築を行ってない場合には、「モデル構築」から処理を実行してください。`,
      },
      subtitle2: {
        label: "② 分析対象のデータを選択",
        description: `空き家確率を推定したい時点のデータセットを選択してください。最新の名寄せ処理済みデータセットが無い場合には、「名寄せ処理」から処理を実行してください。`,
      },
      subtitle3: {
        label: "③ 地域集計用データをアップロード",
        description: `【任意】小学校区や都市計画図等、空き家確率の推定を分析する単位となるデータを選択してください。データの作成方法等については、操作マニュアルを参照してください。`,
      },
      column1: {
        label: "地域IDカラム",
        description: `【必須】インプットしたデータのなかから、用途地域ごとに固有につけられている番号/IDを示すカラム（項目名）を選択してください。`,
      },
      column2: {
        label: "地域名称カラム",
        description: `【必須】インプットデータしたデータのなかから、用途地域の名称を示すカラム（項目名）を選択してください。`,
      },
      subtitle4: {
        label: "④ 高度な設定",
        description: `【空き家確率推定の精度を調整するパラメータを変更できます。特に変更の必要がない場合には、デフォルトの状態のままにしてください`,
      },
    },
  },
  components: {
    "dialog-model-advanced": {
      test_size: {
        label: "Test Size",
        description: `（Test Size）モデルの評価に使う「テストデータ」の割合のこと。データを学習用（トレーニングデータ）と評価用（テストデータ）に分ける際、テストデータが全体のどれくらいの割合かを指定します。`,
      },
      n_splits: {
        label: "N Splits",
        description: `（Number of Splits）データを分割して検証する際の分割回数。特に「クロスバリデーション（交差検証）」で、データを何回分けて学習と評価を繰り返すかを指定します。`,
      },
      undersample: {
        label: "Undersample",
        description: `（Undersampling）不均衡なデータ（例: 一部のクラスが少ない場合）に対して、多すぎるクラスのデータを減らす処理を行うかどうかを設定します。`,
      },
      undersample_ratio: {
        label: "Undersample Ratio",
        description: `（Undersample Ratio）アンダーサンプリングを行う際、多すぎるクラスをどの程度まで減らすかを指定する比率を設定します。`,
      },
      threshold: {
        label: "Threshold",
        description: `（Threshold）予測結果を分類するための基準となる値。特に確率を出力するモデルで、「どの確率以上を陽性と判断するか」を決める値を指定します。`,
      },
      hyperparameter_flag: {
        label: "Hyperparameter Flag",
        description: `（Hyperparameter Tuning）モデルの性能を上げるために、ハイパーパラメータ（モデルの設定値）を自動的に調整する作業を行うかどうかを設定します。その代わり、処理時間が長くなります。`,
      },
      n_trials: {
        label: "N Trials",
        description: `（Number of Trials for Hyperparameter Tuning）ハイパーパラメータを調整する際、異なる設定を何回試すかを指定する値を設定します。回数が多いほど処理時間が長くなります。`,
      },
      lambda_l1: {
        label: "Lambda L1",
        description: `（Lambda L1）不要な特徴量をゼロに近づけることで、モデルをシンプルにするL1正規化の強さを設定します。`,
      },
      lambda_l2: {
        label: "Lambda L2",
        description: `（Lambda L2）モデルの重みが大きくなりすぎないようにペナルティを与えるL2正規化の強さを設定します。`,
      },
      num_leaves: {
        label: "Num Leaves",
        description: `（Number of Leaves）決定木や勾配ブースティングモデルで、1つの木の中で最終的な分岐先（リーフ）の数を指定します。`,
      },
      feature_fraction: {
        label: "Feature Fraction",
        description: `（Feature Fraction）モデルを作るときに、全ての特徴量（フィーチャー）のうち、どれくらいの割合を使用するかを指定します。`,
      },
      bagging_fraction: {
        label: "Bagging Fraction",
        description: `（Bagging Fraction）バギング（Bagging：標本抽出）を行う際、全体のデータからどれだけの割合をランダムに選んで使うかを指定します。`,
      },
      bagging_freq: {
        label: "Bagging Freq",
        description: `（Bagging Frequency）勾配ブースティングモデルで、何回ごとにバギングを行うかを指定します。`,
      },
    },
  },
};
