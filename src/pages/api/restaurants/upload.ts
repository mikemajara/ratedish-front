import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@lib/prisma";
import { getSession } from "next-auth/react";
import { logger } from "@lib/logger";
import base64 from "crypto-js/enc-base64";
import {
  getEmailAndApiKeyFromHeader,
  isUserAuthorizedWithApiKey,
} from "@lib/auth/api-key";
import nextConnect from "next-connect";
import multer from "multer";
import { pseudoRandomBytes } from "crypto";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({
  storage: multer.diskStorage({
    destination: "public/images/restaurants",
    filename: function (req, file, cb) {
      pseudoRandomBytes(16, function (err, raw) {
        cb(
          null,
          raw.toString("hex") +
            Date.now() +
            "." +
            path.extname(file.originalname),
        );
      });
    },
  }),
});

const apiRoute = nextConnect<NextApiRequest, NextApiResponse>({
  onError(error, req, res) {
    res
      .status(501)
      .json({ error: `Sorry something Happened! ${error.message}` });
  },
  onNoMatch(req, res) {
    res
      .status(405)
      .json({ error: `Method '${req.method}' Not Allowed` });
  },
});

apiRoute.use(upload.single("file"));

apiRoute.post((req, res) => {
  res.status(200).json({ file: req.file });
});

export default apiRoute;
