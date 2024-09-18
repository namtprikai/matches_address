import { Dialog } from "@fluentui/react-components";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { DialogBody } from "./ui/dialog-body";
import { DialogSurface } from "./ui/dialog-surface";

const BooleanSchema = z.object({
  referenceColumnType: z.literal("boolean"),
  operation: z.enum(["isTrue", "isFalse"]),
});

const NumberSchema = z.object({
  referenceColumnType: z.union([z.literal("float"), z.literal("integer")]),
  operation: z.enum(["eq", "noteq", "gt", "gte", "lt", "lte"]),
  value: z.number(),
});

const NumberRangeSchema = z.object({
  referenceColumnType: z.union([z.literal("float"), z.literal("integer")]),
  operation: z.enum(["range"]),
  startValue: z.number(),
  lastValue: z.number(),
  includesStart: z.boolean(),
  includesLast: z.boolean(),
});

const TextSchema = z.object({
  referenceColumnType: z.literal("text"),
  operation: z.enum(["eq", "noteq", "contains", "notContains"]),
  value: z.string(),
});

const DateSchema = z.object({
  referenceColumnType: z.literal("date"),
  operation: z.enum(["eq", "noteq", "gt", "gte", "lt", "lte"]),
  value: z.string(),
});

const DateRangeSchema = z.object({
  referenceColumnType: z.literal("date"),
  operation: z.enum(["range"]),
  startValue: z.string(),
  lastValue: z.string(),
  includesStart: z.boolean(),
  includesLast: z.boolean(),
});

const schema = z.object({
  conditions: z
    .object({
      key: z.string(),
      value: z
        .union([
          BooleanSchema,
          z.discriminatedUnion("operation", [NumberSchema, NumberRangeSchema]),
          z.discriminatedUnion("operation", [DateSchema, DateRangeSchema]),
          TextSchema,
        ])
        .and(z.object({ referenceColumn: z.string() })),
      type: z.literal("filter"),
    })
    .array(),
});

type conditions = z.infer<typeof schema.shape.conditions>;

type EditorFilterConditionsFormProps = {
  conditions: conditions;
};

export const EditorFilterConditionsForm = (
  props: EditorFilterConditionsFormProps,
): JSX.Element => {
  const { control, register } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      conditions: props.conditions,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "conditions",
  });

  return (
    <Dialog>
      <DialogSurface>
        <DialogBody>
          {fields.map((field, index) => {
            if (
              field.value.referenceColumnType === "integer" ||
              field.value.referenceColumnType === "float"
            ) {
              if (field.value.operation === "range") {
                return (
                  <div key={field.id}>
                    <input
                      {...register(`conditions.${index}.value.startValue`)}
                    />
                    <input
                      {...register(`conditions.${index}.value.lastValue`)}
                    />
                    <button onClick={() => remove(index)}>Remove</button>
                  </div>
                );
              } else {
                return (
                  <div key={field.id}>
                    <input {...register(`conditions.${index}.value.value`)} />
                    <button onClick={() => remove(index)}>Remove</button>
                  </div>
                );
              }
            }
          })}
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
