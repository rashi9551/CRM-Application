import { TaskStatus } from "../entity/Task";
import { TaskData } from "../interfaces/interface";

export default class TaskValidator {
    private validKeys: (keyof TaskData)[] = [
        'id', 'title', 'description', 'type', 'status', 'assigned_to', 
        'created_by', 'brand_id', 'inventoryId', 'eventId', 'due_date', 
        'assignedTo', 'createdBy', 'contributes' // Added contributes here
    ];

    validateTaskData(taskData: TaskData): { valid: boolean, message?: string } {
        // Check for extra keys
        const extraKeys = Object.keys(taskData).filter((key) => !this.validKeys.includes(key as keyof TaskData));
        if (extraKeys.length > 0) {
            return {
                valid: false,
                message: `Invalid fields: ${extraKeys.join(', ')}.`
            };
        }

        // Check if status is valid
        if (taskData.status && !Object.values(TaskStatus).includes(taskData.status)) {
            return {
                valid: false,
                message: `Invalid status value: ${taskData.status}. It must be one of ${Object.values(TaskStatus).join(', ')}.`
            };
        }

        // Validate contributes as an array of numbers
        if (taskData.contributes && !Array.isArray(taskData.contributes)) {
            return {
                valid: false,
                message: `Invalid contributes value. It must be an array of user IDs.`
            };
        }

        // If everything is valid
        return { valid: true };
    }
}
