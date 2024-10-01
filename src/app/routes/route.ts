import { Router } from "express";
import Controller from "../controllers/controller";
import { isAdmin, verifyToken } from "../../utils/jwt";

const router=Router()


router.post('/login',Controller.login);

// only for admin 
router.post('/createUser',verifyToken,isAdmin,Controller.createUser);
router.get('/getAllUser',verifyToken,isAdmin,Controller.getAllUser);
router.get('/getAllTeam',verifyToken,isAdmin,Controller.getAllUser);
router.get('/getUser/:id',verifyToken,isAdmin,Controller.getUser);







export default router