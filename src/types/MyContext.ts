import { Request, Response } from "express";

export interface MyContext {
  req: Request;
  res: Response;
  currentUser?: { id: number };
}
