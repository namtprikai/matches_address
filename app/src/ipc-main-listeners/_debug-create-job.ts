import { spawn } from "child_process";
import { jobs, type InsertJob } from "../schema";
import { db, dbDirectoryPath, dbPath } from "../utils/db";
import { type ExecE001Args } from "./ml/exec-e001";
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

  const createmock = (type: InsertJob["type"]): ExecE001Args => {
    switch (type) {
      case "preprocess":
        return mockE001;
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

const mockE001: ExecE001Args = {
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
      columns: {
        household_code: "",
        address: "",
        birth_date: "",
        gender: "",
        resident_date: "",
      },
    },
    water_status: {
      columns: {
        water_supply_number: "",
        water_disconnection_date: "",
        water_connection_date: "",
        water_disconnection_flag: "",
        address: "",
      },
    },
    water_usage: {
      columns: {
        water_supply_number: "",
        water_usage: "",
        water_recorded_date: "",
      },
    },
    land_registry: {
      columns: {
        address: "",
        structure_name: "",
        registration_date: "",
      },
    },
    vacant_house: {
      columns: {
        vacant_house_id: "",
        address: "",
        latitude: "",
        longitude: "",
      },
    },
    geocoding: {
      columns: {
        address: "",
        latitude: "",
        longitude: "",
      },
    },
    building_polygon: {
      columns: {
        building_id: "",
      },
    },
    urban_planning: {},
    census: {},
  },
};
