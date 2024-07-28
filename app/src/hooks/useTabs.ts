import {
  type SelectTabData,
  type SelectTabEvent,
  type TabValue,
} from "@fluentui/react-components";
import { useState } from "react";

export const useTabs = (): {
  selectedValue: unknown;
  onTabSelect: (event: SelectTabEvent, data: SelectTabData) => void;
  setSelectedValue: React.Dispatch<unknown>;
} => {
  const [selectedValue, setSelectedValue] = useState<TabValue>("");

  const onTabSelect = (_: SelectTabEvent, data: SelectTabData): void => {
    setSelectedValue(data.value);
  };

  return {
    selectedValue,
    onTabSelect,
    setSelectedValue,
  };
};
