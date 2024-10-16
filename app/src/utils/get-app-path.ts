import fs from "fs";
import path from "path";
import { app } from "electron";

/**
 * 環境に応じたアプリケーションファイルのパスを取得し、必要に応じてディレクトリを作成する関数
 * @param paths パスの配列（最後の要素をファイル名にする）
 * @returns ファイルの完全パス
 */
export function getAppPath(...paths: string[]): string {
  const isDev = process.env.NODE_ENV === "development";

  let fullPath: string;
  if (isDev) {
    // 開発環境: プロジェクト内の指定されたディレクトリを使用
    fullPath = path.join(process.cwd(), ...paths);
  } else {
    // 本番環境: Electronのapp.getPath('appData')を使用
    fullPath = path.join(app.getPath("appData"), ...paths);
  }

  // ディレクトリの存在を確認し、必要に応じて作成
  const directory = path.dirname(fullPath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  return fullPath;
}
