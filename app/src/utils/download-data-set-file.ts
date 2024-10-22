export function downloadDataSetFile(buffer: Buffer, fileName: string): void {
  const hasExtension = fileName.includes(".");
  const name = hasExtension ? fileName : `${fileName}.csv`; // ファイル名に拡張子が含まれていない場合は、とりあえず.csvを付与する
  const url = URL.createObjectURL(new Blob([buffer]));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
