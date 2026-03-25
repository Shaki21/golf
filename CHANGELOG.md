# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Developer handoff documentation for team onboarding (DEVELOPER_HANDOFF.md)
- Project status dashboard (PROJECT_STATUS.md)
- Development roadmap Q1 2026 (ROADMAP.md)
- Technical highlights showcase (docs/HIGHLIGHTS.md)
- Technology choices documentation (docs/architecture/TECHNOLOGY_CHOICES.md)
- Archive structure for historical documentation (docs/archive/)
- Quick navigation for new developers in docs/README.md
- "Project at a Glance" section in README.md
- Code quality indicators section in README.md
- Common setup issues troubleshooting in README.md

### Changed
- Reorganized root directory (18 → 12 markdown files)
- Moved TIER migration documentation to docs/archive/tier-migration/
- Moved migration scripts to docs/archive/tier-migration/scripts/
- Moved presentations to docs/archive/presentations/
- Moved phase status documents to docs/archive/phase-status/
- Moved DataGolf integration docs to docs/features/datagolf/
- Moved OAuth/Stripe docs to docs/features/oauth/
- Updated README.md "Latest Updates" to January 2026
- Enhanced documentation navigation with developer-focused quick links

### Removed
- Temporary build artifacts (tsconfig.tsbuildinfo, .DS_Store)
- Temporary archive files (files.zip, ui_audit_bundle.zip)
- 7 completed migration scripts from root (now archived)

## [1.1.0] - 2025-12-25

### Added
- API service tests with comprehensive coverage
- Professional Google-style documentation structure
- Reusable dashboard widgets for player dashboard
- Modal and Tabs composites with comprehensive tests
- Phase 6 scripts and monitoring features
- Complete TypeScript type definitions
- Full OpenAPI/Swagger documentation
- StatsGridTemplate with tests
- Dashboard integration tests
- Frontend component tests

### Changed
- Restructured documentation to professional standards
- Refactored player dashboard with widget architecture
- ESLint and Prettier cleanup across codebase
- JSDoc code documentation improvements
- UI/UX enhancements for loading and error handling

### Fixed
- Badge evaluator test assertions
- Test calculator formulas for approach, distance, short game tests

## [1.0.0] - 2025-12-24

### Added

#### Video Analysis System
- Complete video upload infrastructure with S3 multipart upload
- Video annotation system with frame-accurate timing
- Drawing tools for swing analysis
- Voice-over integration for coach feedback
- Side-by-side video comparison feature
- 11 new API endpoints for video management

#### Security Enhancements
- Two-Factor Authentication (2FA) with TOTP
- Backup codes for 2FA recovery
- Password reset flow with secure tokens
- Comprehensive audit logging
- 149 security test cases

#### Testing
- Increased test coverage from 20% to 45%
- 240+ test cases across security, integration, and E2E
- E2E test suites for player and coach journeys
- K6 load testing scripts

#### Performance
- 50+ database indexes for query optimization
- N+1 query optimization (70-85% reduction)
- Redis caching strategy for high-traffic endpoints
- Dashboard query optimization

### Changed
- Improved test score calculation formulas
- Enhanced badge evaluation logic
- Updated dashboard widgets

### Security
- SQL injection protection verified
- Multi-tenant isolation verified
- XSS prevention implemented
- CORS configuration hardened

## [0.9.0] - 2025-12-20

### Added
- Training plan generation system
- Period-based planning (mesocycles)
- Exercise library with categories
- Coach analytics dashboard
- Peer comparison features

### Changed
- Refactored player dashboard
- Improved session scheduling

## [0.8.0] - 2025-12-15

### Added
- Gamification system with 85 badges
- Badge progress tracking
- Achievement notifications
- XP and leveling system

### Changed
- Updated player profile structure
- Enhanced test result display

## [0.7.0] - 2025-12-10

### Added
- Test result system
- 20+ test protocols
- Score calculation engine
- Progress tracking

### Fixed
- Authentication token refresh issues
- Dashboard loading performance

## [0.6.0] - 2025-12-05

### Added
- Booking system for coaching sessions
- Coach availability management
- Calendar integration

## [0.5.0] - 2025-11-30

### Added
- Player management
- Coach-player relationships
- Basic dashboard

## [0.4.0] - 2025-11-25

### Added
- Multi-tenant architecture
- Organization management
- Role-based access control

## [0.3.0] - 2025-11-20

### Added
- JWT authentication
- User registration
- Login/logout flows

## [0.2.0] - 2025-11-15

### Added
- Prisma ORM setup
- Database schema
- Initial migrations

## [0.1.0] - 2025-11-10

### Added
- Initial project setup
- Fastify framework
- React frontend
- Docker configuration

---

[Unreleased]: https://github.com/akgolfgroup-netizen/IUP-app/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/akgolfgroup-netizen/IUP-app/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/akgolfgroup-netizen/IUP-app/releases/tag/v1.0.0
