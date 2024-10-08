import { Router } from "express";
import Controller from "../controllers/controller";
import { isAdmin, isAdminOrBO, isPoAndToOrBo, isTo, verifyToken } from "../../utils/jwt";

const router=Router()


router.post('/login',Controller.login);

// only for admin 
router.post('/createUser',verifyToken,isAdmin,Controller.createUser);
router.put('/updateUser',verifyToken,isAdmin,Controller.updateUser);
router.delete('/deleteUser/:id',verifyToken,isAdmin,Controller.deleteUser);
router.get('/getAllUser',verifyToken,isAdmin,Controller.getAllUser);
router.get('/getUser/:id',verifyToken,isAdmin,Controller.getUser);
router.get('/getAllTo',verifyToken,isAdmin,Controller.getAllTo)
router.get('/getHierarchyTo/:id',verifyToken,isAdmin,Controller.getHierarchyTo)
router.get('/getAllTeam',verifyToken,isAdmin,Controller.getAllTeam)

router.post('/createBrand',verifyToken,isAdmin,Controller.createBrand);
router.put('/updateBrand',verifyToken,isAdmin,Controller.updateBrand);
router.delete('/deleteBrand/:id',verifyToken,isAdmin,Controller.deleteBrand);
router.get('/getAllBrand',verifyToken,isAdminOrBO,Controller.getAllBrand);
router.get('/getBrand/:id',verifyToken,isAdminOrBO,Controller.getBrand);

router.get('/getBrandDetail/:id',verifyToken,isPoAndToOrBo,Controller.getBrandDetail)
router.post('/addBrandContact',verifyToken,isAdminOrBO,Controller.addBrandContact);
router.put('/updateBrandContact',verifyToken,isAdminOrBO,Controller.updateBrandContact);

router.post('/addBrandOwnership',verifyToken,isTo,Controller.addBrandOwnership)

router.get('/searchUser',verifyToken,Controller.searchUser)



export default router