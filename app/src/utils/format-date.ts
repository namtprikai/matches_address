import dayjs from "dayjs";

export const formatDate = (date: string | number | Date): string => {
    if (!dayjs(date).isValid()) return "";
    return dayjs(date).format("YYYY/MM/DD HH:mm:ss");
};
