import { logUtils } from "../utils";
import { Request, Response, NextFunction } from "express";

export default (req: Request, res: Response, next: NextFunction) => {
  const { method, url, query, body, headers, ip } = req;
  logUtils.access.info(
    method,
    url,
    query,
    body,
    headers["user-agent"],
    headers.host,
    ip
  );
  next();
};
