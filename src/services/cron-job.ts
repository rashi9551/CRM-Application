// cronJobs/taskNotificationCron.ts

import cron from 'node-cron';
import TaskRepo from '../app/repository/TaskRepo';
import { Notification } from '../entity/Notification';

// Create an instance of the notification service

// Schedule the cron job
cron.schedule('*/30 * * * *', async () => {
    console.log('Running cron job to save task notifications...');
    try {
        const now = new Date();
        const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);

        const tasks = await TaskRepo.findDueTasks(now, twelveHoursFromNow);
        const allUsers = await TaskRepo.findAllUsers();
        const userMap = new Map(allUsers.map(user => [user.id, user])); // Create a map for quick lookup

        // Create an array to store notifications to be saved in batch
        const notificationsToSave: Notification[] = [];

        // Process each task
        for (const task of tasks) {
            const assignedUser = userMap.get(task.assignedTo.id); // Get the assigned user from the map
            if (assignedUser) {
                const message = `Reminder: Task due soon - ${task.title}`;
                const notification = new Notification();
                notification.message = message;
                notification.isRead = false;
                notification.recipient = assignedUser; // Set the user as the recipient
                notification.task = task; 
                notificationsToSave.push(notification); // Add notification to the batch
            }
        }

        // Save all notifications in a single operation
        if (notificationsToSave.length > 0) {
            await TaskRepo.saveBatchNotification(notificationsToSave); // Assuming saveNotifications is a method that saves an array of notifications
        }

        console.log('Notifications saved successfully.');
    } catch (error) {
        console.error('Error saving notifications:', error);
    }
});
