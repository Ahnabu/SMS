import express from "express";
import * as accountantFeeController from "./accountantFee.controller";
import { authenticate, authorize } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  searchStudentSchema,
  getStudentFeeStatusSchema,
  collectFeeSchema,
  validateFeeCollectionSchema,
  getAccountantTransactionsSchema,
  getDailyCollectionSummarySchema,
} from "./accountantFee.validation";

const router = express.Router();

// Student Search
router.get(
  "/students/search",
  authenticate,
  authorize("accountant"),
  validateRequest(searchStudentSchema),
  accountantFeeController.searchStudent
);

// Student Fee Status
router.get(
  "/students/:studentId/fee-status",
  authenticate,
  authorize("accountant"),
  validateRequest(getStudentFeeStatusSchema),
  accountantFeeController.getStudentFeeStatus
);

// Fee Collection
router.post(
  "/validate",
  authenticate,
  authorize("accountant"),
  validateRequest(validateFeeCollectionSchema),
  accountantFeeController.validateFeeCollection
);

router.post(
  "/collect",
  authenticate,
  authorize("accountant"),
  validateRequest(collectFeeSchema),
  accountantFeeController.collectFee
);

// Accountant Transactions
router.get(
  "/transactions",
  authenticate,
  authorize("accountant"),
  validateRequest(getAccountantTransactionsSchema),
  accountantFeeController.getAccountantTransactions
);

// Daily Summary
router.get(
  "/daily-summary",
  authenticate,
  authorize("accountant"),
  validateRequest(getDailyCollectionSummarySchema),
  accountantFeeController.getDailyCollectionSummary
);

// Receipt
router.get(
  "/receipt/:transactionId",
  authenticate,
  authorize("accountant"),
  accountantFeeController.getReceipt
);

// Dashboard
router.get(
  "/dashboard",
  authenticate,
  authorize("accountant"),
  accountantFeeController.getDashboard
);

// Get Students by Grade/Section
router.get(
  "/students",
  authenticate,
  authorize("accountant"),
  accountantFeeController.getStudentsByGradeSection
);

export default router;
