import { binaryPath, execFileAsync, type IpcMainListener } from ".";
import { getErrorMessage } from "@/utils/get-error-message";

export const helloFromPython: IpcMainListener = async (
  _: unknown,
  name: string,
): Promise<string | undefined> => {
  try {
    const { stdout, stderr } = await execFileAsync(binaryPath("hello"), [name]);

    if (stderr) {
      throw new Error(`Stderr: ${stderr}`);
    }

    return stdout;
  } catch (error) {
    console.error(getErrorMessage(error));
    return undefined;
  }
};
