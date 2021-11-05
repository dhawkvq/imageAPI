import path from "path";
import { PathRecord } from "../config";

export const formatFileName = (
  fileName: string,
  height = 0,
  width = 0,
  hash: string
): string => {
  const [name, fileType] = fileName.split(".");
  const probableHeight = height ? height : width;
  const probableWidth = width ? width : height;
  return `${name}${probableWidth}x${probableHeight}-${hash}.${fileType}`;
};

export const formatReponseTime = (time: string): number => +time.split("ms")[0];

export const producePaths = (paths: PathRecord): PathRecord =>
  Object.entries(paths).reduce(
    (acc, [key, val]) => ({ ...acc, [key]: path.join(__dirname, val) }),
    {} as PathRecord
  );
