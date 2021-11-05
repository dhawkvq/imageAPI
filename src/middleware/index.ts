import express from "express";
import cors from "cors";
import responseTime from "response-time";
export const middleWare = express.Router();

middleWare.use(cors({ origin: "*" }));

middleWare.use(express.json());

middleWare.use(responseTime());
