// pages/api/download.js
import fs from "fs";
import path from "path";
import { NextApiResponse, NextApiRequest } from "next";

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), "data", "resumes", "resumes.rar");
  const stat = fs.statSync(filePath);

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Content-Disposition", "attachment; filename=resumes.rar");

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
}
