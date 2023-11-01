import { Router } from "express";
import { videoStream } from "../controllers/videoControl";

const router = Router();

const videoRouter = router.get("/:filename", videoStream);

export default videoRouter;
