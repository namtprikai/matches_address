import { type ipcMain } from "electron";
import { execFile } from "child_process";
import path from "path";
import { promisify } from "util";
import { fetchBuildingsInBatches } from "../components/bi/map/fetch-buildings-in-batches";
import { fetchAreasInBatches } from "../components/bi/map/fetch-areas";
import { fetchReferenceDates } from "./fetch-reference-dates";
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
import { deleteResultView } from "./delete-result-view";
import { deleteResultSheet } from "./delete-result-sheet";
import { createDummyDataSetResults } from "./create-dummy-data-set-results";
import { deleteWorkbook } from "./delete-workbook";
import { fetchAreaGroups } from "./fetch-area-groups";
import { updateResultViewsLayoutIndex } from "./update-result-views-layout-index";
import { selectRawDatasets } from "./select-raw-datasets";
import { insertRawDatasets } from "./insert-raw-datasets";
import { writeDatasetFile } from "./write-dataset-file";
import { selectNormalizedDataSets } from "./select-normalized-datasets";
import { insertNormalizedDatasets } from "./insert-normalized-datasets";
import { selectRawDataset } from "./select-raw-dataset";
import { selectNormalizedDataSet } from "./select-normalized-dataset";
import { selectDataSetResult } from "./select-data-set-result";
import { readDatasetFile } from "./read-dataset-file";
import { selectModelFiles } from "./select-model-files";
import { _debugInsertModelFiles } from "./_debug-insert-model-files";
import { updateRawDataset } from "./update-raw-dataset";
import { updateNormalizedDataset } from "./update-normalized-dataset";
import { updateDataSetResult } from "./update-data-set-result";
import { updateModelFiles } from "./update-model-files";
import { deleteModelFiles } from "./delete-model-files";
import { fetchJobLists } from "./fetch-job-lists";
import { fetchJobTasks } from "./fetch-job-tasks";
import { buildModel } from "./ml/build-model";

export const ipcMainListeners = {
  helloFromPython,
  saveNameFromPython,
  createWorkbooks,
  selectWorkbooks,
  selectWorkbook,
  selectResultSheets,
  insertResultSheets,
  deleteResultSheet,
  selectDataSetResults,
  createDataSetResults,
  updateResultSheets,
  selectResultViews,
  insertResultViews,
  updateResultViews,
  readResultViews,
  selectResultView,
  deleteResultView,
  filterDataSetForChart,
  filterDataSetForTable,
  fetchBuildingsInBatches,
  fetchReferenceDates,
  fetchAreaGroups,
  createDummyDataSetResults,
  fetchAreasInBatches,
  deleteWorkbook,
  updateResultViewsLayoutIndex,
  selectRawDatasets,
  insertRawDatasets,
  writeDatasetFile,
  selectNormalizedDataSets,
  insertNormalizedDatasets,
  selectRawDataset,
  selectNormalizedDataSet,
  selectDataSetResult,
  readDatasetFile,
  selectModelFiles,
  _debugInsertModelFiles,
  updateRawDataset,
  updateNormalizedDataset,
  updateDataSetResult,
  updateModelFiles,
  deleteModelFiles,
  fetchJobLists,
  fetchJobTasks,
  buildModel,
};

export const execFileAsync = promisify(execFile);

export const binaryPath = (name: string): string => {
  const isDev = process.env.NODE_ENV === "development";
  const _binaryPath = path.resolve(__dirname, "../../../ml/dist", name);
  return isDev ? _binaryPath : path.join(process.resourcesPath, "dist", name);
};

export type IpcMainListener = Parameters<typeof ipcMain.handle>[1];
