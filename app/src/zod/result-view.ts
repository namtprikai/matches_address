import { z } from "zod";
import { result_views } from "../schema";

/**
 * typeof result_views.$inferInserts
 */
export const result_view_schema = z.object({
  sheet_id: z.number(),
  data_set_result_id: z.number(),

  title: z.string().min(1).max(255),
  unit: z.enum(result_views.unit.enumValues),

  /** @todo [WIP] フィルター周辺の値はあとから追加 */
});
