import { type InsertRawDataSet } from "../schema";

export async function saveDataSetFile(
  file: File | undefined,
): Promise<{ insertedId: InsertRawDataSet["id"] } | undefined> {
  if (!file) return;
  const ext = file.name.split(".").pop();
  if (!ext) return;
  const uuid = crypto.randomUUID();
  const file_path = `${uuid}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  // TODO: サイズが大きいファイルのためにパフォーマンス改善が必要かも
  await window.ipcRenderer.invoke("writeDatasetFile", {
    data: arrayBuffer,
    fileName: file_path,
  });

  const result = await window.ipcRenderer.invoke("insertRawDatasets", {
    file_name: file.name,
    file_path,
  });

  return result;
}
