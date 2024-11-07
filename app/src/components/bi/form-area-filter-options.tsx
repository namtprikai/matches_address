import { memo } from "react";
import { Checkbox, makeStyles } from "@fluentui/react-components";
import { type FetchAreaGroupsArg } from "../../ipc-main-listeners/fetch-area-groups";
import { useFetchAreaGroups } from "../../hooks/use-fetch-area-groups";

const useStyles = makeStyles({
  options: {
    height: "300px",
    overflowX: "scroll",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gridAutoRows: "32px",
    width: "100%",
  },
});

type Props = FetchAreaGroupsArg & {
  searchText: string;
  selectedAreas: string[];
  onChange: (value: string[]) => void;
};

/**
 * 地域フィルタ用の選択肢表示用コンポーネント
 */
export const FormAreaFilterOptions = memo((props: Props) => {
  const { data } = useFetchAreaGroups({
    dataSetResultId: props.dataSetResultId,
    unit: props.unit,
  });

  const searchFilteredData = data?.filter(
    (area) => area.includes(props.searchText.trim().replace("　", "")), // 余計な空白や文字列の削除
  );

  const styles = useStyles();

  return (
    <div className={styles.options}>
      {searchFilteredData?.map((area, index) => {
        return (
          <div key={index}>
            <Checkbox
              checked={props.selectedAreas.includes(area)}
              id={area}
              label={area}
              name={area}
              onChange={(e) => {
                const data = (): string[] => {
                  if (e.target.checked) {
                    if (props.selectedAreas.includes(area)) {
                      return props.selectedAreas;
                    }
                    return [...props.selectedAreas, area].sort();
                  } else {
                    return props.selectedAreas
                      .filter((selectedArea) => selectedArea !== area)
                      .sort();
                  }
                };

                props.onChange(data());
              }}
            />
          </div>
        );
      })}
    </div>
  );
});

FormAreaFilterOptions.displayName = "AreaFilterFormOptions";
