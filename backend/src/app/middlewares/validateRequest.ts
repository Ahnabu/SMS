import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodEffects } from "zod";
import { catchAsync } from "../utils/catchAsync";

const validateRequest = (schema: AnyZodObject | ZodEffects<AnyZodObject>) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsedData = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies,
    });

    // Update request with parsed data
    req.body = parsedData.body;
    req.query = parsedData.query;
    req.params = parsedData.params;
    req.cookies = parsedData.cookies;

    // console.log("Validated and parsed request data:", {
    //   body: req.body,
    //   query: req.query,
    //   params: req.params,
    // });

    next();
  });
};

export { validateRequest };
