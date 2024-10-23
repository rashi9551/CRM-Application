import { validateOrReject } from "class-validator";
import { Task, TaskStatus } from "../entity/Task";
import { RoleName, TaskData, TaskHistoryAction } from "../interfaces/interface";
import taskUseCase from "../app/services/taskServices";
import { StatusCode } from "../interfaces/enum";
import { User } from "../entity/User";
export const checkTaskPermission = (existingTask: Task, loggedUserId?: number, roles?: string[]): boolean => {
    return existingTask.created_by === loggedUserId ||
           existingTask.assigned_to === loggedUserId ||
           roles?.some(role => [RoleName.ADMIN, RoleName.MANAGEMENT].includes(role as RoleName));
};


export const handleTaskUpdate = async (existingTask: Task, taskData: TaskData, loggedUserId?: number) => {
    let isGeneralUpdate = true;
    let isStatusChanging = true;

    // Handle task status change
    if (taskData.status && taskData.status === TaskStatus.Completed) {
        if (existingTask.assigned_to !== loggedUserId) {
            throw new Error("Only the assigned user can update the task to completed.");
        }
        isGeneralUpdate = false;
    }

    // Handle reassignment logic
    if (taskData.assigned_to && existingTask.assigned_to !== taskData.assigned_to) {
        if (existingTask.created_by !== loggedUserId) {
            throw new Error(`Only the creator of the task can reassign it.`);
        }
        isGeneralUpdate = false;
        isStatusChanging = false;
        existingTask.assigned_to = taskData.assigned_to;
        
        console.log("re assigning okeey");
        
    }

    // Update task with new data
    Object.assign(existingTask, taskData);

    // Validate the updated task entity
    await validateOrReject(existingTask);

    return { isGeneralUpdate, isStatusChanging, updatedTask: existingTask };
};


export const handleHistoryAndNotifications = async (isGeneralUpdate: boolean, isStatusChanging: boolean, savedTask: Task, loggedUserId: number,assignedTo:User,createdBy:User) => {
    let taskHistory;
    let notification;

    if (isGeneralUpdate) {
       console.log(" the task has been updated");
       console.log(savedTask,assignedTo);
       
        [taskHistory, notification] = await Promise.all([
            taskUseCase.TaskHistoryLogging(savedTask, TaskHistoryAction.TASK_UPDATED, `The Task ${savedTask.title} was updated.`, loggedUserId),
            taskUseCase.NotificationSending(`Your task has been updated: ${savedTask.title}`, savedTask, assignedTo, assignedTo.id),
        ]);
    } else if (isStatusChanging) {
        console.log("the task was completed adn the history is logging");

        taskHistory = await taskUseCase.TaskHistoryLogging(savedTask, TaskHistoryAction.TASK_COMPLETED, `The Task ${savedTask.title} was completed.`, loggedUserId);
    } else {
        console.log(savedTask.assigned_to,"it reassiging and notification going",savedTask);
        
        [taskHistory, notification] = await Promise.all([
            taskUseCase.TaskHistoryLogging(savedTask, TaskHistoryAction.TASK_REASSIGNED, `The Task ${savedTask.title} was reassigned.`, loggedUserId),
            taskUseCase.NotificationSending(`You have been assigned a new task: ${savedTask.title}`, savedTask, assignedTo, savedTask.assigned_to),
        ]);
    }

    return { taskHistory, notification };
};


export const handleError = (error: any): { status: number, message: string } => {
    // Check if the error is an array (i.e., validation errors from validateOrReject)
    if (Array.isArray(error) && error.length > 0) {
        const firstError = error[0];
        const fieldName = firstError.property;
        const firstConstraintMessage = firstError.constraints[Object.keys(firstError.constraints || [])[0]];
        return { status: StatusCode.BadRequest as number, message: `${fieldName}: ${firstConstraintMessage}` };
    }

    // Handle general thrown errors (like permission errors or custom messages)
    if (error instanceof Error) {
        console.log(error);
        
        // Custom error message handling
        return { status: StatusCode.BadRequest as number, message: error.message };
    }

    console.error("Error during updating task:", error);
    return { status: StatusCode.InternalServerError as number, message: "Internal server error." };
};