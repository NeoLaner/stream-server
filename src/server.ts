import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config({ path: "./config.env" });
//eslint-disable-next-line
import expressServer from "./app";

const PORT = process.env.PORT || 3000;

async function mainApp() {
  await mongoose.connect(`${process.env.DATABASE}`);
  console.log("db connected");

  expressServer.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
  });
}

//eslint-disable-next-line
mainApp();
