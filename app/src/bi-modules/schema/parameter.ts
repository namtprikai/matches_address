/**
 * ビュー編集バーの基本設定以外のパラメータはJson形式でDBに保存される
 * DrizzleのSchemaにTypescriptの型定義をそのまま書くのではなくzodのSchemaで表現し、検証の容易性を高める
 */

import { z } from "zod";
import { FilterConditionValueSchema } from "./filter-operation";
import { GroupConditionValueSchema } from "./group-operation";

// unknown 型は z.any() で表現
export const ParameterBaseSchema = z.object({
  key: z.string(),
  type: z.enum(["filter", "column", "group", "group_aggregation"]),
  value: z.any(), // unknown 型
});

export const XAxisSchema = ParameterBaseSchema.extend({
  key: z.literal("xAxis"),
  type: z.literal("column"),
  value: z.enum([""]), // 実際の型に合わせて修正
});

export const YAxisSchema = ParameterBaseSchema.extend({
  key: z.literal("yAxis"),
  type: z.literal("column"),
  value: z.enum([""]), // 実際の型に合わせて修正
});

export const GroupConditionSchema = ParameterBaseSchema.extend({
  key: z.custom<`group_${string}`>((val) => /^group_/.test(val)),
  type: z.literal("group"),
  value: GroupConditionValueSchema,
});

export const GroupAggregationSchema = ParameterBaseSchema.extend({
  key: z.literal("group_aggregation"),
  type: z.literal("group_aggregation"),
  value: z.enum(["avg", "sum", "count"]),
});

export const TableColumnsSchema = ParameterBaseSchema.extend({
  key: z.literal("columns"),
  type: z.literal("column"),
  value: z.string(),
});

export const YearFilterSchema = ParameterBaseSchema.extend({
  key: z.literal("year"),
  type: z.literal("filter"),
  value: z.object({ start: z.string(), end: z.string() }),
});

export const AreaFilterSchema = ParameterBaseSchema.extend({
  key: z.literal("area"),
  type: z.literal("filter"),
  value: z.string().array(),
});

export const FilterConditionSchema = ParameterBaseSchema.extend({
  key: z.custom<`filter_${string}`>((val) => /^filter_/.test(val)),
  type: z.literal("filter"),
  value: FilterConditionValueSchema,
});

export const PieLabelSchema = ParameterBaseSchema.extend({
  key: z.literal("label"),
  type: z.literal("column"),
  value: z.enum([""]), // 実際の型に合わせて修正
});

export const PieValueSchema = ParameterBaseSchema.extend({
  key: z.literal("value"),
  type: z.literal("column"),
  value: z.enum([""]), // 実際の型に合わせて修正
});
