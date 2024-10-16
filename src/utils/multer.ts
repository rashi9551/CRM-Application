import multer from 'multer';
import path from 'path';

// Set up Multer storage options
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set the destination for uploads
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Ensure unique file names
    }
});

// Create Multer middleware for handling multiple file uploads (with a limit of 10 files)
const upload = multer({ storage });

// Middleware to handle multiple files
export const uploadMiddleware = upload.array('files', 10); // 'files' is the field name in the form

export default uploadMiddleware;
