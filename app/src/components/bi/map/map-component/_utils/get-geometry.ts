import { type View } from "../../../../../bi-modules/interfaces/view";

export type GetGeometryParams = {
  unit: View["unit"];
  dataSetResultId: View["dataSetResultId"];
  selectedDate: string | undefined;
  areas: string[] | undefined;
};

export const getGeometry = async ({
  unit,
  dataSetResultId,
  selectedDate,
  areas,
}: GetGeometryParams): Promise<string | undefined> => {
  switch (unit) {
    case "building": {
      const result = await window.ipcRenderer.invoke(
        "selectBuildingsInBatches",
        {
          dataSetResultId,
          referenceDate: selectedDate,
          batchSize: 1,
          areas,
        },
      );
      return result?.[0].geometry;
    }
    case "area": {
      const result = await window.ipcRenderer.invoke("selectAreasInBatches", {
        dataSetResultId,
        referenceDate: selectedDate,
        batchSize: 1,
        areas,
      });
      return result?.[0].geometry;
    }
    default: {
      const exhaustiveCheck: never = unit;
      throw new Error(`Unhandled type: ${exhaustiveCheck}`);
    }
  }
};
