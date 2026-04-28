// // import { v2 as cloudinary } from 'cloudinary'
// // import dotenv from 'dotenv'
// // dotenv.config()


// // cloudinary.config({ 
// //   cloud_name: process.env.CLOUD_NAME, 
// //   api_key: process.env.API_KEY, 

// //   api_secret: process.env.API_SECRET 
// // });

// // export default cloudinary;



// // config/cloudinary.js
// import { v2 as cloudinary } from 'cloudinary'
// import dotenv from 'dotenv'
// dotenv.config()

// cloudinary.config({ 
//   cloud_name: process.env.CLOUD_NAME, 
//   api_key: process.env.API_KEY, 
//   // trim() se ensure hoga ki koi extra space error na de
//   api_secret: process.env.API_SECRET ? process.env.API_SECRET.trim() : "" 
// });

// export default cloudinary;



import { v2 as cloudinary } from 'cloudinary'
import 'dotenv/config'

console.log("Cloudinary Config Loading..."); // Debug line
console.log("Cloud Name:", process.env.CLOUD_NAME); // Check karein ye console mein aa raha hai ya nahi

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET ? process.env.API_SECRET.trim() : "" 
});

export default cloudinary;