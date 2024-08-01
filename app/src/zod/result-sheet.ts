import { z } from "zod";

/**
 * typeof result_sheets.$inferInserts
 */
export const result_sheet_schema = z.object({
  id: z.number(),
  workbook_id: z.number().nullable(),
  title: z.string().min(1).max(255).nullable(),
  created_at: z.string().nullable(),
});
