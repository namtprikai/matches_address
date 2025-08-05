import { useMemo } from "react";
import { PREDICTED_PROBABILITY } from "..";
import { POPUP_BUTTON_TEXT } from "../_const/popup-constants";

interface UsePopupLogicProps {
  predictedProbability: number | null;
  unit: "building" | "area";
}

interface UsePopupLogicReturn {
  predictedProbabilityColorStyle: string | undefined;
  formattedPredictedProbability: string;
  buttonText: string;
}

export const usePopupLogic = ({
  predictedProbability,
  unit,
}: UsePopupLogicProps): UsePopupLogicReturn => {
  const predictedProbabilityColorStyle = useMemo(() => {
    if (predictedProbability === null) return undefined;
    if (predictedProbability >= PREDICTED_PROBABILITY[unit].high) {
      return "high";
    } else if (predictedProbability >= PREDICTED_PROBABILITY[unit].medium) {
      return "medium";
    } else {
      return "low";
    }
  }, [predictedProbability, unit]);

  const formattedPredictedProbability = useMemo(() => {
    return predictedProbability !== null
      ? `${Math.floor(predictedProbability * 1000) / 10}%`
      : "??%";
  }, [predictedProbability]);

  const buttonText = POPUP_BUTTON_TEXT.SHOW_ALL;

  return {
    predictedProbabilityColorStyle,
    formattedPredictedProbability,
    buttonText,
  };
};
