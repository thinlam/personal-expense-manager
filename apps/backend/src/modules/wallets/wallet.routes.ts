import { Router } from "express";
import { requireAuth } from "../auth/auth.middleware";
import {
  adjustWalletBalanceController,
  createWalletController,
  getWalletByIdController,
  getWalletHistoryController,
  hideWalletController,
  listWalletsController,
  reorderWalletsController,
  setDefaultWalletController,
  transferBetweenWalletsController,
  updateWalletController,
} from "./wallet.controller";

const walletRouter = Router();

walletRouter.get("/", requireAuth, listWalletsController);
walletRouter.post("/", requireAuth, createWalletController);

walletRouter.patch("/reorder", requireAuth, reorderWalletsController);
walletRouter.post("/transfer", requireAuth, transferBetweenWalletsController);

walletRouter.get("/:id", requireAuth, getWalletByIdController);
walletRouter.patch("/:id", requireAuth, updateWalletController);
walletRouter.delete("/:id", requireAuth, hideWalletController);

walletRouter.patch("/:id/default", requireAuth, setDefaultWalletController);
walletRouter.post("/:id/adjust", requireAuth, adjustWalletBalanceController);
walletRouter.get("/:id/history", requireAuth, getWalletHistoryController);

export default walletRouter;