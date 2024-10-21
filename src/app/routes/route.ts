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

router.post('/createBrand',verifyToken,isAdmin,UserController.createBrand);
router.put('/updateBrand',verifyToken,isAdmin,UserController.updateBrand);
router.delete('/deleteBrand/:id',verifyToken,isAdmin,UserController.deleteBrand);
router.get('/getAllBrand',verifyToken,isAdminOrBO,UserController.getAllBrand);
router.get('/getBrand/:id',verifyToken,isAdminOrBO,UserController.getBrand);

router.get('/getBrandDetail/:id',verifyToken,isPoAndToOrBo,UserController.getBrandDetail)
router.post('/addBrandContact',verifyToken,isAdminOrBO,UserController.addBrandContact);
router.put('/updateBrandContact',verifyToken,isAdminOrBO,UserController.updateBrandContact);

router.post('/addBrandOwnership',verifyToken,isTo,UserController.addBrandOwnership)

router.get('/searchUser',verifyToken,UserController.searchUser)




router.post('/createInventory',verifyToken,userController.createInventory);
router.get('/getAllInventory',verifyToken,userController.getAllInventory);
router.post('/createEvent',verifyToken,userController.createEvent);
router.get('/getAllEvent',verifyToken,userController.getAllEvent);


router.get('/getAllTasks',verifyToken,TaskController.getTasks);
router.get('/getTask/:id',verifyToken,TaskController.getTask);
router.post('/createTask',verifyToken,isAdminOrManagement,TaskController.createTask);
router.put('/updateTask',verifyToken,TaskController.updateTask);

router.delete('/deleteTask/:id',verifyToken,TaskController.deleteTask);

router.get('/getNotification/:id',verifyToken,TaskController.getNotification);
router.get('/getTaskHistory/:id',verifyToken,TaskController.getHistory);


router.post('/addComment', verifyToken, uploadMiddleware, TaskController.addComment); // Add upload middleware here
router.delete('/deleteComment/:id',verifyToken,TaskController.deleteComment);
router.get('/getComment/:id',verifyToken,TaskController.getComment);
router.put('/updateComment', verifyToken, uploadMiddleware, TaskController.updateComment); // Add upload middleware here

router.get('/filterTask',verifyToken,TaskController.getFilteredAndSortedTasks);
router.get('/getAnalytics',verifyToken,isAdminOrManagement,TaskController.getAnalytics);






export default router