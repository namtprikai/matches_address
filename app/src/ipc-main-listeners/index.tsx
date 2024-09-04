import { type ipcMain } from "electron";
import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import { fetchBuildingsInBatches } from "../components/map/fetch-buildings-in-batches";
import { fetchReferenceYears } from "../components/map/fetch-reference-years";
import { getNames } from "./get-names";
import { saveName } from "./save-name";
import { helloFromPython } from "./hello-from-python";
import { saveNameFromPython } from "./save-name-from-python";
import { createWorkbooks } from "./create-workbooks";
import { selectWorkbooks } from "./select-workbooks";
import { selectWorkbook } from "./select-workbook";
import { selectResultSheets } from "./select-result-sheets";
import { insertResultSheets } from "./insert-result-sheets";
import { selectDataSetResults } from "./select-data-set-results";
import { createDataSetResults } from "./create-data-set-results";
import { updateResultSheets } from "./update-result-sheets";
import { selectResultViews } from "./select-result-views";
import { insertResultViews } from "./insert-result-views";
import { updateResultViews } from "./update-result-views";
import { readResultViews } from "./read-result-views";
import { filterDataSetForChart } from "./filter-data-set-for-chart";
import { selectResultView } from "./select-result-view";
import { filterDataSetForTable } from "./filter-data-set-for-table";

export const ipcMainListeners = {
  getNames,
  saveName,
  helloFromPython,
  saveNameFromPython,
  createWorkbooks,
  selectWorkbooks,
  selectWorkbook,
  selectResultSheets,
  insertResultSheets,
  selectDataSetResults,
  createDataSetResults,
  updateResultSheets,
  selectResultViews,
  insertResultViews,
  updateResultViews,
  readResultViews,
  selectResultView,
  filterDataSetForChart,
  filterDataSetForTable,
  fetchBuildingsInBatches,
  fetchReferenceYears,
};

export const execFileAsync = promisify(execFile);

export const binaryPath = (name: string): string => {
  const isDev = process.env.NODE_ENV === "development";
  const _binaryPath = path.resolve(__dirname, "../../../ml/dist", name);
  return isDev ? _binaryPath : path.join(process.resourcesPath, "dist", name);
};

export type IpcMainListener = Parameters<typeof ipcMain.handle>[1];
