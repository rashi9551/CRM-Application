import { TaskStatus } from "../entity/Task";
import { TaskData } from "../interfaces/interface";

export default  class TaskValidator {
    private validKeys: (keyof TaskData)[] = [
        'id', 'title', 'description', 'type', 'status', 'assigned_to', 
        'created_by', 'brand_id', 'inventoryId', 'eventId', 'due_date', 
        'assignedTo', 'createdBy'
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

        // If everything is valid
        return { valid: true };
    }
}
