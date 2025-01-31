// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // Setup penyimpanan Multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "Images"); 
//   },
//   filename: (req, file, cb) => {

//     const originalName = path
//       .basename(file.originalname, path.extname(file.originalname))
//       .replace(/\s+/g, "-");

//     const timestamp = Date.now();
//     const extension = path.extname(file.originalname).toLowerCase();
//     cb(null, `${originalName}-${timestamp}${extension}`);
//   },
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 100 * 1024 * 1024 }, 
// });

// export { upload };
