const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudConfig.js");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "Wanderlust_Dev",
        allowed_formats: ["jpg", "jpeg", "png", "webp"]
    }
});

module.exports = {
    storage,
    cloudinary
};