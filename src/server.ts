import dotenv from "dotenv";
import expressServer from "./app";

dotenv.config({ path: "./config.env" });
const PORT = process.env.PORT || 3000;

expressServer.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
