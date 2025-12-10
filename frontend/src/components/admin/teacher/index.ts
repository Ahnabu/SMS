// Main Components
export { default as TeacherForm } from "./TeacherForm.js";

// Sub Components
export { default as BasicInfo } from "./BasicInfo.js";
export { default as AddressInfo } from "./AddressInfo.js";
export { default as QualificationsInfo } from "./QualificationsInfo.js";
export { default as PhotoUpload } from "./PhotoUpload.js";
export { default as CredentialsDisplay } from "./CredentialsDisplay.js";

// Component Types
export type {
  TeacherFormData,
  Credentials,
  TeacherFormProps,
  BasicInfoProps,
  AddressInfoProps,
  QualificationsProps,
  PhotoUploadProps,
  CredentialsDisplayProps,
} from "./types.js";
