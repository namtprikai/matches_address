import { useEffect, useState } from "react";
import { makeStyles, tokens } from "@fluentui/react-components";
import { type data_set_detail_buildings } from "../../schema";
import {
  VacancyLevelCheckbox,
  type VacancyLevels,
} from "./vacancy-level-checkbox";
import { MapComponent } from "./map-component";

const useStyles = makeStyles({
  filters: {
    display: "flex",
    gap: tokens.spacingHorizontalXXL,
  },
  filter: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
  },
  map: {
    marginTop: tokens.spacingVerticalMNudge,
  },
});

type Buildings = (typeof data_set_detail_buildings.$inferSelect)[];

interface Props {
  dataSetResultsId: number;
  type: "building" | "area";
}

export function Map({ type, dataSetResultsId }: Props): JSX.Element {
  const styles = useStyles();
  const [vacancyLevels, setVacancyLevels] = useState<VacancyLevels>({
    low: true,
    medium: true,
    high: true,
  });
  // const [selectedYear, setSelectedYear] = useState<number>(data[0].year);
  const [buildings, setBuildings] = useState<Buildings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // eslint-disable-next-line no-console -- for debugging
  console.log("buildings", buildings?.[0]);
  // eslint-disable-next-line no-console -- for debugging
  console.log("dataSetResultsId", dataSetResultsId);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const batchSize = 10000;
      let lastId = 0;
      let allData: Buildings = [];

      try {
        // eslint-disable-next-line no-constant-condition -- バッチ処理のため無限ループ
        while (true) {
          const batch = await window.ipcRenderer.invoke(
            "fetchBuildingsInBatches",
            {
              dataSetResultsId,
              batchSize,
              lastId,
            },
          );

          if (!batch) {
            throw new Error("Network response was not ok");
          }

          allData = [...allData, ...batch];

          if (batch.length < batchSize) {
            // 最後のバッチを取得完了
            break;
          }

          lastId = batch[batch.length - 1].id;
        }

        setBuildings(allData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [dataSetResultsId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className={styles.filters}>
        <div className={styles.filter}>
          <div>空き家率</div>
          <div>
            <VacancyLevelCheckbox
              setVacancyLevels={setVacancyLevels}
              vacancyLevels={vacancyLevels}
            />
          </div>
        </div>
        <div className={styles.filter}>
          <div>表示期間</div>
          {/* <div>
            <DisplayPeriodDropdown
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              years={data.map((data) => data.year)}
            />
          </div> */}
        </div>
      </div>
      <div className={styles.map}>
        <MapComponent
          buildings={buildings}
          // selectedYear={selectedYear}
          vacancyLevels={vacancyLevels}
        />
      </div>
    </div>
  );
}
