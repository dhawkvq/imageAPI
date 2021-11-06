import { Router } from "express";
import fs from "fs";
import { readFile } from "fs/promises";
import path from "path";
import hash from "object-hash";
import { ResizeOptions } from "sharp";
import { formatFileName } from "../utils";
import { myCache } from "../cache";
import multer from "multer";
import { uploadPaths, TEST } from "../config";
import { resizeImage } from "../api";
import { logger } from "../log";

const upload = multer();

export const imageApi = Router();

imageApi.get("/pictures", (req, res, next) => {
  logger.info("GET /api/pictures accessed");
  fs.readdir(uploadPaths.dev, (err, files) => {
    if (!err) {
      logger.info("GET /api/pictures success.... sending files");
      res.json(files);
    } else {
      logger.error(`GET /api/pictures error: ${err}`);
      next(err);
    }
  });
});

imageApi.post("/resize/:fileName", async (req, res, next) => {
  const { fileName } = req.params;
  logger.info(`POST /api/resize/${fileName} accessed`);

  const { height, width }: ResizeOptions = req.body;
  const errorMessages: string[] = [];

  const imagePath = path.join(__dirname, `../images/${fileName}`);

  if (!fileName) {
    errorMessages.push("image file name to resize is required");
  }
  if (!fs.existsSync(imagePath)) {
    errorMessages.push(`${fileName} does not exist`);
  }
  if (!height && !width) {
    errorMessages.push("either height or width argument is required");
  }
  if (errorMessages.length) {
    res.statusCode = 400;
    const joinedErrorMessages = errorMessages.join();
    logger.error(`POST /api/resize/${fileName} errors: ${joinedErrorMessages}`);
    next(new Error(errorMessages.join()));
  } else {
    const options: ResizeOptions = req.body.options || {};
    const picWidth = width ? +width : undefined;
    const picHeight = height ? +height : undefined;
    const picKeyHash = hash({ fileName, picHeight, picWidth, ...options });

    const existingFilePath: string | undefined = myCache.get(picKeyHash);
    const picHashIdentifier = picKeyHash.slice(0, 8);

    if (existingFilePath) {
      logger.info(
        `POST /api/resize/${fileName} in cache.... sending image from cache`
      );
      const curFileName = existingFilePath.split("uploads/")[1];
      res.download(existingFilePath, curFileName);
    } else {
      const tempPath = `${uploadPaths.dev}/temp-${hash(Date.now())}`;

      try {
        const buffer = await readFile(imagePath);

        const { height, width } = await resizeImage(
          buffer,
          tempPath,
          { picHeight, picWidth },
          options
        );

        const formattedFileName = formatFileName(
          fileName,
          height,
          width,
          picHashIdentifier
        );

        const filePath = `${uploadPaths.dev}/${formattedFileName}`;

        fs.rename(tempPath, filePath, (error) => {
          if (error) {
            res.statusCode = 500;
            throw new Error("image rename failed");
          }
        });

        const set = myCache.set(picKeyHash, filePath, TEST ? 5 : "");
        if (set) {
          logger.info(`POST /api/resize/${fileName} image placed in cache`);
        } else {
          logger.error(
            `POST /api/resize/${fileName} error: failed to place image in cache`
          );
        }

        res.download(filePath, fileName);
      } catch (error) {
        logger.error(`POST /api/resize/${fileName} error: ${error}`);
        next(error);
      }
    }
  }
});

imageApi.post("/resize", upload.single("image"), async (req, res, next) => {
  logger.info("POST /api/resize accessed");
  const { height, width }: ResizeOptions = req.body;
  const errorMessages: string[] = [];
  if (!req.file) {
    errorMessages.push("image file to process is required");
  }
  if (!height && !width) {
    errorMessages.push("either height or width argument is required");
  }
  if (errorMessages.length) {
    res.statusCode = 400;
    const joinedErrorMessages = errorMessages.join();
    logger.error(`POST /api/resize errors: ${joinedErrorMessages}`);
    next(new Error(errorMessages.join()));
  } else {
    // should be unreachable based off no file and error messages.length being present
    // ts is not recognizing above case - reason for explicit cast of file being present.
    const { buffer, originalname }: Express.Multer.File = req.file!;
    const options: ResizeOptions = req.body.options || {};
    const picWidth = width ? +width : undefined;
    const picHeight = height ? +height : undefined;

    const picKeyHash = hash({ originalname, picHeight, picWidth, ...options });
    const picHashIdentifier = picKeyHash.slice(0, 8);

    const existingFilePath: string | undefined = myCache.get(picKeyHash);

    if (existingFilePath) {
      logger.info(
        `POST /api/resize file:${originalname} in cache.... sending image from cache`
      );
      const curFileName = existingFilePath.split("uploads/")[1];
      res.download(existingFilePath, curFileName);
    } else {
      const tempPath = `${uploadPaths.dev}/temp-${hash(Date.now())}`;

      try {
        const { height, width } = await resizeImage(
          buffer,
          tempPath,
          { picHeight, picWidth },
          options
        );

        const fileName = formatFileName(
          originalname,
          height,
          width,
          picHashIdentifier
        );

        const filePath = `${uploadPaths.dev}/${fileName}`;

        fs.rename(tempPath, filePath, (error) => {
          if (error) {
            res.statusCode = 500;
            throw new Error("image rename failed");
          }
        });

        const set = myCache.set(picKeyHash, filePath, TEST ? 5 : "");
        if (set) {
          logger.info(`POST /api/resize/${fileName} image placed in cache`);
        } else {
          logger.error(
            `POST /api/resize/${fileName} error: failed to place image in cache`
          );
        }

        res.download(filePath, fileName);
      } catch (error) {
        logger.error(`POST /api/resize error: ${error}`);
        next(error);
      }
    }
  }
});
