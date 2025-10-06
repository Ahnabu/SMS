# School Management System - Testing Guide

## 📋 Overview

This document provides comprehensive instructions for testing the School Management System. We have multiple testing layers to ensure system reliability.

---

## 🧪 Test Suite Overview

### 1. **Comprehensive System Test** (`comprehensive-system-test.ts`)
- **Purpose**: End-to-end testing of backend API
- **Coverage**:
  - Database connectivity
  - Authentication & Authorization
  - School management
  - User management (Teachers, Students, Parents, Accountants)
  - Fee structure & collection
  - Fee calculations (monthly + one-time fees)
  - Data integrity validation
  - Performance benchmarks

### 2. **Fee Models Test** (`test-fee-models.ts`)
- **Purpose**: Validate fee management models
- **Coverage**:
  - FeeStructure model
  - StudentFeeRecord model
  - FeeTransaction model
  - FeeDefaulter model
  - Pre-save hooks
  - Calculation accuracy

### 3. **Frontend Test** (`frontend-test.ts`)
- **Purpose**: Validate frontend structure
- **Coverage**:
  - Project structure
  - Dependencies
  - TypeScript configuration
  - Component existence
  - Service layer
  - Build process

### 4. **Console Log Cleanup** (`cleanup-console-logs.ts`)
- **Purpose**: Remove debug console.logs
- **Preserves**: Server logs, seeder logs, migration logs

---

## 🚀 Quick Start

### Run All Tests (Recommended)

```bash
# Make script executable (Unix/Mac)
chmod +x run-all-tests.sh

# Run all tests
./run-all-tests.sh
```

### Run Individual Tests

#### Backend Comprehensive Test
```bash
cd backend
npx ts-node comprehensive-system-test.ts
```

#### Fee Models Test
```bash
cd backend
npx ts-node test-fee-models.ts
```

#### Frontend Test
```bash
cd frontend
npx ts-node frontend-test.ts
```

#### Console Log Cleanup
```bash
cd backend
npx ts-node cleanup-console-logs.ts
```

---

## 📊 Test Reports

After running tests, reports are generated in `test-reports-YYYYMMDD-HHMMSS/`:

```
test-reports-20251006-123456/
├── FINAL-REPORT.md           # Master summary
├── backend-comprehensive.log # Full backend test output
├── backend-fee-models.log    # Fee model test output
├── frontend-structure.log    # Frontend test output
├── console-log-cleanup.log   # Cleanup results
└── backend-server.log        # Server logs (if auto-started)
```

---

## ✅ Test Checklist

### Before Deployment

- [ ] All comprehensive system tests pass
- [ ] Fee calculation tests pass
- [ ] Frontend structure validated
- [ ] Console.logs cleaned
- [ ] No TypeScript errors
- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Authorization rules enforced

### Critical Features to Test Manually

1. **Login Flow**
   - [ ] Superadmin can login
   - [ ] Admin can login
   - [ ] Teacher can login
   - [ ] Student can login
   - [ ] Parent can login
   - [ ] Accountant can login

2. **Fee Management**
   - [ ] Create fee structure with monthly fees
   - [ ] Create fee structure with one-time fees
   - [ ] Collect first payment (includes one-time fees)
   - [ ] Verify totalPaidAmount = monthly + one-time
   - [ ] Verify totalDueAmount calculated correctly
   - [ ] Receipt generation works

3. **User Management**
   - [ ] Create student
   - [ ] Create teacher
   - [ ] Create parent
   - [ ] Create accountant
   - [ ] Edit user details
   - [ ] Delete user

4. **Dashboard Access**
   - [ ] Each role sees correct dashboard
   - [ ] Role-based route protection works
   - [ ] Data displays correctly

---

## 🐛 Common Issues & Solutions

### Issue: "Backend server not running"
**Solution**:
```bash
cd backend
npm run dev
```

### Issue: "MongoDB connection failed"
**Solution**: Check `.env` file has correct `MONGODB_URI`

### Issue: "Tests timeout"
**Solution**: Increase timeout in test file or check network connectivity

### Issue: "TypeScript compilation errors"
**Solution**:
```bash
npm install
npx tsc --noEmit
```

### Issue: "Console.logs not cleaned"
**Solution**: Run cleanup script manually:
```bash
cd backend
npx ts-node cleanup-console-logs.ts
```

---

## 📈 Performance Benchmarks

### Expected Response Times

| Endpoint | Expected | Acceptable | Action if Slower |
|----------|----------|------------|------------------|
| Login | < 200ms | < 500ms | Check DB indexes |
| Get Students List | < 300ms | < 800ms | Add pagination |
| Fee Collection | < 400ms | < 1000ms | Optimize calculations |
| Dashboard Load | < 500ms | < 1500ms | Implement caching |

### Database Query Times

| Query | Expected | Action if Slower |
|-------|----------|------------------|
| Find by ID | < 50ms | Add index |
| List with filter | < 200ms | Optimize query |
| Aggregation | < 500ms | Review pipeline |

---

## 🔒 Security Testing

### Authentication Tests
- [ ] JWT token validation
- [ ] Token expiration handling
- [ ] Password hashing (bcrypt)
- [ ] Session management

### Authorization Tests
- [ ] Role-based access control
- [ ] School isolation (multi-tenancy)
- [ ] Protected route access
- [ ] API endpoint permissions

### Data Validation Tests
- [ ] Input sanitization
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection

---

## 📝 Test Data

### Default Test Credentials

**Superadmin**:
- Username: `superadmin`
- Password: `admin123`

**Test School Admin** (created during tests):
- Username: Auto-generated (check test output)
- Password: `admin123`

### Sample Test Data

Tests automatically create:
- 1 Test school
- 1 Admin user
- 1 Teacher
- 1 Student  
- 1 Parent
- 1 Accountant
- 1 Fee structure
- 1 Fee transaction

All test data is cleaned up after tests complete.

---

## 🔄 Continuous Integration

### GitHub Actions (Recommended)

Create `.github/workflows/test.yml`:

```yaml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Backend Dependencies
        run: cd backend && npm install
      
      - name: Install Frontend Dependencies
        run: cd frontend && npm install
      
      - name: Run Tests
        run: ./run-all-tests.sh
        env:
          MONGODB_URI: mongodb://localhost:27017/sms-test
          NODE_ENV: test
```

---

## 📧 Reporting Issues

If tests fail:

1. **Check Logs**: Review test report files
2. **Reproduce**: Try to reproduce manually
3. **Document**: Note steps, expected vs actual results
4. **Report**: Create GitHub issue with:
   - Test name that failed
   - Error message
   - Relevant logs
   - Environment details

---

## ✨ Best Practices

1. **Run tests before committing**: `./run-all-tests.sh`
2. **Review cleanup script output**: Ensure no critical logs removed
3. **Check test coverage**: Aim for > 80%
4. **Update tests**: When adding features
5. **Document test data**: Keep test scenarios documented

---

## 📚 Additional Resources

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)
- [API Documentation](http://localhost:5000/api/docs)
- [TESTING_REPORT.md](./TESTING_REPORT.md) - Latest test results

---

**Last Updated**: October 6, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
