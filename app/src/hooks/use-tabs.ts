import {
  type SelectTabData,
  type SelectTabEvent,
  type TabValue,
} from "@fluentui/react-components";
import { useState } from "react";

export const useTabs = <T>(): {
  selectedValue: T;
  onTabSelect: (event: SelectTabEvent, data: SelectTabData) => void;
  setSelectedValue: React.Dispatch<T>;
} => {
  const [selectedValue, setSelectedValue] = useState<TabValue>("");

  const onTabSelect = (_: SelectTabEvent, data: SelectTabData): void => {
    setSelectedValue(data.value);
  };

  return {
    selectedValue: selectedValue as T,
    onTabSelect,
    setSelectedValue,
  };
};
