import { memo, useDeferredValue, useEffect, useState } from "react";
import { type FetchAreaGroupsArg } from "../ipc-main-listeners/fetch-area-groups";
import { useFetchAreaGroups } from "../hooks/use-fetch-area-groups";
import { Checkbox, makeStyles } from "@fluentui/react-components";

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
  areas: string[];
  onChange: (value: string[]) => void;
};

export const AreaFilterFormOptions = memo((props: Props) => {
  const { data } = useFetchAreaGroups({
    dataSetResultId: props.dataSetResultId,
    unit: props.unit,
  });

  const [selectedAreas, setSelectedAreas] = useState<string[]>(props.areas);

  const searchFilteredData = data?.filter(
    (area) => area.includes(props.searchText.trim().replace("　", "")), // 余計な空白や文字列の削除
  );

  const styles = useStyles();

  useEffect(() => {
    props.onChange(selectedAreas);
  }, [selectedAreas]);

  return (
    <div className={styles.options}>
      {searchFilteredData?.map((area, index) => (
        <div key={index}>
          <Checkbox
            checked={selectedAreas.includes(area)}
            id={area}
            label={area}
            name={area}
            onChange={(e) => {
              setSelectedAreas((prev) => {
                if (e.target.checked) {
                  if (prev.includes(area)) {
                    return prev;
                  }
                  return [...prev, area].sort();
                } else {
                  return prev
                    .filter((selectedArea) => selectedArea !== area)
                    .sort();
                }
              });
            }}
          />
        </div>
      ))}
    </div>
  );
});

AreaFilterFormOptions.displayName = "AreaFilterFormOptions";
