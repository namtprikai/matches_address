/**
 * Popup内はmaplibre-glの管理下にあるためReactの状態管理を直接利用できない。
 * そのため、PopupのDOM要素を直接操作して表示状態を切り替えるユーティリティ関数を定義。
 */
import { type Popup } from "maplibre-gl";
import {
  POPUP_ELEMENT_IDS,
  POPUP_BUTTON_TEXT,
  POPUP_TRANSFORM_VALUES,
} from "../_const/popup-constants";

// ポップアップのDOM要素を取得する型安全な関数
interface PopupElements {
  toggleButton: HTMLButtonElement | null;
  allColumnsContainer: HTMLElement | null;
  simpleViewContainer: HTMLElement | null;
}

const getPopupElements = (popup: Popup): PopupElements | null => {
  const popupElement = popup.getElement();
  if (!popupElement) return null;

  return {
    toggleButton: popupElement.querySelector(
      `#${POPUP_ELEMENT_IDS.TOGGLE_BUTTON}`,
    ) as HTMLButtonElement | null,
    allColumnsContainer: popupElement.querySelector(
      `#${POPUP_ELEMENT_IDS.ALL_COLUMNS_VIEW}`,
    ) as HTMLElement | null,
    simpleViewContainer: popupElement.querySelector(
      `#${POPUP_ELEMENT_IDS.SIMPLE_VIEW}`,
    ) as HTMLElement | null,
  };
};

// 現在の表示状態を判定する関数
const isShowingAllColumns = (allColumnsContainer: HTMLElement): boolean => {
  const transform = allColumnsContainer.style.transform;
  return (
    transform === POPUP_TRANSFORM_VALUES.ALL_COLUMNS_VISIBLE ||
    transform === "translateX(0px)"
  ); // 既存の互換性のため
};

// ポップアップビューを切り替える関数
const togglePopupView = (
  allColumnsContainer: HTMLElement,
  simpleViewContainer: HTMLElement,
  toggleButton: HTMLButtonElement,
): void => {
  const isCurrentlyShowingAll = isShowingAllColumns(allColumnsContainer);

  if (isCurrentlyShowingAll) {
    // 簡易表示に戻る
    allColumnsContainer.style.transform =
      POPUP_TRANSFORM_VALUES.ALL_COLUMNS_HIDDEN;
    simpleViewContainer.style.transform =
      POPUP_TRANSFORM_VALUES.SIMPLE_VIEW_VISIBLE;
    toggleButton.textContent = POPUP_BUTTON_TEXT.SHOW_ALL;
  } else {
    // 全項目表示
    allColumnsContainer.style.transform =
      POPUP_TRANSFORM_VALUES.ALL_COLUMNS_VISIBLE;
    simpleViewContainer.style.transform =
      POPUP_TRANSFORM_VALUES.SIMPLE_VIEW_HIDDEN;
    toggleButton.textContent = POPUP_BUTTON_TEXT.BACK_TO_SIMPLE;
  }
};

// イベントハンドラー関数
export const createToggleClickHandler = (popup: Popup) => {
  return (e: Event): void => {
    e.preventDefault();

    const elements = getPopupElements(popup);

    if (
      !elements?.toggleButton ||
      !elements?.allColumnsContainer ||
      !elements?.simpleViewContainer
    ) {
      console.warn("Required popup elements not found");
      return;
    }

    togglePopupView(
      elements.allColumnsContainer,
      elements.simpleViewContainer,
      elements.toggleButton,
    );
  };
};
