import { Cloudinary } from "cloudinary-core";

const cloudinary = new Cloudinary({
  cloud_name: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME, // Replace with your Cloudinary cloud name
  secure: true,
});

export default cloudinary;
