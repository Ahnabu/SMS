import { catchAsync } from "../utils/catchAsync";

// Middleware to parse FormData (FoundX pattern + flat FormData support)
export const parseBody = catchAsync(async (req, res, next) => {
  console.log("=== parseBody: Input body ===", req.body);

  // Handle FoundX pattern: data field with JSON string
  if (req.body && req.body.data) {
    try {
      req.body = JSON.parse(req.body.data);
      console.log("=== parseBody: Parsed from data field ===", req.body);
    } catch (error) {
      console.log("Error parsing body data:", error);
    }
  } else if (req.body) {
    // Handle flat FormData: convert parentInfo[name] to parentInfo.name
    const body = req.body;
    const parsedBody: any = {};

    for (const [key, value] of Object.entries(body)) {
      if (key.includes("[") && key.includes("]")) {
        // Handle nested keys like parentInfo[name]
        const match = key.match(/^([^[]+)\[([^\]]+)\]$/);
        if (match) {
          const [, parentKey, childKey] = match;
          if (!parsedBody[parentKey]) {
            parsedBody[parentKey] = {};
          }
          parsedBody[parentKey][childKey] = value;
        }
      } else {
        // Handle flat keys
        parsedBody[key] = value;
      }
    }

    // Merge flat keys and nested structures
    req.body = { ...body, ...parsedBody };
  }

  console.log("=== parseBody: Final body ===", req.body);
  next();
});
