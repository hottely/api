import { ApolloServer } from "apollo-server-express";
import bodyParser from "body-parser";
import console from "console";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import Express from "express";
import http from "http";
import { verify } from "jsonwebtoken";
import "reflect-metadata";
import { User } from "./entity/User";
import { BookingAPI } from "./modules/bookings/resolvers/BookingsResolver";
import { LandlordAPI } from "./modules/landlord/resolvers/LandlordResolver";
import { createAccessToken, createRefreshToken } from "./utils/auth";
import connectToDB from "./utils/connectToDB";
import { createSchema } from "./utils/createSchema";
import { sendRefreshToken } from "./utils/sendRefreshToken";

const main = async () => {
  await connectToDB();
  console.log("CONNECTED TO DB");

  const schema = await createSchema();

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res, connection }: any) => {
      if (connection) {
        return {
          currentUser: connection.context.currentUser,
        };
      }

      return {
        req,
        res,
      };
    },
    playground: {
      settings: {
        "request.credentials": "include",
      },
    },
    introspection: true,
    dataSources: (): any => {
      return {
        bookingsAPI: new BookingAPI(),
        landlordAPI: new LandlordAPI(),
      };
    },
  });

  const app = Express();

  const httpServer = http.createServer(app);

  app.set("trust proxy", true);
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  app.use(cors({ origin: true, credentials: true }));

  app.get("/", (_req, res) => res.send("Hottely Gateway"));

  app.post("/refreshToken", async (req, res) => {
    console.log("REFRESHING ACCES TOKEN");

    const token = req.cookies.rtoken;
    if (!token) {
      console.log("ACCES TOKEN not present");

      return res.send({ ok: false, accessToken: "" });
    }

    let payload: any = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET!);
    } catch (err) {
      console.log("ACCES TOKEN invalid");

      return res.send({ ok: false, accessToken: "" });
    }

    // token is valid and
    // we can send back an access token
    const user = await User.findOne({ id: payload.userId });

    if (!user) {
      return res.send({ ok: false, accessToken: "" });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: "" });
    }

    sendRefreshToken(res, createRefreshToken(user));

    console.log("ACCES TOKEN send");

    return res.send({ ok: true, accessToken: createAccessToken(user) });
  });

  apolloServer.applyMiddleware({ app, cors: false, path: "/api" });

  const PORT = process.env.PORT || 4000;
  const HOST = process.env.HOST || "localhost";

  httpServer.listen(PORT, function () {
    console.log("API LISTENING ON PORT", PORT);
  });
};

main().catch((err) => console.error(err));
