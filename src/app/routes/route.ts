import { Router } from "express";
import Controller from "../controllers/controller";
import { isAdmin, verifyToken } from "../../utils/jwt";

const router=Router()



router.post('/createUser',verifyToken,isAdmin,Controller.createUser);
router.post('/login',Controller.login);




export default router