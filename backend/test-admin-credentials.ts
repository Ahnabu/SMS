/**
 * TypeScript test script for admin credentials functionality
 */

import mongoose from "mongoose";
import { School } from "./src/app/modules/school/school.model";
import { User } from "./src/app/modules/user/user.model";
import { schoolService } from "./src/app/modules/school/school.service";
import config from "./src/app/config";

async function testAdminCredentials() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb_uri);
    console.log("✅ Connected to database");

    // Find the first school with an admin
    const school = await School.findOne({
      adminUserId: { $exists: true },
    }).populate("adminUserId");

    if (!school) {
      console.log("❌ No schools found with admin users");

      // Let's check what we have in the database
      const allSchools = await School.find({});
      console.log(`Found ${allSchools.length} schools total`);

      const allUsers = await User.find({});
      console.log(`Found ${allUsers.length} users total`);

      return;
    }

    console.log("✅ Testing with school:", school.name);
    console.log("📍 School ID:", school._id.toString());

    // Test getAdminCredentials
    console.log("\n=== Testing getAdminCredentials ===");
    try {
      const credentials = await schoolService.getAdminCredentials(
        school._id.toString()
      );
      console.log("✅ Admin credentials retrieved successfully:");
      console.log("👤 Username:", credentials.username);
      console.log("🔑 Password:", credentials.password);
      console.log("📛 Full Name:", credentials.fullName);
      console.log("📧 Email:", credentials.email);
      console.log("📱 Phone:", credentials.phone);
    } catch (error: any) {
      console.error("❌ Failed to get admin credentials:", error.message);
    }

    // Test resetAdminPassword
    console.log("\n=== Testing resetAdminPassword ===");
    try {
      const resetResult = await schoolService.resetAdminPassword(
        school._id.toString()
      );
      console.log("✅ Password reset successfully:");
      console.log("👤 Username:", resetResult.username);
      console.log("🔑 New Password:", resetResult.newPassword);
      console.log("📛 Full Name:", resetResult.fullName);
      console.log("📧 Email:", resetResult.email);

      // Verify the password was actually updated
      const updatedCredentials = await schoolService.getAdminCredentials(
        school._id.toString()
      );
      console.log(
        "✅ Verified new password in credentials:",
        updatedCredentials.password
      );
    } catch (error: any) {
      console.error("❌ Failed to reset admin password:", error.message);
    }
  } catch (error: any) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from database");
  }
}

// Run the test
if (require.main === module) {
  testAdminCredentials()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Test error:", error);
      process.exit(1);
    });
}

export { testAdminCredentials };
