import express from "express";
import fs from "fs";
import { middleWare } from "./middleware";
import { imageApi } from "./routes";
import { uploadPaths } from "./config";

// create upload directory if none exists
for (const key in uploadPaths) {
  const path = uploadPaths[key];
  if (!fs.existsSync(path)) {
    fs.mkdir(path, { recursive: true }, (error) => {
      if (error) throw error;
    });
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
