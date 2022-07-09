import Cors from "cors";
import { NextApiRequest, NextApiResponse } from "next";

const cors = Cors();

export const applyCors = (req: NextApiRequest, res: NextApiResponse) => {
  return new Promise((resolve, reject) => {
    cors(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};
