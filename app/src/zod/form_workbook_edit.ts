import { z } from "zod";
import { result_view_schema } from "../zod/result-view";

/** 仮schema・実装しながら考える
 * - シートを配列で持つ
 * - ビューを配列で持つ
 * - シートは常に永続化されている
 * - 送信用の状態と一緒にUIのステートも持たせている
 */
export const form_workbook_edit_schema = z.object({
  resultsheetsWithViews: z.array(
    z.object({
      is_add_view: z
        .boolean()
        .default(true) /** サイドバーのビュー追加・詳細入力の切り替え */,
      sheet_id: z.number(),
      sheet_title: z.string(),
      result_views: z.array(result_view_schema),
    }),
  ),
});
