# API Testing Manual Guide

## Test Data Available

### Accountants:
- `cufixo@mailinator.com` (sch0015acc2025001)
- `cufix12o@mailinator.com` (sch0003acc2025001)

### Parents:
- `parent@gmail.com` (parent_2025020001)
- `horairaabu5@gmail.com` (parent_2025090003)

### Students:
- `stusch0015stu2025090001`
- `stusch0015stu2025090002`

### Fee Records with Admission Fees:
- Student ID: `SCH0015-STU-202509-0001`
  - Admission Fee: ₹15,000 (PENDING)
  - Total Due: ₹17,640

- Student ID: `SCH0015-STU-202509-0002`
  - Admission Fee: ₹15,000 (PENDING)
  - Total Due: ₹17,420

## Manual Test Steps

### Step 1: Login as Accountant

First, you need to login with an accountant account. If you don't know the password, you can:
1. Check your user creation scripts
2. Or temporarily create a test accountant with known password

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cufixo@mailinator.com",
    "password": "YOUR_PASSWORD"
  }'
```

Copy the `token` from the response.

### Step 2: Get Student Fee Status

```bash
curl -X GET "http://localhost:5000/api/accountant-fees/student-fee-status/SCH0015-STU-202509-0001" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Student fee status retrieved successfully",
  "data": {
    "student": {
      "studentId": "SCH0015-STU-202509-0001",
      "name": "...",
      "grade": "..."
    },
    "totalFeeAmount": 17640,
    "totalDueAmount": 17640,
    "monthlyDues": 2640,
    "oneTimeDues": 15000,
    "admissionPending": true,
    "admissionFeeAmount": 15000,
    "admissionFeePaid": 0,
    "oneTimeFees": [
      {
        "feeType": "admission",
        "dueAmount": 15000,
        "paidAmount": 0,
        "status": "pending"
      }
    ]
  }
}
```

### Step 3: Collect Admission Fee

```bash
curl -X POST http://localhost:5000/api/accountant-fees/collect-one-time \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "studentId": "SCH0015-STU-202509-0001",
    "feeType": "admission",
    "amount": 15000,
    "paymentMethod": "cash",
    "remarks": "Full admission fee payment"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "admission fee collected successfully",
  "data": {
    "transaction": {
      "transactionId": "TXN-...",
      "amount": 15000,
      "paymentMethod": "cash",
      "status": "completed"
    },
    "oneTimeFee": {
      "feeType": "admission",
      "dueAmount": 15000,
      "paidAmount": 15000,
      "status": "paid",
      "remainingAmount": 0
    }
  }
}
```

### Step 4: Verify Payment

```bash
curl -X GET "http://localhost:5000/api/accountant-fees/student-fee-status/SCH0015-STU-202509-0001" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Changes:**
- `admissionPending`: false
- `admissionFeePaid`: 15000
- `totalDueAmount`: 2640 (reduced by 15000)
- `oneTimeDues`: 0
- oneTimeFees[0].status: "paid"

### Step 5: Try to Overpay (Should Fail)

```bash
curl -X POST http://localhost:5000/api/accountant-fees/collect-one-time \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "studentId": "SCH0015-STU-202509-0001",
    "feeType": "admission",
    "amount": 5000,
    "paymentMethod": "cash"
  }'
```

**Expected Response (Error):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Payment amount (₹5000) exceeds remaining due amount (₹0)"
}
```

### Step 6: Test Partial Payment

```bash
curl -X POST http://localhost:5000/api/accountant-fees/collect-one-time \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "studentId": "SCH0015-STU-202509-0002",
    "feeType": "admission",
    "amount": 7500,
    "paymentMethod": "online",
    "remarks": "Partial admission fee (50%)"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "oneTimeFee": {
      "feeType": "admission",
      "dueAmount": 15000,
      "paidAmount": 7500,
      "status": "partial",
      "remainingAmount": 7500
    }
  }
}
```

### Step 7: Login as Parent & Get Children Fees

```bash
# Login as parent
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "parent@gmail.com",
    "password": "YOUR_PASSWORD"
  }'

# Get children fee status
curl -X GET http://localhost:5000/api/accountant-fees/parent-children-fees \
  -H "Authorization: Bearer PARENT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "children": [
      {
        "studentId": "...",
        "name": "...",
        "totalDue": 17640,
        "admissionPending": true,
        "admissionFee": 15000,
        "pendingMonths": 12
      }
    ],
    "totalDueAmount": 17640,
    "totalChildren": 1
  }
}
```

## Quick Test Summary

✅ **Test 1**: Get student fee status - Should show admission fee pending
✅ **Test 2**: Collect full admission fee - Should create transaction and mark as paid
✅ **Test 3**: Verify admission fee paid - Should show admissionPending: false
✅ **Test 4**: Try to overpay - Should return 400 error
✅ **Test 5**: Collect partial payment - Should mark as partial status
✅ **Test 6**: Parent view children fees - Should show all children with admission status

## Testing with Postman

Import this collection to Postman:

1. Create environment variables:
   - `base_url`: http://localhost:5000/api
   - `accountant_token`: (paste after login)
   - `parent_token`: (paste after login)

2. Test sequence:
   - Login → Save token
   - Get Student Status
   - Collect Admission Fee
   - Verify Payment
   - Test Overpayment (expect error)
   - Partial Payment
   - Parent Dashboard

