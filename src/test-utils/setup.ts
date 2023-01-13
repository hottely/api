import connectToDB from "../utils/connectToDB";

connectToDB(true).then(() => process.exit());
