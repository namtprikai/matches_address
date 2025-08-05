import { forwardRef } from "react";
import { mergeClasses } from "@fluentui/react-components";
import { type SelectDataSetDetailArea } from "../../../../schema";
import styles from "./area-popup.module.css";
import { AllColumnsView } from "./all-columns-view";
import { PopupSlideContainer } from "./popup-slide-container";
import { PopupToggleButton } from "./popup-toggle-button";
import { usePopupLogic } from "./hooks/use-popup-logic";

export type AreaProperties = SelectDataSetDetailArea;

interface Props {
  properties: AreaProperties;
}

export const AreaPopup = forwardRef<HTMLDivElement, Props>(
  ({ properties }, ref) => {
    const { predicted_probability } = properties;

    const {
      predictedProbabilityColorStyle,
      formattedPredictedProbability,
      buttonText,
    } = usePopupLogic({
      predictedProbability: predicted_probability,
      unit: "area",
    });

    // 簡易表示のレンダリング関数
    const renderSimpleView = (): JSX.Element => (
      <div className={styles.info}>
        <div>
          <h3 className={styles.heading}>
            <span className={`${styles.square} ${styles.householdIcon}`} />
            世帯情報
          </h3>
          <div className={styles.item}>
            <span className={styles.itemLabel}>若年層率</span>
            <span className={styles.itemValue}>
              {properties.young_population_ratio !== null
                ? Math.floor(properties.young_population_ratio * 1000) / 10
                : "??"}
              %
            </span>
          </div>
          <div className={styles.item}>
            <span className={styles.itemLabel}>高年者率</span>
            <span className={styles.itemValue}>
              {properties.elderly_population_ratio !== null
                ? Math.floor(properties.elderly_population_ratio * 1000) / 10
                : "??"}
              %
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
            <span className={styles.itemValue}>
              {properties.area !== null
                ? Math.floor(properties.area * 1000) / 10
                : "??"}
              m2
            </span>
          </div>
          <div className={styles.item}>
            <span className={styles.itemLabel}>空き家件数</span>
            <span className={styles.itemValue}>
              {properties.vacant_house_count}件
            </span>
          </div>
          <div className={styles.item}>
            <span className={styles.itemLabel}>地域内の家屋件数</span>
            <span className={styles.itemValue}>
              {properties.total_building_count}件
            </span>
          </div>
        </div>
      </div>
    );

    return (
      <div ref={ref} className={styles.container} tabIndex={-1}>
        <div
          className={mergeClasses(
            styles.header,
            predictedProbabilityColorStyle
              ? styles[predictedProbabilityColorStyle]
              : undefined,
          )}
        >
          <span className={styles.circleIcon} />
          <div>
            <span className={styles.predictedProbability}>
              {formattedPredictedProbability}
            </span>
            <div className={styles.address}>{properties.area_group}</div>
          </div>
        </div>

        <PopupSlideContainer
          allColumnsView={
            <AllColumnsView
              className={styles.allColumnsContainer}
              properties={properties}
              type="area"
            />
          }
          simpleView={renderSimpleView()}
        />
        <PopupToggleButton buttonText={buttonText} />
      </div>
    );
  },
);

AreaPopup.displayName = "AreaPopup";
