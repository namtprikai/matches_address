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
import { type data_set_results } from "../schema";
import { THEME_COLORS } from "../config/theme-colors";
import { type SelectResultViewResponse } from "../ipc-main-listeners/select-result-view";
import { type Parameter } from "../@types/charts";
import { TileViewStyle } from "./tile-view-style";
type DataSetResults = typeof data_set_results.$inferSelect;

type Props = CardProps & {
  resultView: SelectResultViewResponse;
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

  if (
    !resultView.parameters ||
    resultView.parameters.length === 0 ||
    !resultView.style ||
    !resultView.unit
  ) {
    return (
      <Card
        {...cardProps}
        className={mergeClasses(
          styles.cardSurface,
          selected && styles.selected,
        )}
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
        <div>未設定</div>
      </Card>
    );
  }

  const xAxisParameter = resultView.parameters.find(
    (parameter) => parameter.key === "xAxis",
  ) as Parameter;

  const yAxisParameter = resultView.parameters.find(
    (parameter) => parameter.key === "yAxis",
  ) as Parameter;

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
          resultId={dataSetResult.id}
          style={resultView.style}
          type={resultView.unit}
          // @ts-expect-error x, yの型に問題はないためスルー
          x={xAxisParameter.value}
          // @ts-expect-error x, yの型に問題はないためスルー
          y={yAxisParameter.value}
        />
      )}
    </Card>
  );
};
