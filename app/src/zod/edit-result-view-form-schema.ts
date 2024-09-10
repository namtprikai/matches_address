import { z } from "zod";
import { result_views } from "../schema";

export const YEAR_LOWER_LIMIT = "下限なし";
export const YEAR_UPPER_LIMIT = "上限なし";

export const editResultViewFormSchema = z.object({
  title: z.string().max(255).optional(),
  unit: z.enum(result_views.unit.enumValues).default("building"),
  style: z.enum(result_views.style.enumValues).default("map"),
  parameters: z
    .object({
      key: z.string(),
      value: z.string(),
    })
    .array(),

  year: z.object({
    start: z
      .number()
      .or(z.enum([YEAR_LOWER_LIMIT]).optional().default(YEAR_LOWER_LIMIT))
      .nullable(),
    end: z
      .number()
      .or(z.enum([YEAR_UPPER_LIMIT]).optional().default(YEAR_UPPER_LIMIT))
      .nullable(),
  }),
  areas: z.array(z.string()).optional().default([]),
});
