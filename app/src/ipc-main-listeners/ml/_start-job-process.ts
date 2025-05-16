import { jobs, type SelectJob } from "../../schema";
import { db } from "../../utils/db";

type Params = {
  jobType: SelectJob["type"];
};

type ReturnParams =
  | {
      status: "success";
      data: {
        jobId: number;
      };
    }
  | {
      status: "failed";
      data: {
        jobId: null;
      };
    };

export const startJobProcess = async ({
  jobType,
}: Params): Promise<ReturnParams> => {
  try {
    const { jobId } = db
      .insert(jobs)
      .values({
        status: "",
        type: jobType,
        is_named: false,
        parameters: {
          parameterType: "unknown",
        },
      })
      .returning({
        jobId: jobs.id,
      })
      .get();

    return {
      status: "success",
      data: {
        jobId,
      },
    };
  } catch (error) {
    console.error("Error starting job process:", error);
    return {
      status: "failed",
      data: {
        jobId: null,
      },
    };
  }
};
