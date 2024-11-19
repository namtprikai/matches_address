import { spawn } from "child_process";
import { jobs, type InsertJob } from "../schema";
import { db, dbDirectoryPath, dbPath } from "../utils/db";
import {
  type PreprocessParameters,
  type ModelCreateParameters,
} from "../@types/job-parameters";
import { type IpcMainListener } from ".";

type Params = {
  job: "処理開始" | "処理完了" | "処理失敗";
  jobType: InsertJob["type"];
};

export const _debugCreateJob = (async (
  _: unknown,
  { job, jobType }: Params,
): Promise<void> => {
  const cp = spawn("echo", ["test"], {
    detached: true,
  });

  const output_path = dbDirectoryPath;
  const database_path = dbPath;

  const createmock = (
    type: InsertJob["type"],
  ): PreprocessParameters | ModelCreateParameters => {
    switch (type) {
      case "preprocess":
        return mockE001;
      case "ml":
        return mockBuildModel;
      default:
        return mockE001;
    }
  };

  db.insert(jobs)
    .values({
      status:
        job === "処理開始" ? "" : job === "処理完了" ? "complete" : "error",
      type: jobType,
      is_named: false,
      process_id: cp.pid,
      parameters: {
        ...createmock(jobType),
        output_path,
        database_path,
      },
    })
    .returning({ insertedId: jobs.id })
    .get();
}) satisfies IpcMainListener;

/** 型推論が通じないので指定。モックなので一旦気にしない・・ */
const mockE001: PreprocessParameters = {
  settings: {
    reference_data: "water_status",
    reference_date: "2021-01-01",
    advanced: {
      similarity_threshold: 0.95,
      n_gram_size: 2,
      joining_method: "intersection",
    },
  },
  data: {
    resident_registry: {
      id: 0,
      path: "",
      columns: {
        household_code: "",
        address: "",
        birth_date: "",
        gender: "",
        resident_date: "",
      },
    },
    water_status: {
      id: 0,
      path: "",
      columns: {
        water_supply_number: "",
        water_disconnection_date: "",
        water_connection_date: "",
        water_disconnection_flag: "",
        address: "",
      },
    },
    water_usage: {
      id: 0,
      path: "",
      columns: {
        water_supply_number: "",
        water_usage: "",
        water_recorded_date: "",
      },
    },
    land_registry: {
      id: 0,
      path: "",
      columns: {
        address: "",
        structure_name: "",
        registration_date: "",
      },
    },
    vacant_house: {
      id: 0,
      path: "",
      columns: {
        vacant_house_id: "",
        address: "",
        latitude: "",
        longitude: "",
      },
    },
    geocoding: {
      id: 0,
      path: "",
      columns: {
        address: "",
        latitude: "",
        longitude: "",
      },
    },
    building_polygon: {
      id: 0,
      path: "",
      columns: {
        building_id: "",
      },
    },
    urban_planning: { id: 0, path: "" },
    census: { id: 0, path: "" },
  },
};

const mockBuildModel = {
  input_path: "test.csv",
  settings: {
    explanatory_variables: ["水道番号", "メータ番号"],
    advanced: {
      test_size: 0.3,
      n_splits: 3,
      undersample: true,
      undersample_ratio: 3,
      threshold: 0.3,
      hyperparameter_flag: true,
      n_trials: 100,
      lambda_l1: 0,
      lambda_l2: 0,
      num_leaves: 31,
      feature_fraction: 1,
      bagging_fraction: 1,
      bagging_freq: 0,
      min_data_in_leaf: 20,
    },
  },
};
