const axios = require("axios");
const ApiError = require("./ApiError");
const FormData = require("form-data");

exports.uploadImg = async (file) => {
  try {
    // Buffer -> Base64 hoặc giữ nguyên file.buffer
    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    const formData = new FormData();
    formData.append("file", base64Image);
    formData.append("upload_preset", "huhuasdasd");

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/deounhiee/image/upload`,
      formData,
      { headers: formData.getHeaders() }
    );

    return response.data.secure_url; // link ảnh
  } catch (error) {
    throw new ApiError("Upload to Cloudinary failed: " + error.message);
  }
};

exports.uploadFile = async (file) => {
  try {
    // Convert buffer to base64 for non-image files
    const base64File = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    const formData = new FormData();
    formData.append("file", base64File);
    formData.append("upload_preset", "huhuasdasd");
    formData.append("resource_type", "raw"); // Important: Set resource type for non-image files

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/deounhiee/raw/upload",
      formData,
      {
        headers: formData.getHeaders(),
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );

    return response.data.secure_url; // link file public
  } catch (error) {
    console.error(
      "Cloudinary upload error:",
      error.response?.data || error.message
    );
    throw new ApiError(
      "Upload to Cloudinary failed: " +
        (error.response?.data?.error?.message || error.message)
    );
  }
};
