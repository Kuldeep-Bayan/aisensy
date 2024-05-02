import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { getContacts, uploadCsvFile } from "../controllers/user.controller.js";

const router = Router();

router.route("/upload").post(upload.single("contactsFile"), uploadCsvFile);
router.route("/getcontacts").get(getContacts);

export default router;
