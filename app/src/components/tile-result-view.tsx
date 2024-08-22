import { ArrowDownloadFilled } from "@fluentui/react-icons";
import {
  Button,
  Card,
  CardHeader,
  type CardProps,
  makeStyles,
  mergeClasses,
  Subtitle2,
  tokens,
} from "@fluentui/react-components";
import { type data_set_results, type result_views } from "../schema";
import { THEME_COLORS } from "../config/theme-colors";
import { TileViewStyle } from "./tile-view-style";
type ResultViews = typeof result_views.$inferSelect;
type DataSetResults = typeof data_set_results.$inferSelect;

type Props = CardProps & {
  resultView: ResultViews;
  dataSetResult: DataSetResults | null;
};

const useStyles = makeStyles({
  selected: {
    border: `2px solid ${THEME_COLORS.primary}`,
  },
  cardSurface: {
    border: `2px solid transparent`,
    transition: "border,background-color 0.2s",
    boxShadow: tokens.shadow16,
    // border分を引いている
    padding: `calc(${tokens.spacingHorizontalXXL} - 2px) calc(${tokens.spacingVerticalXXL} - 2px)`,
    gap: tokens.spacingVerticalXL,
  },
  cardHeaderSubtle: {
    padding: `${tokens.spacingHorizontalXXS} ${tokens.spacingVerticalXXS}`,
    border: "none",
    minWidth: "24px",
    minHeight: "24px",
  },
});

export const TileResultView = ({
  resultView,
  dataSetResult,
  selected,
  ...cardProps
}: Props): JSX.Element => {
  const styles = useStyles();

  return (
    <Card
      {...cardProps}
      className={mergeClasses(styles.cardSurface, selected && styles.selected)}
    >
      <CardHeader
        action={
          <Button
            appearance="subtle"
            className={styles.cardHeaderSubtle}
            icon={<ArrowDownloadFilled />}
          />
        }
        header={
          <Subtitle2>{`${resultView.title || "タイトル未入力"}`}</Subtitle2>
        }
      />
      {dataSetResult === null ? (
        <div>データセットが選択されていません</div>
      ) : (
        <TileViewStyle
          // FIXME:  仮の値を入れている。本来であれば動的に変更可能
          chartOptions={{
            type: "buildings",
            x: "id",
            y: "rank",
          }}
          dataSetResults={dataSetResult}
          style={resultView.style}
        />
      )}
    </Card>
  );
};
