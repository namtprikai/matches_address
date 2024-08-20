import { sql } from "drizzle-orm";
import {
    result_views,
} from "../schema";
import { db } from "../utils/db";
import { type IpcMainListener } from ".";

export type SelectResultViewResponse = typeof result_views.$inferSelect;

export const selectResultView = ((
    _: unknown,
    { resultViewId }: { resultViewId: number },
): SelectResultViewResponse | undefined => {
    const data = db
        .select()
        .from(result_views)
        .where(sql`${result_views.id} = ${resultViewId}`).get();

    return data;
}) satisfies IpcMainListener;
