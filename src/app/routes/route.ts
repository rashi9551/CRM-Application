import { Router } from "express";
import Controller from "../controllers/controller";
import { isAdmin, isAdminOrBO, verifyToken } from "../../utils/jwt";

const router=Router()


router.post('/login',Controller.login);

// only for admin 
router.post('/createUser',verifyToken,isAdmin,Controller.createUser);
router.put('/updateUser',verifyToken,isAdmin,Controller.updateUser);
router.get('/getAllUser',verifyToken,isAdmin,Controller.getAllUser);
router.get('/getUser/:id',verifyToken,isAdmin,Controller.getUser);
router.get('/getAllTo',verifyToken,isAdmin,Controller.getAllTo)
router.get('/getAllTeam',verifyToken,isAdmin,Controller.getAllTeam)

router.post('/createBrand',verifyToken,isAdminOrBO,Controller.createBrand);
router.put('/updateBrand');
router.get('/getBrand/:id');
router.get('/getAllBrand');

router.post('/addBrandContact');
router.put('/updateBrandContact');






export default router