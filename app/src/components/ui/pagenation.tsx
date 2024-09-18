import {
  Caption1,
  Caption1Strong,
  makeStyles,
} from "@fluentui/react-components";
import { type UsePagenationReturnType } from "../../hooks/use-pagenation";
import { Button } from "./button";

const useStyles = makeStyles({
  root: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "8px",
  },
  limitPerPage: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
});

type Props = UsePagenationReturnType;

export const Pagenation = ({
  page,
  handlePageChange,
  limitPerPage,
  handleLimitPerPageChange,
}: Props): JSX.Element => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <Button
        disabled={page === 1}
        onClick={() => handlePageChange(page - 1)}
        shape="rounded"
        size="small"
      >
        前へ
      </Button>
      <Caption1>{page}ページ</Caption1>
      <Button
        // disabled={page === totalPages}
        onClick={() => handlePageChange(page + 1)}
        shape="rounded"
        size="small"
      >
        次へ
      </Button>

      <div className={styles.limitPerPage}>
        <Caption1Strong>表示件数</Caption1Strong>
        <select
          onChange={(e) => handleLimitPerPageChange(Number(e.target.value))}
          value={limitPerPage}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
};
