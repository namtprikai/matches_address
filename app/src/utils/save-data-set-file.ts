export async function saveDataSetFile(file: File | undefined): Promise<void> {
  if (!file) return;
  const ext = file.name.split(".").pop();
  if (!ext) return;
  const uuid = crypto.randomUUID();
  const file_path = `${uuid}.${ext}`;
  await window.ipcRenderer.invoke("insertRawDatasets", {
    file_name: file.name,
    file_path,
  });
  const arrayBuffer = await file.arrayBuffer();
  // TODO: サイズが大きいファイルのためにパフォーマンス改善が必要かも
  await window.ipcRenderer.invoke("writeDatasetFile", {
    data: arrayBuffer,
    fileName: file_path,
  });
}
