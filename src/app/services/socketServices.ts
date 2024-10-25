// src/services/socketService.ts

import { Socket, Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

interface DecodedToken {
    userId: string;
}

interface AuthenticatedSocket extends Socket {
    decoded?: DecodedToken;
}

export class SocketService {
    private io: SocketIOServer | null = null;

    initialize(server: HttpServer): void {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: '*',  // Replace with your domain or client origin
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });

        this.io.use((socket: AuthenticatedSocket, next) => {
            const token: string | undefined = socket.handshake.query.token as string;

            if (!token) return next(new Error('Token missing'));

            jwt.verify(token, process.env.SECRET_KEY as string, (err, decoded) => {
                if (err) return next(new Error('Authentication error'));

                socket.decoded = decoded as DecodedToken;
                next();
            });
        });

        this.io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            socket.on('joinTaskRoom', (taskId: string) => {
                socket.join(taskId);
                console.log(`User ${socket.id} joined task room: ${taskId}`);
            });

            socket.on('sendComment', (comment: string) => {
                // Parse the incoming comment data if it's a string
                const parsedComment = typeof comment === 'string' ? JSON.parse(comment) : comment;
            
                // Extract the properties
                const { taskId, userId, comment: content, filePaths, id, createdAt } = parsedComment;
            
                // Check if taskId, userId, content, and id are present
                if (taskId && userId && content && id && createdAt) {
                    // Emit to other users in the same task room
                    this.io?.to(taskId).emit('receiveComment', {
                        userId,
                        content,
                        filePaths, // Send filePaths along with the comment
                        taskId,
                        id,        // Include the id
                        createdAt  // Include createdAt
                    });
            
                    console.log(`Comment from user ${userId} in task ${taskId}: ${content}`);
                    console.log(`File paths: ${filePaths}`); // Log file paths for debugging
                } else {
                    console.error('Invalid comment format:', parsedComment);
                }
            });
            
            

            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
            });
        });
    }
}

export default new SocketService();
