import { forwardRef } from "react";
import { mergeClasses } from "@fluentui/react-components";
import { type SelectDataSetDetailBuilding } from "../../../../schema";
import { formatDate } from "../../../../utils/format-date";
import styles from "./building-popup.module.css";
import { AllColumnsView } from "./all-columns-view";
import { PopupSlideContainer } from "./popup-slide-container";
import { PopupToggleButton } from "./popup-toggle-button";
import { usePopupLogic } from "./hooks/use-popup-logic";

/** Popup表示に必要な値 */
export type BuildingProperties = SelectDataSetDetailBuilding;

interface Props {
  properties: BuildingProperties;
}

export const BuildingPopup = forwardRef<HTMLDivElement, Props>(
  ({ properties }, ref) => {
    const { predicted_probability } = properties;

    // 推定不可の判定
    const isUnestimable =
      properties.outlier_flag === 1 ||
      properties.single_story_row_house_flag === 1 ||
      properties.matched_data_flag === 1;

    // ツールチップのコンテンツを生成
    const generateTooltipContent = (): JSX.Element => {
      const flags = [
        { label: "異常値フラグ", value: properties.outlier_flag },
        {
          label: "平屋長屋フラグ",
          value: properties.single_story_row_house_flag,
        },
        {
          label: "マッチングデータフラグ",
          value: properties.matched_data_flag,
        },
        {
          label: "建物種別判定不可フラグ",
          value: properties.buildingtype_determination_not_possible_flag,
        },
      ];

      return (
        <div style={{ padding: "0px 4px" }}>
          {flags.map((flag, index) => (
            <div
              key={index}
              style={{
                fontSize: "0.8em",
                lineHeight: "normal",
              }}
            >
              <strong>{flag.label}:</strong>{" "}
              {flag.value === 1 ? "該当" : "非該当"}
            </div>
          ))}
        </div>
      );
    };

    const {
      predictedProbabilityColorStyle,
      formattedPredictedProbability,
      buttonText,
    } = usePopupLogic({
      predictedProbability: predicted_probability,
      unit: "building",
    });

    // 簡易表示のレンダリング関数
    const renderSimpleView = (): JSX.Element => (
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
              {properties.household_size}人
            </span>
          </div>
          <div className={styles.item}>
            <span className={styles.itemLabel}>〜14歳</span>
            <span className={styles.itemValue}>
              {properties.members_under_15}人
            </span>
          </div>
          <div className={styles.item}>
            <span className={styles.itemLabel}>15-64歳</span>
            <span className={styles.itemValue}>
              {properties.members_15_to_64}人
            </span>
          </div>
          <div className={styles.item}>
            <span className={styles.itemLabel}>65歳〜</span>
            <span className={styles.itemValue}>
              {properties.members_over_65}人
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
              {properties.total_water_usage}立米
            </span>
          </div>
          <div className={styles.item}>
            <span className={styles.itemLabel}>水道使用状況</span>
            <span className={styles.itemValue}>
              {properties.water_disconnection_flag === 0 ? "開" : "閉"}
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
              {formatDate(properties.registration_date || "", "YYYY/MM/DD")}
            </span>
          </div>
          <div className={styles.item}>
            <span className={styles.itemLabel}>構造名称</span>
            <span className={styles.itemValue}>
              {properties.structure_name}
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
            isUnestimable ? styles.unestimable : undefined,
          )}
        >
          <span className={styles.circleIcon} />
          <div>
            {isUnestimable ? (
              <div>
                <span className={styles.predictedProbability}>推定不可</span>
                <details>
                  <summary>詳細</summary>
                  {generateTooltipContent()}
                </details>
              </div>
            ) : (
              <span className={styles.predictedProbability}>
                {formattedPredictedProbability}
              </span>
            )}
            <div className={styles.address}>
              {properties.normalized_address}
            </div>
          </div>
        </div>
        <PopupSlideContainer
          allColumnsView={
            <AllColumnsView
              className={styles.allColumnsContainer}
              properties={properties}
              type="building"
            />
          }
          simpleView={renderSimpleView()}
        />
        <PopupToggleButton buttonText={buttonText} />
      </div>
    );
  },
);

BuildingPopup.displayName = "BuildingPopup";
