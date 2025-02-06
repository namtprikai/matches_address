import { z } from "zod";

const TextGroupingConditionSchema = z.object({
  label: z.string(),
  referenceColumnType: z.literal("text"),
  value: z.string(),
  operation: z.enum(["eq", "noteq", "contains", "notContains"]),
});

const NumberGroupingConditionSchema = z.object({
  label: z.string(),
  referenceColumnType: z.enum(["integer", "float"]),
  operation: z.enum(["eq", "noteq", "gt", "lt", "gte", "lte"]),
  value: z.number(),
});

const NumberRangeGroupingConditionSchema = z.object({
  label: z.string(),
  referenceColumnType: z.enum(["integer", "float"]),
  operation: z.literal("range"),
  startValue: z.number(),
  lastValue: z.number(),
  includesStart: z.boolean(),
  includesLast: z.boolean(),
});

const DateGroupingConditionSchema = z.object({
  label: z.string(),
  referenceColumnType: z.literal("date"),
  operation: z.enum(["eq", "noteq", "gt", "lt", "gte", "lte"]),
  value: z.string(),
});

const DateRangeGroupingConditionSchema = z.object({
  label: z.string(),
  referenceColumnType: z.literal("date"),
  operation: z.literal("range"),
  startValue: z.string(),
  lastValue: z.string(),
  includesStart: z.boolean(),
  includesLast: z.boolean(),
});

const BooleanGroupingConditionSchema = z.object({
  label: z.string(),
  referenceColumnType: z.literal("boolean"),
  operation: z.enum(["isTrue", "isFalse"]),
  value: z.undefined(),
});

export const GroupConditionValueSchema = z.discriminatedUnion(
  "referenceColumnType",
  [
    TextGroupingConditionSchema,
    NumberGroupingConditionSchema,
    NumberRangeGroupingConditionSchema,
    DateGroupingConditionSchema,
    DateRangeGroupingConditionSchema,
    BooleanGroupingConditionSchema,
  ],
);
