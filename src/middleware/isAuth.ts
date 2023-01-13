import { verify } from "jsonwebtoken";
import { MiddlewareFn } from "type-graphql";
import { User } from "../entity/User";
import { MyContext } from "../types/MyContext";

export const checkAuth = async (context: any, roles: any) => {
  const authorization = context.req.headers["authorization"];

  if (!authorization) {
    return false;
  }

  try {
    const token = authorization.split(" ")[1];
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!) as any;
    const { userId } = payload;

    if (userId) {
      const user = await User.findOne({ where: { id: userId } });
      context.currentUser = user;
    }
  } catch (err) {
    return false;
  }

  // CHECK IF USER IS ADMIN

  try {
    if (roles.includes("ADMIN") && !context.currentUser.isAdmin) {
      return false;
    }
  } catch (error) {
    return false;
  }

  return true;
};

export const isAuth: MiddlewareFn<MyContext> = async ({ context }, next) => {
  if (!checkAuth(context, null)) {
    throw new Error("Not authenticated");
  }
  return next();
};
