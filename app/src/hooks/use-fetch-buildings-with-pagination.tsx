import useSWR, { type SWRResponse } from "swr";
import { type SelectBuildingsWithPaginationReturnType } from "../ipc-main-listeners/select-buildings-with-pagination";
import { type SelectDataSetDetailArea } from "../schema";

type Params = {
  id: SelectDataSetDetailArea["id"];
  page: number;
  limitPerPage: number;
};

type Response = SelectBuildingsWithPaginationReturnType;

const fetcher = ([id, page, limitPerPage]: [
  Params["id"],
  Params["page"],
  Params["limitPerPage"],
  string,
]): Response => {
  const result = window.ipcRenderer.invoke("selectBuildingsWithPagination", {
    id,
    page,
    limitPerPage,
  });

  return result;
};

export const useFetchBuildingsWithPagination = ({
  id,
  page,
  limitPerPage,
}: Params): SWRResponse<Awaited<Response>> => {
  const swr = useSWR(
    [id, page, limitPerPage, useFetchBuildingsWithPagination.name],
    fetcher,
  );
  return swr;
};
