import {
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Button,
  Checkbox,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  ArrowDownloadRegular,
  MoreHorizontalRegular,
  DeleteRegular,
} from "@fluentui/react-icons";
import { type ChangeEvent, useState } from "react";

const useStyles = makeStyles({
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalL,
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
  },
  button: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    "&:hover, &:active, &:focus, &:focus-within": {
      border: `1px solid ${tokens.colorNeutralStroke1Selected}`,
    },
  },
});

export type DatasetListProps = {
  dataSets: { name: string; date: string }[];
};

export function DatasetList({ dataSets }: DatasetListProps): JSX.Element {
  const styles = useStyles();
  const [selectedCount, setSelectedCount] = useState(0);

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setSelectedCount((prevCount) =>
      event.target.checked ? prevCount + 1 : prevCount - 1,
    );
  };

  return (
    <div>
      <div className={styles.header}>
        <Button appearance="primary">+ 新規アップロード</Button>
        <div className={styles.actions}>
          <span>{selectedCount}件選択中</span>
          <Button
            appearance="outline"
            className={styles.button}
            icon={<ArrowDownloadRegular />}
            shape="square"
          />
          <Button
            appearance="outline"
            className={styles.button}
            icon={<DeleteRegular />}
            shape="square"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell></TableHeaderCell>
            <TableHeaderCell>データセット名</TableHeaderCell>
            <TableHeaderCell>アップデート日</TableHeaderCell>
            <TableHeaderCell></TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dataSets.map((dataSet, index) => (
            <TableRow key={index}>
              <TableCell>
                <Checkbox onChange={handleCheckboxChange} />
              </TableCell>
              <TableCell>{dataSet.name}</TableCell>
              <TableCell>{dataSet.date}</TableCell>
              <TableCell>
                <Button
                  appearance="subtle"
                  aria-label="ダウンロード"
                  icon={<ArrowDownloadRegular />}
                />
                <Button
                  appearance="subtle"
                  aria-label="詳細メニュー"
                  icon={<MoreHorizontalRegular />}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
