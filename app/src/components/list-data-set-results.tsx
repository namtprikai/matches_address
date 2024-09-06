import {
  Body1,
  Caption1,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { type SelectDataSetResult } from "../schema";
import { formatDate } from "../utils/format-date";
import { Button } from "./ui/button";

type Props = {
  dataSetResults: SelectDataSetResult[];
  onClickItem?: (dataSetResult: SelectDataSetResult) => void;
};

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
  },
  button: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: tokens.spacingVerticalXS,
  },
  term: {
    display: "flex",
    /** @fixme TokensからPrimaryカラーにアクセスする方法がわからない */
    backgroundColor: "#E9EAF6",
    color: "#6264A7",
    padding: tokens.spacingHorizontalXS,
    borderRadius: tokens.borderRadiusMedium,
  },
});

export const ListDataSetResults = ({
  dataSetResults,
  onClickItem,
}: Props): JSX.Element => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      {dataSetResults.map((item) => (
        <Button
          key={item.id}
          appearance="subtle"
          className={styles.button}
          onClick={() => onClickItem && onClickItem(item)}
          shape="square"
        >
          <Body1>{item.title}</Body1>
          <Caption1 className={styles.term}>
            {/** @todo created_atではなく作成年度あるいは基準日を表示することになる想定  */}
            {formatDate(item.created_at, "YYYY/MM/DD")}
          </Caption1>
        </Button>
      ))}
    </div>
  );
};
