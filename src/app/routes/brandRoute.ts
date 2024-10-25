import { Router } from "express";
import UserController from "../controllers/userController";
import { isAdmin, isAdminOrBO, isAdminOrManagement, isPoAndToOrBo, isTo, verifyToken } from "../../utils/jwt";

const router=Router()



router.post('/createBrand',verifyToken,isAdmin,UserController.createBrand);
router.put('/updateBrand',verifyToken,isAdmin,UserController.updateBrand);
router.delete('/deleteBrand/:id',verifyToken,isAdmin,UserController.deleteBrand);
router.get('/getAllBrand',verifyToken,isAdminOrBO,UserController.getAllBrand);
router.get('/getBrand/:id',verifyToken,isAdminOrBO,UserController.getBrand);

router.get('/getBrandDetail/:id',verifyToken,isPoAndToOrBo,UserController.getBrandDetail)
router.post('/addBrandContact',verifyToken,isAdminOrBO,UserController.addBrandContact);
router.put('/updateBrandContact',verifyToken,isAdminOrBO,UserController.updateBrandContact);

router.post('/addBrandOwnership',verifyToken,isTo,UserController.addBrandOwnership)


export default router