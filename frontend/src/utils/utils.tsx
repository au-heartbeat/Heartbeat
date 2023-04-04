export const arrayIntersection = (originArray: string[], importedArray: string[]) =>
  originArray.filter((item) => importedArray.includes(item))
