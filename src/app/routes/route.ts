import { Router } from "express";
import UserController from "../controllers/userController";
import TaskController from "../controllers/taskController";
import { isAdmin, isAdminOrBO, isAdminOrManagement, isPoAndToOrBo, isTo, verifyToken } from "../../utils/jwt";
import userController from "../controllers/userController";
import taskController from "../controllers/taskController";

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
router.post('/createEvent',verifyToken,userController.createEvent);


router.get('/getAllTasks',verifyToken,taskController.getTasks);
router.get('/getTask/:id',verifyToken,taskController.getTask);
router.post('/createTask',verifyToken,isAdminOrManagement,TaskController.createTask);
router.put('/updateTask',verifyToken,taskController.updateTask);
router.delete('/tasks/delete/:id');


router.get('/getNotification/:id',verifyToken,taskController.getNotification);
router.get('/getTaskHistory/:id',verifyToken,taskController.getHistory);





router.post('/tasks/:id/comment');
router.get('/tasks/:id/comments');

router.get('/tasks/filter');
router.get('/tasks/sort');

router.get('/tasks/analytics');

router.get('/tasks/:id/notify');




export default router