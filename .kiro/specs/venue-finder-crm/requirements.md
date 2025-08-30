# Requirements Document

## Introduction

This document outlines the requirements for a venue finding agency CRM and booking management system. The system is designed as an internal-only web application that enables venue finding consultants to manage clients, venues, create proposals, handle bookings, and track commissions. The MVP focuses on core CRM functionality, proposal building, booking workflow management, and basic reporting capabilities.

## Requirements

### Requirement 1

**User Story:** As a venue finding consultant, I want to securely access the system using my existing Google/Microsoft account, so that I can manage my work without creating additional login credentials.

#### Acceptance Criteria

1. WHEN a user visits the application THEN the system SHALL present Google/Microsoft SSO login options
2. WHEN a user successfully authenticates THEN the system SHALL create or update their user profile
3. IF a user is not part of the authorized organization THEN the system SHALL deny access
4. WHEN a user logs in THEN the system SHALL assign appropriate role-based permissions (Admin or Consultant)

### Requirement 2

**User Story:** As a venue finding consultant, I want to manage client information in a centralized database, so that I can track all client details and communication history.

#### Acceptance Criteria

1. WHEN I create a new client THEN the system SHALL store name, company, contact_name, email, phone, and notes
2. WHEN I search for clients THEN the system SHALL provide quick filtering by name, company, or contact details
3. WHEN I view a client THEN the system SHALL display all associated proposals and bookings
4. WHEN I edit client information THEN the system SHALL update the record and maintain audit trail
5. WHEN I delete a client THEN the system SHALL prevent deletion if active proposals or bookings exist

### Requirement 3

**User Story:** As a venue finding consultant, I want to maintain a comprehensive venue database, so that I can quickly find suitable venues for client proposals.

#### Acceptance Criteria

1. WHEN I add a new venue THEN the system SHALL store name, location, contact_name, email, phone, standard_commission, and notes
2. WHEN I search venues THEN the system SHALL provide filtering by name, location, and other criteria
3. WHEN I view a venue THEN the system SHALL display commission rates and booking history
4. WHEN I edit venue information THEN the system SHALL update the record while preserving historical data
5. WHEN I delete a venue THEN the system SHALL prevent deletion if active proposals or bookings exist

### Requirement 4

**User Story:** As a venue finding consultant, I want to create detailed proposals for clients with multiple venue options, so that I can present comprehensive event solutions.

#### Acceptance Criteria

1. WHEN I create a proposal THEN the system SHALL link it to a specific client
2. WHEN I add venues to a proposal THEN the system SHALL allow multiple venue selections
3. WHEN I add charge lines for each venue THEN the system SHALL support room hire, F&B, AV, and custom charges
4. WHEN I set commission rates THEN the system SHALL use venue defaults with override capability
5. WHEN I save a proposal THEN the system SHALL auto-calculate total client spend and expected commission
6. WHEN I export a proposal THEN the system SHALL generate a branded PDF document

### Requirement 5

**User Story:** As a venue finding consultant, I want to manage the booking workflow from proposal to completion, so that I can track event progress and ensure nothing falls through the cracks.

#### Acceptance Criteria

1. WHEN I convert a proposal to booking THEN the system SHALL create a booking record with proposal details
2. WHEN I set option dates THEN the system SHALL track option expiry and send alerts
3. WHEN I update booking status THEN the system SHALL progress through Draft → Proposal Sent → Option → Confirmed → Completed
4. WHEN I generate venue option documents THEN the system SHALL create PDF with hold dates and terms
5. WHEN booking is confirmed THEN the system SHALL generate client and venue confirmation documents

### Requirement 6

**User Story:** As a venue finding consultant, I want to generate and track commission claims, so that I can ensure timely payment from venues.

#### Acceptance Criteria

1. WHEN a booking is completed THEN the system SHALL auto-generate commission claim invoice
2. WHEN I export commission claims THEN the system SHALL create PDF invoices with booking details
3. WHEN I update claim status THEN the system SHALL track Sent, Paid, and Overdue states
4. WHEN I view unpaid claims THEN the system SHALL provide filtered list with aging information
5. WHEN payment is received THEN the system SHALL update claim status and payment date

### Requirement 7

**User Story:** As a venue finding consultant, I want to view basic reporting and dashboard metrics, so that I can track my pipeline and commission performance.

#### Acceptance Criteria

1. WHEN I access the dashboard THEN the system SHALL display proposal, option, and confirmed booking counts
2. WHEN I view commission reports THEN the system SHALL show expected vs received commission totals
3. WHEN I filter bookings by status THEN the system SHALL provide real-time status breakdown
4. WHEN I export reports THEN the system SHALL generate CSV or PDF format options
5. WHEN data changes THEN the system SHALL update dashboard metrics in real-time

### Requirement 8

**User Story:** As a system administrator, I want to manage user access and system configuration, so that I can control who can access the system and maintain data integrity.

#### Acceptance Criteria

1. WHEN I manage users THEN the system SHALL allow role assignment (Admin, Consultant)
2. WHEN I configure system settings THEN the system SHALL allow branding and template customization
3. WHEN I backup data THEN the system SHALL provide export functionality for all records
4. WHEN I audit system usage THEN the system SHALL maintain logs of user actions
5. WHEN I manage permissions THEN the system SHALL enforce role-based access controls

### Requirement 9

**User Story:** As a venue finding consultant, I want the system to maintain data relationships and integrity, so that I can trust the accuracy of my business information.

#### Acceptance Criteria

1. WHEN I delete records THEN the system SHALL prevent deletion of records with dependencies
2. WHEN I update related records THEN the system SHALL maintain referential integrity
3. WHEN I view historical data THEN the system SHALL preserve audit trails for changes
4. WHEN system errors occur THEN the system SHALL provide meaningful error messages
5. WHEN I perform bulk operations THEN the system SHALL validate data before processing
