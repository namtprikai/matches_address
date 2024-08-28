import { forwardRef } from "react";
import { clsx } from "clsx";
import styles from "./popup-styles.module.css";
import { VACANCY_RATE_HIGH, VACANCY_RATE_MEDIUM } from "./utils";
import { type Building } from ".";

interface Props {
  data: Omit<Building, "coordinates"> | null;
}

export const BuildingPopup = forwardRef<HTMLDivElement, Props>(
  ({ data }, ref) => {
    const vacancyRateColorStyle = (() => {
      if (!data) return "";
      const vacancyRate = data.vacancyRate;
      if (vacancyRate >= VACANCY_RATE_HIGH) {
        return styles.high;
      } else if (vacancyRate >= VACANCY_RATE_MEDIUM) {
        return styles.medium;
      } else {
        return styles.low;
      }
    })();

    return (
      <div ref={ref} className={styles.container} tabIndex={-1}>
        <div className={clsx(styles.header, vacancyRateColorStyle)}>
          <span className={clsx(styles.circleIcon)} />
          <div>
            <span className={styles.vacancyRate}>
              {data?.vacancyRate ? (data?.vacancyRate * 100).toFixed(0) : "??"}%
            </span>
            <div className={styles.address}>{data?.address}</div>
          </div>
        </div>
        <div className={styles.info}>
          <div>
            <h3 className={styles.heading}>
              <span className={clsx(styles.square, styles.householdIcon)} />
              世帯情報
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>世帯人数</span>
              <span className={styles.itemValue}>
                {data?.totalPopulation}人
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>〜14歳</span>
              <span className={styles.itemValue}>{data?.under14}人</span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>15-64歳</span>
              <span className={styles.itemValue}>{data?.between15And64}人</span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>65歳〜</span>
              <span className={styles.itemValue}>{data?.over65}人</span>
            </div>
          </div>
          <div>
            <h3 className={styles.heading}>
              <span className={clsx(styles.square, styles.waterIcon)} />
              水道情報
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>水道使用量</span>
              <span className={styles.itemValue}>{data?.waterUsage}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>水道使用状況</span>
              <span className={styles.itemValue}>{data?.waterStatus}</span>
            </div>
          </div>
          <div>
            <h3 className={styles.heading}>
              <span className={clsx(styles.square, styles.buildingIcon)} />
              建物情報
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>築年月</span>
              <span className={styles.itemValue}>{data?.constructionDate}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>構造名称</span>
              <span className={styles.itemValue}>{data?.structureName}</span>
            </div>
          </div>
          <div>
            <h3 className={styles.heading}>
              <span className={clsx(styles.square, styles.otherIcon)} />
              その他
            </h3>
            <div className={styles.item}>
              <span>災害避難経路等の情報表示</span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

BuildingPopup.displayName = "BuildingPopup";
