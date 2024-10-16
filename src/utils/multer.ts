import multer from 'multer';

// Set up Multer storage options
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set the destination for uploads
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Ensure unique file names
    }
});

// Create Multer middleware for handling single file upload with the field name 'image'
const upload = multer({ storage });

// Middleware to handle single file upload
export const uploadMiddleware = upload.single('image'); // 'image' must match the field name in your form (or Postman)

export default uploadMiddleware;
