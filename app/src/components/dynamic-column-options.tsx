import { Option } from "@fluentui/react-components";
import {
  type ChartDynamicColumnInput,
  type ChartColumnType,
} from "../@types/charts";
import {
  AREA_DATASET_COLUMN,
  DATA_SET_DETAIL_AREA_COLUMN_CONFIG,
  DATA_SET_DETAIL_BUILDING_COLUMN,
  DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG,
} from "../config/column-list";

type Props = {
  unit: "building" | "area";
  fieldOption: {
    key: string;
    label: string;
    accept: readonly ChartColumnType[];
  };
  type: ChartDynamicColumnInput;
};

export const DynamicColumnOptions = ({
  unit,
  fieldOption,
  type,
}: Props): JSX.Element[] | null => {
  if (unit === "building") {
    return DATA_SET_DETAIL_BUILDING_COLUMN.filter((column) => {
      const matchedType = fieldOption.accept.filter((type) => {
        return DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[column].type === type;
      });

      if (matchedType.length === 0) return false;

      return true;
    }).map((column) => {
      if (type === "select") {
        return (
          <option key={column} value={column}>
            {DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[column].label}
          </option>
        );
      }
      if (type === "dropdown") {
        return (
          <Option
            key={column}
            text={DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[column].label}
            value={column}
          >
            {DATA_SET_DETAIL_BUILDING_COLUMN_CONFIG[column].label}
          </Option>
        );
      }
      return <></>;
    });
  }

  if (unit === "area") {
    return AREA_DATASET_COLUMN.filter((column) => {
      const matchedType = fieldOption.accept.filter((type) => {
        return DATA_SET_DETAIL_AREA_COLUMN_CONFIG[column].type === type;
      });

      if (matchedType.length === 0) return false;

      return true;
    }).map((column) => {
      if (type === "select") {
        return (
          <option key={column} value={column}>
            {DATA_SET_DETAIL_AREA_COLUMN_CONFIG[column].label}
          </option>
        );
      }
      if (type === "dropdown") {
        return (
          <Option
            key={column}
            text={DATA_SET_DETAIL_AREA_COLUMN_CONFIG[column].label}
            value={column}
          >
            {DATA_SET_DETAIL_AREA_COLUMN_CONFIG[column].label}
          </Option>
        );
      }
      return <></>;
    });
  }

  return null;
};
