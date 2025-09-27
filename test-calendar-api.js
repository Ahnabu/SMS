// Simple test to check calendar API endpoints
console.log("Testing Calendar API endpoints...");

const API_BASE = "http://localhost:5000";

// Test endpoints without authentication first to see which ones exist
const testEndpoints = [
  "/api/admin/calendar",
  "/api/calendar", 
  "/api/academic-calendar/events"
];

async function testApiEndpoints() {
  for (const endpoint of testEndpoints) {
    try {
      console.log(`\nTesting: ${API_BASE}${endpoint}`);
      const response = await fetch(`${API_BASE}${endpoint}`);
      console.log(`Status: ${response.status}`);
      console.log(`Response: ${response.statusText}`);
      
      if (response.status === 401) {
        console.log("✅ Endpoint exists (needs authentication)");
      } else if (response.status === 404) {
        console.log("❌ Endpoint not found");
      } else {
        console.log(`ℹ️  Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
}

testApiEndpoints();