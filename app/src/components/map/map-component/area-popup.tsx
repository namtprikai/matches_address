import { forwardRef } from "react";
import { type SelectDataSetDetailArea } from "../../../schema";
import styles from "./area-popup.module.css";
import { VACANCY_RATE_HIGH, VACANCY_RATE_MEDIUM } from ".";

export type AreaProperties = Pick<
  SelectDataSetDetailArea,
  | "geometry"
  | "predicted_probability"
  | "young_population_ratio"
  | "elderly_population_ratio"
  | "area_group"
  | "area"
  | "vacant_house_count"
>;

interface Props {
  properties: AreaProperties;
}

export const AreaPopup = forwardRef<HTMLDivElement, Props>(
  ({ properties }, ref) => {
    const vacancyRateColorStyle = (() => {
      if (!properties) return "";
      const vacancyRate = properties.predicted_probability || 0;
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
        <div className={`${styles.header} ${vacancyRateColorStyle}`}>
          <span className={styles.circleIcon} />
          <div>
            <span className={styles.vacancyRate}>
              {properties.predicted_probability
                ? properties.predicted_probability.toFixed(0)
                : "??"}
              %
            </span>
            <div className={styles.address}>{properties.area_group}</div>
          </div>
        </div>
        <div className={styles.info}>
          <div>
            <h3 className={styles.heading}>
              <span className={`${styles.square} ${styles.householdIcon}`} />
              世帯情報
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>若年層率</span>
              <span className={styles.itemValue}>
                {properties.young_population_ratio}%
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>高年者率</span>
              <span className={styles.itemValue}>
                {properties.elderly_population_ratio}%
              </span>
            </div>
          </div>
          <div>
            <h3 className={styles.heading}>
              <span className={`${styles.square} ${styles.landIcon}`} />
              土地情報
            </h3>
            <div className={styles.item}>
              <span className={styles.itemLabel}>面積</span>
              <span className={styles.itemValue}>{properties.area}m2</span>
            </div>
            <div className={styles.item}>
              <span className={styles.itemLabel}>空き家件数</span>
              <span className={styles.itemValue}>
                {properties.vacant_house_count}件
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

AreaPopup.displayName = "AreaPopup";
