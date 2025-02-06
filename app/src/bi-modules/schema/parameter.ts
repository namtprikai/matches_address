/**
 * ビュー編集バーの基本設定以外のパラメータはJson形式でDBに保存される
 * DrizzleのSchemaにTypescriptの型定義をそのまま書くのではなくzodのSchemaで表現し、検証の容易性を高める
 */

import { z } from "zod";
import { filterConditionValueSchema } from "./filter-operation";
import { groupConditionValueSchema } from "./group-operation";

// unknown 型は z.any() で表現
const parameterBaseSchema = z.object({
  key: z.string(),
  type: z.enum(["filter", "column", "group", "group_aggregation"]),
  value: z.any(), // unknown 型
});

const xAxisSchema = parameterBaseSchema.extend({
  key: z.literal("xAxis"),
  type: z.literal("column"),
  value: z.enum([""]), // 実際の型に合わせて修正
});

const yAxisSchema = parameterBaseSchema.extend({
  key: z.literal("yAxis"),
  type: z.literal("column"),
  value: z.enum([""]), // 実際の型に合わせて修正
});

const groupConditionSchema = parameterBaseSchema.extend({
  key: z.custom<`group_${string}`>((val) => /^group_/.test(val)),
  type: z.literal("group"),
  value: groupConditionValueSchema,
});

const groupAggregationSchema = parameterBaseSchema.extend({
  key: z.literal("group_aggregation"),
  type: z.literal("group_aggregation"),
  value: z.enum(["avg", "sum", "count"]),
});

const tableColumnsSchema = parameterBaseSchema.extend({
  key: z.literal("columns"),
  type: z.literal("column"),
  value: z.string(),
});

const yearFilterSchema = parameterBaseSchema.extend({
  key: z.literal("year"),
  type: z.literal("filter"),
  value: z.object({ start: z.string(), end: z.string() }),
});

const areaFilterSchema = parameterBaseSchema.extend({
  key: z.literal("area"),
  type: z.literal("filter"),
  value: z.string().array(),
});

const filterConditionSchema = parameterBaseSchema.extend({
  key: z.custom<`filter_${string}`>((val) => /^filter_/.test(val)),
  type: z.literal("filter"),
  value: filterConditionValueSchema,
});

const pieLabelSchema = parameterBaseSchema.extend({
  key: z.literal("label"),
  type: z.literal("column"),
  value: z.enum([""]), // 実際の型に合わせて修正
});

const pieValueSchema = parameterBaseSchema.extend({
  key: z.literal("value"),
  type: z.literal("column"),
  value: z.enum([""]), // 実際の型に合わせて修正
});

export const parameterSchema = z.discriminatedUnion("key", [
  xAxisSchema,
  yAxisSchema,
  groupConditionSchema,
  groupAggregationSchema,
  tableColumnsSchema,
  yearFilterSchema,
  areaFilterSchema,
  filterConditionSchema,
  pieLabelSchema,
  pieValueSchema,
]);
