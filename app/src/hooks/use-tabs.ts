import {
  type SelectTabData,
  type SelectTabEvent,
  type TabValue,
} from "@fluentui/react-components";
import { startTransition, useState } from "react";
import { useAtom } from "jotai";
import { selectedSheetIdAtom } from "../state/selected-sheet-id-atom";

export const useTabs = <T>(): {
  selectedValue: T;
  onTabSelect: (event: SelectTabEvent, data: SelectTabData) => void;
  setSelectedValue: React.Dispatch<T>;
} => {
  const [selectedValue, setSelectedValue] = useState<TabValue>("");
  const [, setResultSheetId] = useAtom(selectedSheetIdAtom);

  const onTabSelect = (_: SelectTabEvent, data: SelectTabData): void => {
    setSelectedValue(data.value);
    startTransition(() => setResultSheetId(data.value as number));
  };

  return {
    selectedValue: selectedValue as T,
    onTabSelect,
    setSelectedValue,
  };
};
