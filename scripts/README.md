# Scripts

Utility scripts for the AK Golf Academy platform.

## Directory Structure

```
scripts/
├── setup-database.sh      # Initial database setup
├── migrations/            # Database migration scripts
│   ├── apply-achievements-migration.sh
│   ├── apply-archive-migration.sh
│   ├── apply-goals-migration.sh
│   ├── apply-notes-migration.sh
│   └── apply-season-migration.sh
├── testing/               # Test scripts
│   ├── test-all-endpoints.sh
│   └── test-training-plan-endpoints.sh
└── utils/                 # Utility scripts
    └── update-colors.sh
```

## Usage

### Database Setup
```bash
./scripts/setup-database.sh
```

### Running Migrations
```bash
./scripts/migrations/apply-achievements-migration.sh
```

### Testing
```bash
./scripts/testing/test-all-endpoints.sh
```
