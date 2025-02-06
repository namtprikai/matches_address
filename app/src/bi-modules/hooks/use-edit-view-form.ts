import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type UseFormReturn } from "react-hook-form";
import { z } from "zod";

const schema = z.object({});

type FormType = z.infer<typeof schema>;

export const useEditViewForm = (): UseFormReturn<FormType> => {
  return useForm<FormType>({
    resolver: zodResolver(schema),
    defaultValues: {},
  });
};
