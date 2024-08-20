export const getKeys = <T extends { [key: string | symbol]: unknown }>(obj: T): (keyof T)[] => {
    return Object.keys(obj)
}
