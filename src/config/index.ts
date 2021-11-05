import dotenv from "dotenv";
import { producePaths } from "../utils";
dotenv.config();

const { SERVER_URL, TEST } = process.env;

export type PathRecord = Record<string, string>;

const devUploadPaths: PathRecord = {
  dev: "../uploads",
};

// will not be testing files showing up in static or download capability from api route
// reason for splitting paths for dev and api
const testUploadPaths: PathRecord = {
  dev: "../routes/tests/uploads",
  api: "../api/tests/uploads",
};

const paths = TEST ? testUploadPaths : devUploadPaths;

const uploadPaths = producePaths(paths);

export { SERVER_URL, uploadPaths, TEST };
