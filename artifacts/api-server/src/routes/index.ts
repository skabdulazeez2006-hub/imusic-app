import { Router, type IRouter } from "express";
import healthRouter from "./health";
import songsRouter from "./songs";
import albumsRouter from "./albums";
import artistsRouter from "./artists";
import searchRouter from "./search";
import chartsRouter from "./charts";
import staticSongsRouter from "./staticSongs"; // New static songs route

const router: IRouter = Router();

router.use(healthRouter);
router.use(songsRouter);
router.use(albumsRouter);
router.use(artistsRouter);
router.use(searchRouter);
router.use(chartsRouter);
router.use(staticSongsRouter); // Register static songs route

export default router;
