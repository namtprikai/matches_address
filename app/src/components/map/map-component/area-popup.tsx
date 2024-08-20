import { forwardRef } from "react";
import styles from "./popup-styles.module.css";
import { type Area } from ".";

interface Props {
  areaInfo: Area | null;
}

export const AreaPopup = forwardRef<HTMLDivElement, Props>(
  ({ areaInfo }, ref) => {
    const riskRateColorStyle = (() => {
      if (!areaInfo) return "";
      const riskRate = areaInfo.vacancyRate;
      if (riskRate >= 80) {
        return styles.high;
      } else if (riskRate >= 30) {
        return styles.medium;
      } else {
        return styles.low;
      }
    })();

    return (
      <div ref={ref} className={styles.container} tabIndex={-1}>
        <div className={`${styles.header} ${riskRateColorStyle}`}>
          <span className={styles.circleIcon} />
          <div>
            <span className={styles.vacancyRate}>{areaInfo?.vacancyRate}%</span>
            <div className={styles.address}>{areaInfo?.address}</div>
          </div>
        </div>
        <div className={styles.info}>
          <div>
            <h3 className={styles.heading}>
              <span className={`${styles.square} ${styles.householdIcon}`} />
              世帯情報
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>世帯数</span>
              <span className={styles.itemValue}>
                {areaInfo?.totalPopulation}人
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>男性人数</span>
              <span className={styles.itemValue}>
                {areaInfo?.malePopulation}人 (
                {(
                  ((areaInfo?.malePopulation || 0) /
                    (areaInfo?.totalPopulation || 1)) *
                  100
                ).toFixed(0)}
                %)
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>女性人数</span>
              <span className={styles.itemValue}>
                {areaInfo?.femalePopulation}人 (
                {(
                  ((areaInfo?.femalePopulation || 0) /
                    (areaInfo?.totalPopulation || 1)) *
                  100
                ).toFixed(0)}
                %)
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>平均年齢</span>
              <span className={styles.itemValue}>
                {areaInfo?.averageAge.toFixed(2)}歳
              </span>
            </div>
          </div>
          <div>
            <h3 className={styles.heading}>
              <span className={`${styles.square} ${styles.waterIcon}`} />
              水道情報
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>水道使用量平均</span>
              <span className={styles.itemValue}>
                {areaInfo?.waterUsageAverage}L
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>最大水道使用量</span>
              <span className={styles.itemValue}>
                {areaInfo?.waterUsageMax}L
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>最小水道使用量</span>
              <span className={styles.itemValue}>
                {areaInfo?.waterUsageMin}L
              </span>
            </div>
          </div>
          <div>
            <h3 className={styles.heading}>
              <span className={`${styles.square} ${styles.buildingIcon}`} />
              建築情報
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>平均築年数</span>
              <span className={styles.itemValue}>
                {areaInfo?.averageConstructionAge}年
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>最小築年数</span>
              <span className={styles.itemValue}>
                {areaInfo?.minConstructionAge}年
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>最大築年数</span>
              <span className={styles.itemValue}>
                {areaInfo?.maxConstructionAge}年
              </span>
            </div>
          </div>
          <div>
            <h3 className={styles.heading}>
              <span className={`${styles.square} ${styles.otherIcon}`} />
              その他
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>空き家調査結果での危険度</span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>A</span>
              <span className={styles.itemValue}>{areaInfo?.riskLevelA}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>B</span>
              <span className={styles.itemValue}>{areaInfo?.riskLevelB}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>C</span>
              <span className={styles.itemValue}>{areaInfo?.riskLevelC}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>面積</span>
              <span className={styles.itemValue}>
                {areaInfo?.area.toLocaleString()}㎡
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

AreaPopup.displayName = "AreaPopup";
