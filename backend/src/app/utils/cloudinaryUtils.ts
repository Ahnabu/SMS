import { v2 as cloudinary } from "cloudinary";
import config from "../config";
import { calculateAge } from "./credentialGenerator";

// Configure cloudinary if not already configured
if (!cloudinary.config().cloud_name) {
  cloudinary.config({
    cloud_name: config.cloudinary_cloud_name,
    api_key: config.cloudinary_api_key,
    api_secret: config.cloudinary_api_secret,
  });
}

/**
 * Generate folder path for photo storage
 * For students: schoolName/Students/student@firstName@age@grade@section@bloodGroup@studentId
 * For teachers: schoolName/Teachers/teacher@firstName@age@bloodGroup@joiningDate@teacherId
 */
export const generateCloudinaryFolderPath = (
  schoolName: string,
  role: "student" | "teacher",
  firstName: string,
  dob: Date,
  bloodGroup: string,
  date: Date,
  grade?: number,
  section?: string,
  entityId?: string // studentId or teacherId
): string => {
  // Sanitize school name (remove special characters, spaces, convert to title case)
  const sanitizedSchoolName = schoolName
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

  // Calculate age
  const age = calculateAge(dob);

  // Format date as DDMMYYYY
  const formattedDate = date.toLocaleDateString("en-GB").replace(/\//g, "");

  // Sanitize first name
  const sanitizedFirstName = firstName.replace(/[^a-zA-Z]/g, "").toLowerCase();

  if (role === "student" && grade && section && entityId) {
    return `${sanitizedSchoolName}/Students/${role}@${sanitizedFirstName}@${age}@${grade}@${section}@${bloodGroup}@${entityId}`;
  } else if (role === "teacher" && entityId) {
    return `${sanitizedSchoolName}/Teachers/${role}@${sanitizedFirstName}@${age}@${bloodGroup}@${formattedDate}@${entityId}`;
  }

  throw new Error(
    "Invalid role or missing required parameters for folder path generation"
  );
};

/**
 * Upload multiple photos to Cloudinary with specific folder structure
 */
export const uploadPhotosToCloudinary = async (
  files: Express.Multer.File[],
  folderPath: string,
  entityId: string
): Promise<
  Array<{
    public_id: string;
    secure_url: string;
    photoNumber: number;
    originalName: string;
    size: number;
  }>
> => {
  if (!files || files.length === 0) {
    throw new Error("No files provided for upload");
  }

  if (files.length > 8) {
    throw new Error("Maximum 8 photos allowed per upload");
  }

  const uploadPromises = files.map(async (file, index) => {
    // Validate file
    if (!file.mimetype.startsWith("image/")) {
      throw new Error(`File ${file.originalname} is not an image`);
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      throw new Error(`File ${file.originalname} exceeds 10MB limit`);
    }

    const photoNumber = index + 1;
    const public_id = `${folderPath}/${photoNumber}`;

    try {
      const result = await cloudinary.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
          public_id,
          folder: folderPath,
          resource_type: "image",
          format: "jpg", // Convert all images to jpg for consistency
          quality: "auto:good",
          width: 800,
          height: 800,
          crop: "limit",
          flags: "progressive",
        }
      );

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        photoNumber,
        originalName: file.originalname,
        size: file.size,
      };
    } catch (error) {
      console.error(`Failed to upload photo ${photoNumber}:`, error);
      throw new Error(`Failed to upload photo ${file.originalname}`);
    }
  });

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Photo upload failed:", error);
    throw error;
  }
};

/**
 * Delete photos from Cloudinary
 */
export const deletePhotosFromCloudinary = async (
  publicIds: string[]
): Promise<void> => {
  if (!publicIds || publicIds.length === 0) {
    return;
  }

  try {
    const deletePromises = publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId, { resource_type: "image" })
    );

    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Failed to delete photos from Cloudinary:", error);
    throw new Error("Failed to delete photos from cloud storage");
  }
};

/**
 * Create default folder structure for a school
 */
export const createSchoolFolderStructure = async (
  schoolName: string
): Promise<void> => {
  const sanitizedSchoolName = schoolName
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

  try {
    // Create placeholder files to establish folder structure
    const folders = [
      `${sanitizedSchoolName}/Students`,
      `${sanitizedSchoolName}/Teachers`,
    ];

    const createFolderPromises = folders.map(async (folder) => {
      // Create a small placeholder image to establish the folder
      const placeholderData =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

      await cloudinary.uploader.upload(placeholderData, {
        public_id: `${folder}/.placeholder`,
        resource_type: "image",
        format: "png",
      });
    });

    await Promise.all(createFolderPromises);
    console.log(`Folder structure created for school: ${schoolName}`);
  } catch (error) {
    console.error("Failed to create school folder structure:", error);
    // Don't throw error as this is not critical for the main operation
  }
};

/**
 * Get available photo slots for a user (1-8)
 */
export const getAvailablePhotoSlots = (
  existingPhotoNumbers: number[]
): number[] => {
  const allSlots = [1, 2, 3, 4, 5, 6, 7, 8];
  return allSlots.filter((slot) => !existingPhotoNumbers.includes(slot));
};

/**
 * Generic file upload to Cloudinary for homework attachments
 */
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  options: {
    folder: string;
    resource_type?: "image" | "video" | "raw" | "auto";
    use_filename?: boolean;
    unique_filename?: boolean;
  }
): Promise<{
  public_id: string;
  secure_url: string;
  resource_type: string;
  format: string;
  bytes: number;
}> => {
  try {
    const result = await cloudinary.uploader.upload(
      `data:application/octet-stream;base64,${fileBuffer.toString("base64")}`,
      {
        folder: options.folder,
        resource_type: options.resource_type || "auto",
        use_filename: options.use_filename || true,
        unique_filename: options.unique_filename !== false,
      }
    );

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      resource_type: result.resource_type,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error("Failed to upload file to cloud storage");
  }
};

/**
 * Delete file from Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log(`Successfully deleted ${publicId} from Cloudinary`);
  } catch (error) {
    console.error(`Failed to delete ${publicId} from Cloudinary:`, error);
    throw new Error(`Failed to delete file from cloud storage: ${publicId}`);
  }
};
