import { Router } from "express";
import UserController from "../controllers/userController";
import TaskController from "../controllers/taskController";
import { isAdmin, isAdminOrBO, isAdminOrManagement, isPoAndToOrBo, isTo, verifyToken } from "../../utils/jwt";
import userController from "../controllers/userController";
import { uploadMiddleware } from "../../utils/multer";

const router=Router()


router.post('/login',UserController.login);

// only for admin 
router.post('/createUser',verifyToken,isAdmin,UserController.createUser);
router.put('/updateUser',verifyToken,isAdmin,UserController.updateUser);
router.delete('/deleteUser/:id',verifyToken,isAdmin,UserController.deleteUser);
router.get('/getAllUser',verifyToken,isAdmin,UserController.getAllUser);
router.get('/getUser/:id',verifyToken,isAdmin,UserController.getUser);
router.get('/getAllTo',verifyToken,isAdmin,UserController.getAllTo)
router.get('/getHierarchyTo/:id',verifyToken,isAdmin,UserController.getHierarchyTo)
router.get('/getAllTeam',verifyToken,isAdmin,UserController.getAllTeam)
router.get('/searchUser',verifyToken,UserController.searchUser)


router.post('/createInventory',verifyToken,userController.createInventory);
router.get('/getAllInventory',verifyToken,userController.getAllInventory);
router.post('/createEvent',verifyToken,userController.createEvent);
router.get('/getAllEvent',verifyToken,userController.getAllEvent);

export default router