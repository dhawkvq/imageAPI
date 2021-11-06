import express from "express";
import fs from "fs";
import { middleWare } from "./middleware";
import { imageApi } from "./routes";
import { uploadPaths } from "./config";
import { logger } from "./log";

// create upload directory if none exists
for (const key in uploadPaths) {
  const path = uploadPaths[key];
  if (!fs.existsSync(path)) {
    logger.info("upload does not exist... creating upload path");
    fs.mkdir(path, { recursive: true }, (error) => {
      if (error) {
        logger.error(`error creating upload path: ${error}`);
        throw error;
      }
      logger.info("upload path created");
    });
  } else {
    logger.info("upload path exists");
  }
}

export const app = express();

app.use(express.static(uploadPaths.dev));

app.use(middleWare);

app.use("/api", imageApi);

app.get("/download/:fileName", (req, res, next) => {
  const { fileName } = req.params;
  const picPath = `${uploadPaths.dev}/${fileName}`;
  if (fs.existsSync(picPath)) {
    res.download(picPath, fileName);
  } else {
    res.statusCode = 400;
    next(new Error("file does not exist"));
  }
});
