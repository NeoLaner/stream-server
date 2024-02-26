import { Router } from "express";
import { videoStream } from "../entry-points/api/videoControl";

const router = Router();

const videoRouter = router.get("/:filename", videoStream);

export default videoRouter;
