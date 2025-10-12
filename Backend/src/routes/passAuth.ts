import { Router } from "express";
import { issuePass } from "../middleware/issuePass.js";

const router = Router();

router.post("/issue-pass", issuePass);

export default router;
