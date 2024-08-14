import { mergeClasses } from "@fluentui/react-components";
import { forwardRef } from "react";
import { usePopupStyles } from "./use-popup-styles";
import { type Building } from ".";

interface Props {
  buildingInfo: Building["info"] | null;
  onClose: () => void;
}

export const BuildingPopup = forwardRef<HTMLDivElement, Props>(
  ({ buildingInfo, onClose }, ref) => {
    const styles = usePopupStyles();
    const vacancyRateColorStyle = (() => {
      if (!buildingInfo) return "";
      const vacancyRate = buildingInfo.vacancyRate;
      if (vacancyRate >= 80) {
        return styles.high;
      } else if (vacancyRate >= 30) {
        return styles.medium;
      } else {
        return styles.low;
      }
    })();

    return (
      <div ref={ref} className={styles.container} tabIndex={-1}>
        <span className={styles.close} onClick={onClose}>
          ×
        </span>
        <div className={mergeClasses(styles.header, vacancyRateColorStyle)}>
          <span className={mergeClasses(styles.circleIcon)} />
          <div>
            <span className={styles.vacancyRate}>
              {buildingInfo?.vacancyRate}%
            </span>
            <div className={styles.address}>{buildingInfo?.address}</div>
          </div>
        </div>
        <div className={styles.info}>
          <div>
            <h3 className={styles.heading}>
              <span
                className={mergeClasses(styles.square, styles.householdIcon)}
              />
              世帯情報
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>世帯人数</span>
              <span className={styles.itemValue}>
                {buildingInfo?.totalPopulation}人
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>〜14歳</span>
              <span className={styles.itemValue}>
                {buildingInfo?.ageGroups.under14}人
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>15-64歳</span>
              <span className={styles.itemValue}>
                {buildingInfo?.ageGroups.between15And64}人
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>65歳〜</span>
              <span className={styles.itemValue}>
                {buildingInfo?.ageGroups.over65}人
              </span>
            </div>
          </div>
          <div>
            <h3 className={styles.heading}>
              <span className={mergeClasses(styles.square, styles.waterIcon)} />
              水道情報
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>水道使用量</span>
              <span className={styles.itemValue}>
                {buildingInfo?.waterUsage}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>水道使用状況</span>
              <span className={styles.itemValue}>
                {buildingInfo?.waterStatus}
              </span>
            </div>
          </div>
          <div>
            <h3 className={styles.heading}>
              <span
                className={mergeClasses(styles.square, styles.buildingIcon)}
              />
              建物情報
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>築年月</span>
              <span className={styles.itemValue}>
                {buildingInfo?.constructionDate}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>構造名称</span>
              <span className={styles.itemValue}>
                {buildingInfo?.structureName}
              </span>
            </div>
          </div>
          <div>
            <h3 className={styles.heading}>
              <span className={mergeClasses(styles.square, styles.otherIcon)} />
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
