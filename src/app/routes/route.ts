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
router.put('/updateBrand',verifyToken,isAdminOrBO,Controller.updateBrand);
router.get('/getAllBrand',verifyToken,isAdminOrBO,Controller.getAllBrand);
router.get('/getBrand',verifyToken,isAdminOrBO,Controller.getBrand);

router.post('/addBrandContact',verifyToken,isAdminOrBO,Controller.addBrandContact);
router.put('/updateBrandContact',verifyToken,isAdminOrBO,Controller.updateBrandContact);






export default router