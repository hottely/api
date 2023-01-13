import { createConnection } from "typeorm";
import getSrcPath from "./getSrcPath";

const {
  NODE_ENV,
  DB_USER = "postgres",
  DB_PASSWORD = "postgres",
  DB_HOST = "localhost",
  DB_NAME = "hottely-dev",
  DB_PORT = "5432",
  DB_URL,
} = process.env;

const connectToDB = (drop: boolean = false) => {
  if (NODE_ENV === "production") {
    return createConnection({
      type: "postgres",
      url: DB_URL,
      ssl: { rejectUnauthorized: false },
      synchronize: true,
      dropSchema: drop,
      entities: [getSrcPath() + "/entity/*.*"],
    });
  } else {
    return createConnection({
      type: "postgres",
      host: DB_HOST,
      username: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: parseInt(DB_PORT),
      synchronize: true,
      dropSchema: drop,
      logging: false,
      entities: [getSrcPath() + "/entity/*.*"],
    });
  }
};

export default connectToDB;
