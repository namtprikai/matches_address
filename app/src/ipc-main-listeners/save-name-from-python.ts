import { dbPath } from "../utils/db";
import { getErrorMessage } from "../utils/get-error-message";
import { type IpcMainListener, execFileAsync, binaryPath } from ".";

export const saveNameFromPython: IpcMainListener = async (
  _: unknown,
  name: string,
): Promise<void> => {
  try {
    const { stderr } = await execFileAsync(binaryPath("save_name"), [
      name,
      dbPath,
    ]);

    if (stderr) {
      throw new Error(`Stderr: ${stderr}`);
    }
  } catch (error) {
    console.error(getErrorMessage(error));
  }
};
