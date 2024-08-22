import { type ChartColumnType } from "../@types/charts";
import {
  DATA_SET_DETAIL_BUILIDNG_COLUMN,
  DATA_SET_DETAIL_BUILIDNG_COLUMN_CONFIG,
} from "../config/data-columns";

type Props = {
  unit: "building" | "area";
  fieldOption: {
    key: string;
    label: string;
    accept: readonly ChartColumnType[];
  };
};

export const DynamicColumnOptions = ({
  unit,
  fieldOption,
}: Props): JSX.Element[] | null => {
  if (unit === "building") {
    return DATA_SET_DETAIL_BUILIDNG_COLUMN.filter((column) => {
      const matchedType = fieldOption.accept.filter((type) => {
        return DATA_SET_DETAIL_BUILIDNG_COLUMN_CONFIG[column].type === type;
      });

      if (matchedType.length === 0) return false;

      return true;
    }).map((column) => {
      return (
        <option key={column} value={column}>
          {DATA_SET_DETAIL_BUILIDNG_COLUMN_CONFIG[column].label}
        </option>
      );
    });
  }

  if (unit === "area") {
    return DATA_SET_DETAIL_BUILIDNG_COLUMN.filter((column) => {
      const matchedType = fieldOption.accept.filter((type) => {
        return DATA_SET_DETAIL_BUILIDNG_COLUMN_CONFIG[column].type === type;
      });

      if (matchedType.length === 0) return false;

      return true;
    }).map((column) => {
      return (
        <option key={column} value={column}>
          {DATA_SET_DETAIL_BUILIDNG_COLUMN_CONFIG[column].label}
        </option>
      );
    });
  }

  return null;
};
