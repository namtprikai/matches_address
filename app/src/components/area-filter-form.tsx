import { type FetchAreaGroupsArg } from "../ipc-main-listeners/fetch-area-groups";
import { useFetchAreaGroups } from "../hooks/use-fetch-area-groups";
import { Field } from "./ui/field";

export type AreaFilterFormProps = FetchAreaGroupsArg;

export const AreaFilterForm = (props: AreaFilterFormProps): JSX.Element => {
  const { data } = useFetchAreaGroups(props);

  return (
    <Field label="地域">
      <select>
        {data?.map((area) => (
          <option key={area} value={area}>
            {area}
          </option>
        ))}
      </select>
    </Field>
  );
};
