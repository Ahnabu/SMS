# Database Seeding

This document explains the database seeding functionality for the School Management System.

## Overview

The seeding system automatically creates essential data when the application starts, including:
- Superadmin user creation
- Validation of critical system data
- Future extensions for default configurations

## Automatic Seeding

Seeding runs automatically when:
1. The application connects to the database
2. No superadmin user exists in the system

## Manual Seeding Commands

You can run seeding operations manually using npm scripts:

```bash
# Run complete database seeding
npm run seed seed

# Create only superadmin user
npm run seed seed-superadmin

# Validate seeding results
npm run seed validate

# Reset superadmin (remove and recreate)
npm run seed reset-superadmin

# List all system users
npm run seed list-users

# Show help
npm run seed help
```

## Default Superadmin Credentials

The system creates a default superadmin with these credentials:

- **Username**: `superadmin` (configurable via `SUPERADMIN_USERNAME`)
- **Password**: `super123` (configurable via `SUPERADMIN_PASSWORD`)
- **Email**: `superadmin@schoolmanagement.com` (configurable via `SUPERADMIN_EMAIL`)

⚠️ **Security Warning**: Change the default password immediately after first login!

## Environment Configuration

Configure superadmin credentials using environment variables:

```env
SUPERADMIN_USERNAME=your_username
SUPERADMIN_PASSWORD=your_secure_password
SUPERADMIN_EMAIL=your_email@domain.com
```

## Seeding Process

1. **Connection Check**: Verifies database connection
2. **Superadmin Check**: Looks for existing superadmin users
3. **Creation**: Creates superadmin if none exists
4. **Validation**: Confirms seeding was successful
5. **Logging**: Provides detailed feedback

## Security Features

- Passwords are automatically hashed
- Superadmin cannot be associated with any school
- Validation ensures system integrity
- Prevention of accidental deletions

## Troubleshooting

### Common Issues

1. **"Superadmin already exists"**
   - This is normal - the system prevents duplicates
   - Use `reset-superadmin` command if needed

2. **"Database connection failed"**
   - Check MongoDB connection string
   - Ensure database server is running

3. **"Validation failed"**
   - Run `list-users` to check user status
   - Check if superadmin is active

### Logging

All seeding operations provide detailed logging:
- ✅ Success messages
- ⚠️ Warning messages  
- ❌ Error messages
- 🌱 Seeding progress

## Development vs Production

- **Development**: Uses default credentials for easy testing
- **Production**: Always use custom environment variables
- **Testing**: Automatic seeding helps with test setup

## Future Extensions

The seeding system is designed to support:
- Default school configurations
- Academic year templates
- Standard subjects and grades
- System-wide settings

## Security Considerations

1. Change default credentials in production
2. Use strong passwords (minimum 8 characters)
3. Enable audit logging for admin actions
4. Regular security reviews of admin accounts

## API Integration

Seeded users can immediately:
- Login via `/auth/login`
- Access superadmin endpoints
- Manage schools and users
- Configure system settings

## Monitoring

Monitor seeding through:
- Application startup logs
- Database user counts
- Health check endpoints
- Admin dashboard metrics