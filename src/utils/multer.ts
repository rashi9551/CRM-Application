import multer from 'multer';


// Set up Multer storage options
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Set the destination for uploads
    },
    filename: (req, file, cb) => {
        // Use the original file name or generate a unique name
        cb(null, `${Date.now()}-${file.originalname}`); // Ensure unique file names
    }
});

// Create Multer middleware
const upload = multer({ storage });

export const uploadMiddleware = upload.single('file');