import { z } from "zod";

const TextFilterConditionSchema = z.object({
  referenceColumnType: z.literal("text"),
  referenceColumn: z.string(),
  value: z.string(),
  operation: z.enum(["eq", "noteq", "contains", "notContains"]),
});

const NumberFilterConditionSchema = z.object({
  referenceColumnType: z.enum(["integer", "float"]),
  referenceColumn: z.string(),
  operation: z.enum(["eq", "noteq", "gt", "lt", "gte", "lte"]),
  value: z.number(),
});

const NumberFilterConditionRangeSchema = z.object({
  referenceColumnType: z.enum(["integer", "float"]),
  referenceColumn: z.string(),
  operation: z.literal("range"),
  startValue: z.number(),
  lastValue: z.number(),
  includesStart: z.boolean(),
  includesLast: z.boolean(),
});

const DateFilterConditionSchema = z.object({
  referenceColumnType: z.literal("date"),
  referenceColumn: z.string(),
  operation: z.enum(["eq", "noteq", "gt", "lt", "gte", "lte"]),
  value: z.string(),
});

const DateFilterConditionRangeSchema = z.object({
  referenceColumnType: z.literal("date"),
  referenceColumn: z.string(),
  operation: z.literal("range"),
  startValue: z.string(),
  lastValue: z.string(),
  includesStart: z.boolean(),
  includesLast: z.boolean(),
});

const BooleanFilterConditionSchema = z.object({
  referenceColumnType: z.literal("boolean"),
  referenceColumn: z.string(),
  operation: z.enum(["isTrue", "isFalse"]),
  value: z.undefined(),
});

export const FilterConditionValueSchema = z.discriminatedUnion(
  "referenceColumnType",
  [
    TextFilterConditionSchema,
    NumberFilterConditionSchema,
    NumberFilterConditionRangeSchema,
    DateFilterConditionSchema,
    DateFilterConditionRangeSchema,
    BooleanFilterConditionSchema,
  ],
);
