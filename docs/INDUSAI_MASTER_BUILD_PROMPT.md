# MASTER BUILD PROMPT: INDUSAI
## AI-Powered Industrial Approvals, Compliance and Government Services Platform
### Smart India Hackathon — Problem Statement 26130

You are a senior full-stack product engineer, UI/UX designer, frontend architect, and AI application developer. Your task is to design and build a complete, polished, interactive, presentation-ready prototype called **IndusAI**, starting from an empty project directory.

Do not treat this as a code-generation exercise that produces a few static screens. Build a coherent, working product prototype with connected user journeys, realistic mock data, interactive workflows, functional navigation, state management, simulated AI behavior, and convincing applicant, government officer, and administrator experiences.

**Work independently through all development stages.** Inspect the project, establish its structure, implement the application, run it, test the key journeys, identify and fix errors, and polish the final result. Do not stop after producing a plan or a basic scaffold. Make reasonable implementation decisions without repeatedly asking for confirmation.

---

# 1. PROJECT CONTEXT

## 1.1 Problem Statement

**Problem Statement ID:** 26130  
**Organization:** Government of Maharashtra  
**Department:** Department of Skills, Employment, Entrepreneurship and Innovation  
**Agency:** Maharashtra State Innovation Society  
**Domain:** AI-powered governance, industrial approvals, regulatory compliance, and government service delivery.

Industrial businesses must navigate multiple government departments, approvals, registrations, clearances, inspections, renewals, and incentive schemes. The process can involve fragmented portals, repetitive documentation, unclear dependencies, slow interdepartmental coordination, and limited visibility into application status.

IndusAI is designed to simplify this experience through an intelligent, unified interface.

## 1.2 Product Vision

**IndusAI is an AI-powered industrial approvals and compliance intelligence platform that helps businesses understand, prepare, track, and manage government approvals through one unified interface.**

It is an intelligence and coordination layer designed to work alongside existing government systems, not a replacement for every existing government portal.

The platform should help users:

- Discover which approvals and registrations apply to their proposed project.
- Understand the sequence and dependencies between approvals.
- Identify approvals that can proceed in parallel.
- Receive personalized document checklists and regulatory guidance.
- Reuse business information and verified documents instead of repeatedly entering the same details.
- Validate documents before submission.
- Track applications, deadlines, queries, and departmental progress.
- Receive notifications and recommendations for their next actions.
- Coordinate inspections and understand possible delays.
- Manage renewals, compliance obligations, and relevant government incentives.
- Raise grievances and track their escalation.
- Understand regulatory changes that could affect their project.

Government officers should be able to review assigned applications, verify documentation, communicate with applicants, coordinate inspections, and monitor their workload.

Administrators should be able to manage roles, departments, workflow configurations, regulatory knowledge entries, and system-level analytics.

## 1.3 Prototype Constraints

This project is **a frontend-only functional prototype for a hackathon presentation and PPT demonstration**.

The prototype must be interactive and convincingly demonstrate the intended product experience. It must not require real government integrations or production infrastructure.

### Mandatory constraints

- Build the frontend using **Next.js and TypeScript**.
- Use **Tailwind CSS** for styling.
- Use a consistent component library or reusable custom components. Prefer **shadcn/ui** where appropriate.
- Use **Lucide icons**.
- Use realistic, centralized mock data to simulate backend responses.
- Use local client-side state and browser storage where appropriate to preserve demo progress.
- Create simulated AI responses and workflow decisions through deterministic mock logic.
- Include loading states, success and error feedback, empty states, modals, toasts, and realistic interactions.
- Make all primary navigation, cards, tabs, filters, buttons, forms, and workflow actions functional.
- Ensure the app is responsive, especially for laptop and presentation-screen use.
- Include a clearly identifiable demo mode or demo data indicator.
- Do not require API keys, external AI credentials, cloud services, or live third-party accounts.

### Proposed future architecture (documentation only)

The intended production architecture is:

- **Frontend:** Next.js
- **Backend:** FastAPI
- **Database:** PostgreSQL
- **Potential future services:** AI orchestration, document processing, regulatory knowledge retrieval, notification services, integration adapters, and scheduled regulatory monitoring.

Do not implement the FastAPI backend or PostgreSQL database in this prototype. Do not create fake endpoints that imply a real backend is running. Instead, define clean frontend service interfaces and mock implementations that could later be replaced by real API calls.

The prototype must be fully usable without a backend.

---

# 2. PRODUCT POSITIONING AND CORE DIFFERENTIATORS

Build IndusAI around the following product differentiators. They must be visible in the actual application and demonstrated through interactive workflows, not merely listed on a landing page.

## 2.1 Conversational Approval Roadmap Generator

An applicant describes a proposed industrial project through a guided conversational interface.

The assistant collects project information such as:

- Project name
- Business activity
- Industry sector
- Project location
- Land ownership or lease status
- Proposed investment
- Land area
- Built-up area
- Workforce estimate
- Water requirements
- Power requirements
- Manufacturing processes
- Pollution category, if known
- Existing registrations and approvals
- Project stage
- Intended commencement date

The assistant should ask relevant follow-up questions based on previous answers.

Once sufficient information is collected, it should produce a structured project profile and a personalized approval roadmap.

For the prototype, use a deterministic rules-based mock recommendation engine. Present the result as an AI-generated suggestion, clearly marked as illustrative.

## 2.2 Dynamic Dependency-Aware Approval Roadmap

Generate a visual roadmap showing the approvals relevant to the project.

The roadmap must distinguish:

- Completed approvals
- In-progress approvals
- Not-started approvals
- Blocked approvals
- Approvals awaiting applicant action
- Approvals awaiting departmental action
- Parallel approval branches
- Dependency relationships
- Critical deadlines
- Potential bottlenecks

Use an interactive graph or a structured dependency-aware flow visualization.

Users must be able to click individual approval nodes and open a detailed approval panel.

The panel should include:

- Approval name
- Department
- Purpose
- Why it applies to this project
- Dependencies
- Estimated processing duration
- Required documents
- Application status
- Relevant deadlines
- Applicant actions
- Department actions
- Relevant official portal link, if a grounded link is available
- Contextual AI assistant

Support filtering by department, status, and stage.

Provide both a visual roadmap view and a list view for accessibility and easier presentation.

## 2.3 Continuous Regulatory Intelligence

IndusAI is designed to monitor regulatory information and identify changes that could affect project approvals.

For the prototype, simulate a regulatory monitoring service.

Show:

- Regulatory update feed
- Source name
- Update title
- Publication or detection date
- Affected approval types
- Summary of the change
- Impact level
- Review status
- Version history
- Affected project roadmaps
- Recommended next actions

Include a simulated monitoring action that detects a mock policy change, creates a new regulatory knowledge entry, and identifies affected approval nodes.

Do not claim that the prototype is actually scraping government websites.

Include a visible explanation that real scheduled scraping, source verification, and automated policy ingestion belong to a future backend implementation.

Any simulated policy change must pass through a visible human-review state before being treated as verified.

## 2.4 Approval-Specific Contextual AI Assistant

Provide a conversational assistant that understands the active project and, where applicable, the selected approval.

The assistant should answer questions about:

- Approval requirements
- Documents
- Application progress
- Dependencies
- Deadlines
- Common rejection reasons
- Next steps
- Compliance obligations
- Renewals
- Relevant incentives
- Regulatory updates

Its answers should use the mock regulatory knowledge base and the active project data.

The assistant should be context-sensitive. For example, opening the assistant from a pollution clearance approval should provide guidance relevant to that approval rather than generic business advice.

Use deterministic mock response logic and a set of curated example answers. Avoid pretending a real language model is connected.

Clearly distinguish official-source information, illustrative guidance, and unverified suggestions.

## 2.5 Intelligent Document Reuse and Validation

Create a document center where applicants can upload simulated documents, inspect their status, reuse them across applications, and understand which requirements each document satisfies.

Support:

- Document upload UI
- Document type selection
- Document preview or file metadata display
- Simulated OCR extraction
- Extracted field display
- Validation status
- Expiration dates
- Reuse across approvals
- Requirement-to-document traceability
- Missing-document detection
- Document version history
- Re-upload and replacement
- Simulated DigiLocker connection

For demo purposes, users can select sample documents from a prepared document library. Uploading a file may update its local metadata and status, but no real OCR or external DigiLocker connection is required.

Display clear document states:

- Verified (simulated)
- Pending verification
- Needs correction
- Expired
- Missing
- Reused

Never imply that a simulated document verification is legally valid or actually verified by a government authority.

## 2.6 Pre-Submission Readiness Engine

Before an application is submitted, show a readiness report.

Include:

- Required document completion
- Missing information
- Field-level validation errors
- Expired or potentially outdated documents
- Dependency readiness
- Outstanding applicant actions
- Potential inconsistencies
- Suggested corrections
- Overall readiness percentage

The readiness score must be derived from mock checklist completion and validation logic, not presented as a real government approval probability.

Allow the user to resolve issues and rerun the check.

Provide a clear distinction between a pre-submission check and official departmental acceptance.

## 2.7 Explainable Risk and Delay Detection

Show illustrative risk indicators for applications and approvals.

Possible factors:

- Missing documents
- Incomplete fields
- Dependency delays
- Approaching deadlines
- Pending applicant responses
- Departmental review duration
- Simulated inspection scheduling conflicts

For every risk indicator, show:

- The factor detected
- The supporting mock data
- The potential consequence
- A suggested next action

Use transparent labels such as “Attention needed” or “Potential delay.”

Do not present mock risk scores as validated predictions.

Government officers should see risk flags as decision-support information, not automated decisions.

## 2.8 Common Inspection Planning

Create a simulated inspection coordination feature.

Where multiple approvals require site inspections, show:

- Inspection type
- Relevant department
- Proposed date
- Location
- Inspection status
- Scheduling conflicts
- Potential opportunities to coordinate visits
- Officer assignment
- Applicant availability

Provide a common inspection planning view that suggests compatible inspections that might be coordinated.

Coordination must remain a suggestion. Do not automatically merge inspections or imply that departments have agreed to a shared inspection.

Allow users to propose or confirm a mock inspection slot and show the resulting status change.

## 2.9 Grievance Management and Escalation

Create a grievance center for applicants.

Allow users to:

- Create a grievance
- Select a related application or approval
- Choose a grievance category
- Describe the issue
- Attach a simulated supporting document
- View a reference number
- Track status
- View a timeline of actions
- See escalation eligibility
- Submit an escalation request
- Review responses

Provide illustrative escalation rules based on mock SLA data.

Include officer and administrator views for grievance handling.

## 2.10 Incentive and Scheme Discovery

Show government incentive schemes that may be relevant to the user's project profile.

Include:

- Scheme name
- Department or agency
- Eligibility summary
- Relevant industry or project criteria
- Required documents
- Application status
- Deadline, if applicable
- Preparation checklist
- Next action

Allow applicants to save a scheme and open a simulated incentive application journey.

Clearly label eligibility suggestions as preliminary and subject to official scheme rules and verification.

## 2.11 Bottleneck and SLA Analytics

Create analytics that reveal where application delays occur.

Show mock metrics such as:

- Applications by status
- Average processing duration
- SLA compliance
- Overdue applications
- Departmental workload
- Common delay reasons
- Grievances by category
- Inspection scheduling performance
- Application volume trends
- Approval-stage bottlenecks

Include filters by department, date range, project sector, and status where appropriate.

The analytics must use internally consistent mock data. Make clear that all displayed figures are illustrative.

---

# 3. USER ROLES AND EXPERIENCE

Implement three distinct role-based experiences.

## 3.1 Applicant / Business Owner

The applicant experience is the primary demo journey.

The applicant must be able to:

- View a personalized dashboard
- Create and edit projects
- Complete the conversational project intake
- Generate a project approval roadmap
- Explore approval dependencies
- Use the contextual assistant
- Manage documents
- Simulate DigiLocker linking
- Run pre-submission checks
- Track applications
- Respond to departmental queries
- View inspections
- Receive notifications
- Raise and track grievances
- Discover and prepare incentive applications
- View compliance and renewal reminders
- Edit project information and reassess the roadmap

## 3.2 Government Officer

The officer experience should simulate a departmental workspace.

The officer must be able to:

- View assigned applications
- Filter and search the application queue
- Open an application detail view
- Review applicant and project information
- Inspect submitted documents
- Mark documents as verified or requiring correction
- Approve, reject, or request additional information in the simulated workflow
- Add internal notes
- Send an applicant-facing query
- View the application history
- Review SLA deadlines
- See explainable risk flags
- View and propose inspection slots
- Manage assigned grievances
- View workload and processing analytics

Every officer action must update the corresponding applicant-facing mock state when relevant.

## 3.3 Administrator

The administrator experience should simulate system management.

The administrator must be able to:

- View system-wide dashboard metrics
- Manage users and roles in mock data
- View departments and workflow configurations
- Inspect regulatory knowledge entries
- Add a simulated regulatory update
- Review pending policy changes
- Approve or reject simulated knowledge-base updates
- View affected approval workflows
- Review audit logs
- View SLA and bottleneck analytics
- Inspect grievance escalation settings

Role-based navigation and page access must be functional in the frontend.

A role switcher may be provided for demonstration. Label it clearly as a demo role switcher, not real authentication.

---

# 4. APPLICATION STRUCTURE AND NAVIGATION

Build a consistent application shell with:

- Left sidebar navigation
- Top header
- Breadcrumbs where useful
- Page title and contextual description
- Notification center
- User profile menu
- Role indicator
- Demo mode indicator
- Responsive sidebar behavior

Use role-specific navigation.

## 4.1 Applicant Navigation

1. Overview
2. My Projects
3. Approval Roadmap
4. Applications
5. Documents
6. AI Assistant
7. Inspections
8. Incentives
9. Grievances
10. Compliance & Renewals
11. Regulatory Updates
12. Notifications
13. Profile & Settings

## 4.2 Officer Navigation

1. Officer Overview
2. Application Queue
3. Assigned Applications
4. Document Review
5. Inspections
6. Grievances
7. SLA Monitoring
8. Reports

## 4.3 Administrator Navigation

1. Admin Overview
2. User & Role Management
3. Departments
4. Workflow Configuration
5. Regulatory Knowledge Base
6. Policy Update Review
7. System Analytics
8. Audit Logs
9. Grievance Configuration

Keep the information architecture understandable. Do not overwhelm the interface by displaying every possible metric on every page.

---

# 5. DETAILED PAGE REQUIREMENTS

## 5.1 Public Landing / Welcome Page

Create a polished welcome page that introduces IndusAI.

Include:

- Product name and identity
- Concise value proposition
- A short explanation of the problem
- Core platform capabilities
- A simple “How it works” section
- A clear entry point into the demo
- A demo role selection option

Avoid unsupported claims about actual government partnerships, live integrations, or real processing-time reductions.

## 5.2 Demo Entry and Role Selection

Provide a demo entry experience that lets the presenter choose:

- Applicant
- Government Officer
- Administrator

Allow the user to enter the application with seeded demo data.

Provide an optional “Start fresh demo” action that resets local prototype state to the original sample dataset.

## 5.3 Applicant Dashboard

Show an informative overview of the applicant's active projects.

Include summary cards for:

- Active projects
- Total approvals
- Approvals completed
- Applications awaiting action
- Upcoming deadlines
- Documents needing attention

Add:

- Current project selector
- Approval progress visualization
- Recent application activity
- Upcoming actions
- Recent notifications
- Important regulatory updates
- A “Continue project setup” or “View roadmap” action

Use realistic example content rather than generic placeholder text.

## 5.4 Project Creation Wizard

Create a multi-step project setup flow.

Suggested steps:

1. Basic project information
2. Business activity and sector
3. Project location
4. Land and infrastructure details
5. Investment and employment
6. Environmental and operational details
7. Existing registrations and approvals
8. Review project profile

Use a conversational assistant alongside the form.

The conversational intake should ask questions dynamically based on the selected project details.

Provide:

- Chat transcript
- Assistant typing/loading state
- Suggested answers where useful
- Input field
- Send action
- Progress indicator
- Back and continue controls
- Editable answers
- Form validation
- Review screen

The user should be able to complete the flow without typing every answer manually. Include a “Use sample answers” or “Load demo project” option.

When intake is complete, show a generated project summary for review.

On confirmation, create the project in local state and navigate to its roadmap.

## 5.5 Project Detail and Roadmap

This is one of the most important screens in the application.

Include:

- Project header and status
- Project information summary
- Edit project action
- Roadmap progress
- Visual dependency graph
- Parallel approval branches
- Department labels
- Status indicators
- Estimated durations
- Deadline markers
- Roadmap/list view toggle
- Status and department filters

Each approval node must be clickable.

Selecting an approval should open a side panel or detail page containing:

- Approval overview
- Department
- Purpose
- Applicability explanation
- Dependencies
- Required documents
- Current status
- Timeline
- Applicant tasks
- Department tasks
- Estimated SLA
- Next action
- Contextual AI assistant entry point

Make the graph understandable at a glance. Use a clear visual convention for dependencies and parallel branches. Avoid decorative graph complexity that makes the roadmap hard to read.

### Editing and reassessment

When the applicant edits the project profile:

1. Reopen the conversational intake with existing answers prefilled.
2. Allow the user to update relevant information.
3. Show a summary of changed fields.
4. Simulate roadmap reassessment.
5. Display approvals that may be added, removed, or affected.
6. Ask the user to confirm the updated roadmap.
7. Update the project and roadmap in local state.

Do not silently discard completed progress when a project is edited. Show how changes affect existing approvals and clearly flag any illustrative assumptions.

## 5.6 Approval Detail and Contextual Assistant

Create a detailed approval view with a clear information hierarchy.

Tabs or sections may include:

- Overview
- Requirements
- Documents
- Timeline
- Activity
- Assistant

The assistant must inherit the current project and approval context.

Provide sample prompts such as:

- “Why is this approval required?”
- “Which documents are still missing?”
- “What is blocking this approval?”
- “What should I do next?”
- “Explain the dependency with the other approvals.”

The assistant should produce helpful, concise mock answers grounded in the prototype's knowledge entries and project state.

## 5.7 Application Tracking Center

Create a unified application tracker.

Include:

- Search
- Status filters
- Department filters
- Project filters
- Sort by deadline or recent activity
- Application reference number
- Approval name
- Department
- Submission date
- Current status
- SLA deadline
- Next action

Opening an application should show:

- Full application timeline
- Status history
- Submitted documents
- Departmental queries
- Applicant responses
- Officer actions
- SLA information
- Risk indicators
- Related inspection
- Related grievance
- Relevant approval detail

Include a working simulated response flow when an officer sends a query.

## 5.8 Document Center

Build a document management workspace.

Show:

- Document list
- Search and filters
- Document categories
- Verification state
- Expiration date
- Associated projects
- Associated approvals
- Reuse count
- Upload or add document action

Provide a document detail drawer with:

- File metadata
- Simulated extracted fields
- Validation results
- Requirements satisfied
- Related applications
- Version history
- Expiry information

### Simulated upload and validation

The upload interaction must be functional at the UI level.

After a user selects a file:

1. Display its filename and metadata.
2. Ask the user to select its document type.
3. Simulate an upload progress state.
4. Show simulated OCR extraction.
5. Display extracted fields.
6. Run mock validation checks.
7. Allow the user to confirm or correct the extracted values.
8. Save the document in local prototype state.
9. Show the updated document status and reuse availability.

Provide prepared sample documents so the demo can be completed quickly.

### Simulated DigiLocker

Provide a “Connect DigiLocker” action.

On click:

- Show a clearly marked simulated connection flow.
- Display an illustrative consent screen.
- Let the user confirm.
- Show a successful demo connection state.
- Populate the document center with sample documents.

Do not request actual credentials or claim a real connection.

## 5.9 Pre-Submission Readiness

Create a readiness-check screen accessible from each relevant application.

Show:

- Overall readiness
- Required fields
- Required documents
- Missing items
- Validation errors
- Dependency status
- Outstanding applicant actions
- Recommendations

Make each issue clickable so users can navigate directly to the relevant form field or document.

Provide a “Run readiness check” action with a loading state and an updated report.

Provide a “Resolve issue” action for each correctable issue.

When all required mock checks are satisfied, show a ready-to-submit state.

The submission action must be simulated and update the application timeline.

## 5.10 AI Assistant Workspace

Provide a full-page assistant workspace in addition to contextual assistants.

Include:

- Chat history
- New conversation action
- Current project context selector
- Topic suggestions
- Example questions
- Assistant responses
- Source references to mock knowledge entries
- Clear indication of illustrative AI behavior

Allow the user to switch between project-level and approval-level contexts.

Use a small set of reusable response templates and contextual rules. Responses should reflect the user's selected project, current application status, and mock knowledge base.

## 5.11 Inspections Workspace

Create an inspection dashboard.

Show:

- Upcoming inspections
- Completed inspections
- Proposed inspections
- Pending confirmation
- Conflicts
- Inspection type
- Department
- Date
- Location
- Related approval
- Assigned officer

Provide a calendar or schedule view and a list view.

Create a common inspection planning panel that identifies possible coordination opportunities.

Allow the applicant to propose availability and the officer to suggest or confirm a mock slot.

Update the inspection timeline and related application state after each action.

## 5.12 Grievance Center

Build an applicant-facing grievance center.

Include:

- Grievance list
- Reference numbers
- Category
- Related application
- Submission date
- Status
- Last update
- Escalation eligibility

Create a grievance submission form with:

- Related project
- Related approval or application
- Category
- Subject
- Description
- Optional simulated attachment
- Submission confirmation

Generate a mock grievance reference number.

Show a grievance detail view with a chronological activity timeline.

Allow escalation when the illustrative mock SLA rules permit it.

Show a confirmation dialog before escalation and update the grievance status after confirmation.

## 5.13 Incentive Discovery and Application Preparation

Create an incentive workspace with:

- Scheme cards
- Search and filters
- Industry relevance
- Eligibility indicators
- Document requirements
- Application status
- Saved schemes

Provide a scheme detail page.

Allow users to:

1. Open a scheme.
2. Review its illustrative eligibility criteria.
3. Save it.
4. Start a preparation journey.
5. Review required documents.
6. Resolve missing items.
7. Complete a mock application form.
8. Review and simulate submission.
9. Track its status.

Clearly state that official eligibility and benefit determinations require verification against the applicable scheme.

## 5.14 Compliance and Renewals

Create a compliance workspace showing:

- Compliance obligations
- Related approvals
- Due dates
- Renewal windows
- Current status
- Required documents
- Reminder settings
- Suggested next actions

Allow users to open a compliance item, review its checklist, and simulate completion or renewal preparation.

Include notifications for approaching deadlines.

## 5.15 Regulatory Updates

Create a regulatory intelligence page.

Include:

- Update feed
- Source label
- Publication date
- Detected date
- Review status
- Impact level
- Affected approvals
- Affected projects
- Summary
- Version history

Provide a simulated “Run monitoring check” action.

When clicked:

1. Show a monitoring progress state.
2. Load a prepared mock regulatory update.
3. Display the detected change.
4. Identify potentially affected approval types.
5. Show which projects and roadmap nodes might be affected.
6. Create a pending-review knowledge entry.
7. Notify the administrator.
8. Allow an administrator to approve or reject the update.

When an update is approved, simulate a roadmap reassessment for affected projects. Show the user a review screen before changing their roadmap.

## 5.16 Notifications

Create a notification center with:

- Unread count
- Notification list
- Category filters
- Read/unread states
- Timestamp
- Related project or application
- Relevant action link

Notifications should be generated by simulated events such as:

- Application status changes
- Officer queries
- Upcoming deadlines
- Missing documents
- Inspection updates
- Grievance responses
- Regulatory updates
- Renewal reminders
- Incentive progress

Allow users to mark notifications as read and navigate to the related screen.

## 5.17 Officer Overview and Application Queue

Build an officer dashboard with:

- Assigned application count
- Pending document reviews
- Applications approaching SLA
- Overdue applications
- Upcoming inspections
- Open grievances
- Recent activity

The application queue should support:

- Search
- Status filters
- Department filters
- SLA filters
- Sorting
- Application detail access

Use realistic mock records and consistent status values.

## 5.18 Officer Application Review

Create a detailed review workspace.

Include:

- Applicant information
- Project profile
- Approval details
- Application form data
- Submitted documents
- Document verification controls
- Application timeline
- SLA information
- Risk flags
- Internal notes
- Applicant communication

Actions:

- Verify document
- Request document correction
- Send query to applicant
- Record review note
- Approve application
- Reject application with a reason
- Propose inspection slot

Every action must update the relevant mock application state and create a timeline event.

Before an approval or rejection, show a confirmation dialog. For rejection, require a reason.

Do not make approval decisions automatically based on risk flags.

## 5.19 Officer Grievance Management

Allow officers to:

- View assigned grievances
- Open grievance details
- Review related application history
- Add an internal note
- Respond to the applicant
- Change the grievance status
- Recommend or initiate escalation where permitted by mock rules

Show a timeline of grievance actions.

## 5.20 Admin Overview

Show illustrative system metrics:

- Total users
- Active projects
- Applications in progress
- Applications overdue
- SLA compliance
- Pending regulatory updates
- Open grievances
- Departmental workload

Include recent system activity and links to the main administration modules.

## 5.21 Admin Regulatory Knowledge Base

Create a searchable knowledge base with mock regulatory entries.

Each entry should include:

- Entry title
- Regulation or guidance category
- Source name
- Source URL field where grounded or explicitly marked as illustrative
- Version
- Effective date
- Last reviewed date
- Verification status
- Affected approval types
- Summary
- Document or reference metadata

Allow administrators to:

- Search and filter entries
- Open entry details
- Add a mock entry
- Edit an entry
- Mark an entry for review
- Approve a pending update
- Reject a pending update
- View version history

The interface must distinguish verified mock reference entries from pending illustrative changes.

## 5.22 Admin Workflow and Department Management

Create a configuration workspace with:

- Department list
- Department contact or owner fields using mock data
- Approval workflow definitions
- Dependency relationships
- Illustrative SLA targets
- Required document mappings
- Active/inactive status

Allow an administrator to edit selected configuration fields and save changes to local state.

Do not create a complex workflow editor that consumes time at the expense of the main applicant journey. A clear editable configuration view is sufficient.

## 5.23 Analytics and Reports

Provide role-appropriate analytics.

Use charts and tables to show:

- Application status distribution
- Department workload
- SLA performance
- Processing time trends
- Common delay causes
- Grievance trends
- Inspection coordination
- Regulatory update impact

Use a charting library compatible with React, such as Recharts, if appropriate.

Provide functional filters where practical.

All figures must be generated from the mock dataset. Keep totals and derived metrics internally consistent.

## 5.24 Audit Logs

Create an administrator audit-log view.

Show:

- Timestamp
- Actor
- Role
- Action
- Entity type
- Entity reference
- Outcome

Generate log entries for important simulated actions such as:

- Application status changes
- Document verification
- Policy update review
- Role configuration
- Workflow edits
- Grievance escalation

Allow filtering by actor, action, and date range.

---

# 6. MOCK DATA AND SIMULATED SERVICES

Create a well-organized mock data layer rather than embedding large data arrays throughout page components.

## 6.1 Required mock entities

Define TypeScript types and mock records for:

- Users
- Roles
- Departments
- Projects
- Project profiles
- Approval types
- Approval roadmap nodes
- Approval dependencies
- Applications
- Application timeline events
- Documents
- Document validation results
- Regulatory knowledge entries
- Regulatory update proposals
- Notifications
- Inspections
- Grievances
- Incentive schemes
- Incentive applications
- Compliance obligations
- SLA records
- Analytics events
- Audit logs

Use stable IDs and explicit relationships.

## 6.2 Sample demo scenario

Seed the application with a fictional Maharashtra industrial project.

Suggested scenario:

**Project:** Sahyadri Precision Components  
**Industry:** Manufacturing / engineering components  
**Location:** Pune district, Maharashtra  
**Investment:** ₹18 crore  
**Land:** Industrial plot with a simulated lease arrangement  
**Workforce:** 85 employees  
**Project stage:** Pre-establishment

Use the scenario as illustrative demo data only. Do not represent it as a real company or real government application.

Include plausible mock approvals and dependencies such as:

- Business registration or entity documentation
- Land-related documentation
- Building plan approval
- Factory-related approval
- Pollution control consent
- Electricity connection
- Water-related permission, where applicable
- Fire safety clearance
- Local permissions
- Applicable post-establishment compliance

Do not hardcode universal legal requirements. The mock roadmap should be presented as an illustrative, project-dependent suggestion and not authoritative legal advice.

Create several applications with different statuses so the officer and administrator dashboards have meaningful content.

Seed examples of:

- Completed application
- Application awaiting document correction
- Application under departmental review
- Application approaching an illustrative SLA deadline
- Application blocked by a dependency
- Application with an inspection pending
- Application with a grievance

Include sample documents such as:

- Business registration certificate
- Identity or authorization document
- Land lease document
- Project report
- Site plan
- Utility information
- Environmental information

These are demo records. Do not include real personal information.

## 6.3 Mock service architecture

Create service modules such as:

- `projectService`
- `roadmapService`
- `applicationService`
- `documentService`
- `assistantService`
- `regulatoryService`
- `inspectionService`
- `grievanceService`
- `incentiveService`
- `notificationService`
- `analyticsService`
- `adminService`

Each module should expose asynchronous functions that simulate realistic response behavior.

Use a small configurable mock delay where it improves the experience.

Keep mock service functions separate from UI components. This will make future replacement with FastAPI endpoints straightforward.

Create a single service configuration or adapter boundary so that future API integration can be introduced without rewriting page components.

## 6.4 State persistence

Use a suitable client-side state solution, such as Zustand or React Context with reducers, depending on project complexity.

Persist essential demo state to local storage:

- Selected role
- Projects
- Application updates
- Document states
- Notifications
- Inspections
- Grievances
- Regulatory update review state
- User preferences

Handle invalid or outdated persisted data safely.

Provide a reset action to restore seeded demo state.

Avoid storing sensitive information. The prototype should use fictional data only.

---

# 7. AI SIMULATION DESIGN

The prototype must convincingly demonstrate AI-assisted workflows without connecting to a real model.

Build reusable mock AI logic for:

## 7.1 Conversational intake

- Ask questions based on missing project fields.
- Use previous answers to decide the next question.
- Validate basic input formats.
- Generate a project summary.
- Generate a mock roadmap based on project attributes.
- Explain the assumptions behind the generated roadmap.

## 7.2 Approval guidance

- Match the active approval to mock knowledge entries.
- Explain its purpose.
- Summarize required documents.
- Identify missing items.
- Explain dependencies.
- Recommend the next action.

## 7.3 Document analysis

- Generate sample extracted fields based on selected document type.
- Simulate validation checks.
- Identify missing or inconsistent values.
- Show correction suggestions.
- Update document readiness when corrected.

## 7.4 Risk and next-action engine

- Examine mock status, deadlines, dependencies, and missing requirements.
- Generate transparent risk flags.
- Recommend a specific next action.
- Explain which data triggered the recommendation.

## 7.5 Regulatory impact analysis

- Match mock policy changes to approval categories.
- Identify affected projects and roadmap nodes.
- Generate a review summary.
- Request human verification before applying the change.

## 7.6 Assistant response quality

Responses should be concise, specific, and contextual.

Avoid repetitive generic responses such as “Please consult the relevant department” as the entire answer.

When the mock knowledge base does not contain sufficient information, the assistant should say that the prototype does not have a verified reference for the question and direct the user to review the official source.

Never fabricate a legal citation or imply that a mock answer is an official determination.

---

# 8. VISUAL DESIGN SYSTEM

Build a modern, professional government-technology product interface.

The design should communicate:

- Trust
- Clarity
- Operational efficiency
- Transparency
- Modern digital public infrastructure

Avoid making the application look like a generic admin template with unmodified default cards.

## 8.1 Visual direction

Use a restrained visual system:

- Deep navy or dark blue for primary navigation and strong structure
- Teal or green accents for progress and positive states
- Neutral off-white or light gray application backgrounds
- White or subtle surface cards
- Clear typography
- Consistent spacing
- Subtle borders and restrained shadows
- Accessible contrast

Use color meaning consistently.

Suggested status conventions:

- Green: completed or verified
- Blue: in progress
- Amber: attention needed or approaching deadline
- Red: overdue, rejected, or blocking issue
- Gray: inactive, not started, or informational

Do not rely on color alone. Include text labels and icons.

## 8.2 Layout

Prioritize desktop and laptop presentation.

Use:

- A consistent sidebar width
- A clear top bar
- Responsive content width
- Well-spaced dashboard sections
- Readable tables
- Consistent detail drawers
- Predictable modal sizes
- Responsive mobile navigation

Avoid:

- Excessively large headings
- Huge empty hero areas inside application screens
- Overloaded dashboards
- Unnecessary gradients
- Excessive animation
- Tiny low-contrast text
- Nonfunctional decorative controls

## 8.3 Interaction design

Implement:

- Hover and focus states
- Clear active navigation
- Loading skeletons where useful
- Toast feedback
- Confirmation dialogs for consequential actions
- Inline validation
- Empty states
- Error states
- Tooltips for complex indicators
- Accessible keyboard navigation for primary workflows

Every visible control must have a meaningful action. Remove or disable controls that are intentionally out of scope, and label them appropriately.

---

# 9. TECHNICAL IMPLEMENTATION REQUIREMENTS

## 9.1 Initial setup

Start by inspecting the working directory.

If no project exists, initialize a new Next.js application using the App Router and TypeScript.

Configure:

- Tailwind CSS
- shadcn/ui or reusable component equivalents
- Lucide icons
- State management
- Form handling and validation
- Charting library, if needed
- Linting and type checking

Use stable, compatible package versions. Do not introduce unnecessary dependencies.

## 9.2 Suggested project organization

Organize the codebase into logical areas such as:

- `app/` — routes and layouts
- `components/` — reusable UI
- `components/layout/` — sidebar, header, shell
- `components/dashboard/` — dashboard components
- `components/roadmap/` — graph and approval components
- `components/forms/` — reusable form controls
- `components/documents/` — document UI
- `components/assistant/` — chat components
- `components/analytics/` — charts and metric cards
- `features/` — domain-specific components and logic
- `lib/` — utilities, validation, constants
- `services/` — mock service implementations
- `store/` — application state
- `data/` — seed data
- `types/` — shared TypeScript types
- `hooks/` — reusable hooks

Adapt this organization where appropriate, but preserve separation between UI, business logic, state, and mock services.

## 9.3 Routing

Use Next.js App Router.

Implement clear route groups or layouts for applicant, officer, and administrator experiences.

Use a centralized route map or equivalent to avoid inconsistent navigation paths.

Ensure that:

- Refreshing a page does not break the experience.
- Direct navigation to supported routes works.
- Unknown routes show a useful not-found screen.
- Demo role changes navigate to the correct workspace.
- Role restrictions are enforced at the UI routing layer.

This is not production security. Clearly document that frontend role restrictions are only for prototype demonstration.

## 9.4 Forms

Use a consistent form strategy.

Support:

- Controlled or form-library-managed inputs
- Field validation
- Required-field indicators
- Helpful error messages
- Disabled submit states
- Review screens
- Confirmation steps for consequential actions

Avoid building large forms as one unstructured component.

## 9.5 Roadmap graph

Choose a suitable graph or flow library compatible with Next.js and React.

Represent dependencies explicitly in data.

The roadmap must support:

- Multiple branches
- Parallel approvals
- Status indicators
- Clickable nodes
- Dependency edges
- Zoom or fit-to-view if supported
- Readable labels
- Detail-panel integration

Provide a list fallback so the roadmap remains usable if the graph library has limitations.

## 9.6 Charts

Use a consistent charting approach.

Charts must:

- Have titles and labels
- Use readable axes
- Display useful tooltips
- Reflect active filters where implemented
- Use internally consistent mock values
- Include an empty state if no records match

## 9.7 Accessibility and responsive behavior

Use semantic HTML and accessible component patterns.

Support:

- Keyboard navigation
- Visible focus
- Accessible form labels
- Dialog focus handling
- Adequate contrast
- Responsive tables or alternate mobile layouts
- Useful text alternatives for status and charts

Do not sacrifice usability for visual complexity.

---

# 10. COMPLETE END-TO-END DEMO JOURNEY

The prototype must support the following presentation storyline without requiring manual code changes or a backend.

This is the primary acceptance scenario.

## Phase 1: Applicant starts a project

1. Open the IndusAI welcome page.
2. Enter the demo as an applicant.
3. View the applicant dashboard.
4. Start a new industrial project.
5. Use the conversational intake.
6. Answer the project questions or load sample answers.
7. Review the generated project profile.
8. Confirm the profile.

Expected result: a project is created in local state.

## Phase 2: Generate and explore the roadmap

1. Show the simulated roadmap generation process.
2. Display the personalized approval roadmap.
3. Highlight dependencies and parallel branches.
4. Open an approval node.
5. Review its purpose, requirements, documents, and status.
6. Ask the contextual assistant a question.
7. View the recommended next action.

Expected result: the user understands why approvals are needed and how they relate.

## Phase 3: Reuse and validate documents

1. Open the document center.
2. Simulate DigiLocker linking or select sample documents.
3. Open a document.
4. Show simulated extracted fields.
5. Correct an illustrative validation issue.
6. Reuse the document in a relevant application.
7. Open pre-submission readiness.
8. Resolve a missing-document issue.
9. Rerun the readiness check.

Expected result: document state and readiness update visibly.

## Phase 4: Simulate an application submission

1. Open an application.
2. Review the form and requirements.
3. Complete the mock readiness check.
4. Submit the application through the simulated flow.
5. Show a generated reference number.
6. Update the application timeline.
7. Display a success notification.

Expected result: application status changes and remains visible across relevant pages.

## Phase 5: Switch to the officer role

1. Use the demo role switcher to enter the officer workspace.
2. Open the application queue.
3. Locate the newly submitted application.
4. Open the review workspace.
5. Review the application and its documents.
6. Mark a document as needing correction.
7. Send a query to the applicant.

Expected result: the application timeline and applicant notifications update.

## Phase 6: Return to the applicant

1. Switch back to applicant mode.
2. Open notifications.
3. Open the officer query.
4. Review the requested correction.
5. Replace or correct the relevant mock document.
6. Submit the response.
7. Show the updated application status.

Expected result: the applicant and officer views reflect the same simulated application state.

## Phase 7: Demonstrate SLA and inspection coordination

1. Open the application tracker.
2. Show an application with an approaching mock SLA deadline.
3. Open its delay explanation.
4. Review the suggested next action.
5. Open the inspection workspace.
6. Show inspections associated with multiple approvals.
7. Demonstrate a possible common inspection opportunity.
8. Propose or confirm a mock slot.

Expected result: the prototype demonstrates visibility and coordination without claiming real departmental scheduling.

## Phase 8: Demonstrate grievance escalation

1. Open the grievance center.
2. Create a grievance related to an application.
3. Show the generated reference number.
4. Open the grievance timeline.
5. Demonstrate an eligible escalation.
6. Switch to the officer workspace.
7. Review and respond to the grievance.

Expected result: grievance states and timeline actions update consistently.

## Phase 9: Demonstrate regulatory intelligence

1. Switch to administrator mode.
2. Open the regulatory monitoring page.
3. Run the simulated monitoring check.
4. Display a mock policy change.
5. Show its source metadata and pending verification state.
6. Identify affected approvals and projects.
7. Review the proposed knowledge-base update.
8. Approve the update as the administrator.
9. Return to the applicant view.
10. Show the regulatory notification.
11. Review the suggested roadmap impact.
12. Confirm or dismiss the illustrative reassessment.

Expected result: the prototype demonstrates the complete concept of detecting, reviewing, and communicating a regulatory change.

## Phase 10: Demonstrate analytics and system management

1. Open officer analytics.
2. Filter application workload by department or status.
3. Open SLA performance.
4. Switch to administrator analytics.
5. Review bottleneck metrics.
6. Open audit logs.
7. Show records generated by the previous demo actions.

Expected result: analytics and logs are connected to the simulated activity where practical.

---

# 11. FUNCTIONALITY AND CONSISTENCY RULES

These rules are mandatory.

## 11.1 No dead-end controls

Every visible primary control must work.

Examples:

- Sidebar links navigate.
- Search filters results.
- Tabs switch content.
- Filters affect lists or charts.
- Forms validate and submit.
- Buttons perform actions.
- Cards open their intended detail view.
- Notifications navigate to relevant records.
- Modals have working cancel and confirm actions.
- Role switching changes the workspace.
- Reset demo restores the initial state.

If a feature is intentionally illustrative rather than fully implemented, show a clear label and provide a meaningful demo interaction.

## 11.2 Shared state consistency

A simulated action in one role should be reflected in the other roles wherever relevant.

Examples:

- Officer requests a document correction → applicant sees a query notification.
- Applicant responds to a query → officer sees the updated application.
- Officer verifies a document → applicant sees the updated verification state.
- Applicant submits an application → officer sees it in the queue.
- Administrator approves a policy update → applicant sees the resulting notification and proposed roadmap impact.
- Officer responds to a grievance → applicant sees the response in the grievance timeline.

Avoid maintaining duplicate, conflicting copies of the same record across pages.

## 11.3 Meaningful loading and feedback

For asynchronous mock actions, show a brief loading state where it helps communicate the process.

Use success and error feedback for:

- Project creation
- Roadmap generation
- Document processing
- Readiness checks
- Application submission
- Officer review actions
- Grievance submission
- Inspection changes
- Regulatory monitoring
- Knowledge-base review

Do not add artificial delays to every trivial interaction.

## 11.4 Realistic and coherent data

Maintain consistent references between:

- Projects and applications
- Applications and approvals
- Approvals and dependencies
- Applications and documents
- Applications and inspections
- Applications and grievances
- Regulatory updates and affected roadmap nodes
- User roles and assigned records

Avoid contradictory statuses or impossible timelines.

---

# 12. TESTING AND QUALITY ASSURANCE

Do not consider the work complete merely because the development server starts.

## 12.1 Required checks

Run the available project checks, including:

- TypeScript type checking
- ESLint
- Production build
- Relevant unit tests
- Relevant component or integration tests, if configured

Resolve errors rather than ignoring them.

## 12.2 Functional testing

Test the primary demo scenario from beginning to end.

At minimum, verify:

- Project creation
- Roadmap display
- Approval detail interaction
- Contextual assistant response
- Document upload or sample document selection
- Document validation
- Readiness check
- Application submission
- Officer review
- Applicant query response
- Notification updates
- Inspection action
- Grievance creation and escalation
- Regulatory update review
- Analytics filtering
- Demo reset

## 12.3 UI inspection

If browser automation or a browser preview is available, inspect the actual running application.

Check:

- Landing page
- Applicant dashboard
- Project wizard
- Roadmap
- Document center
- Application detail
- Officer queue
- Admin knowledge base
- Analytics

Look for:

- Overflow
- Misaligned components
- Broken routes
- Unreadable text
- Missing loading states
- Unresponsive controls
- Inconsistent styling
- Console errors

If browser automation is unavailable, use the available project checks and inspect the code carefully. Do not claim visual browser testing was performed if it was not.

## 12.4 Fix and retest

When an issue is found:

1. Identify its root cause.
2. Correct the implementation.
3. Rerun the relevant check.
4. Confirm that the fix does not break the primary demo journey.

Do not conceal unresolved failures.

---

# 13. IMPLEMENTATION PRIORITIES

Build the application in a sensible order while continuing through to the final result.

## Priority 1: Working application foundation

- Initialize the project.
- Establish the design system.
- Implement the app shell.
- Implement routing.
- Implement role switching.
- Create the mock data layer.
- Establish shared state and persistence.

## Priority 2: Core applicant journey

- Applicant dashboard
- Project creation
- Conversational intake
- Roadmap generation
- Interactive dependency graph
- Approval detail
- Contextual assistant
- Application tracking

## Priority 3: Documents and submission

- Document center
- Simulated DigiLocker
- Simulated OCR
- Validation
- Document reuse
- Pre-submission readiness
- Application submission

## Priority 4: Government workflows

- Officer dashboard
- Application queue
- Document review
- Queries and responses
- SLA monitoring
- Inspection coordination
- Grievance handling

## Priority 5: Regulatory intelligence and administration

- Regulatory updates
- Simulated monitoring
- Knowledge-base review
- Roadmap impact assessment
- Admin dashboard
- Workflow and department management
- Audit logs

## Priority 6: Supporting features

- Incentive discovery
- Incentive preparation
- Compliance and renewals
- Notifications
- Analytics and reports

## Priority 7: Final polish

- Responsive behavior
- Visual refinement
- Empty and error states
- Accessibility
- Consistency checks
- Testing
- Build verification
- Demo readiness

Priorities are implementation guidance, not permission to omit the remaining features. Complete the full prototype within the available environment. If a constraint makes a feature impractical, implement a smaller but functional illustrative version and document the limitation.

---

# 14. WHAT NOT TO BUILD

The following are explicitly outside the scope of this prototype:

- A real FastAPI backend
- A real PostgreSQL database
- Real government portal integrations
- Real government authentication
- Actual DigiLocker authentication or API access
- Real document OCR infrastructure
- Real AI model API integration
- Real web scraping or scheduled crawler infrastructure
- Real SMS, email, or push notification delivery
- Actual government application submission
- Legally binding approval decisions
- Production-grade security or access control
- Real predictive models trained on government application data
- Claims of verified reductions in approval time

Do not waste time implementing infrastructure that cannot be demonstrated in the frontend prototype.

Instead, create clean service boundaries and realistic simulations that make the intended future implementation understandable.

---

# 15. FINAL DELIVERABLES

At the end of the build, provide:

## 15.1 Complete working frontend

A runnable Next.js project with the implemented pages, workflows, components, mock services, seed data, and client-side state.

## 15.2 README

Write a useful README containing:

- Project overview
- Problem statement context
- Prototype scope
- Tech stack
- Prerequisites
- Installation instructions
- Development server command
- Production build command
- Demo entry instructions
- Available roles
- Primary demo storyline
- Mock data explanation
- State persistence and reset behavior
- Architecture overview
- Future FastAPI and PostgreSQL integration plan
- Known limitations

## 15.3 Architecture documentation

Document the intended architecture with:

- Frontend structure
- Mock service layer
- State management
- Main domain entities
- Future FastAPI boundary
- Future PostgreSQL role
- Potential AI and regulatory monitoring services
- Integration adapter concept

Include a simple architecture diagram in the README or a separate Markdown document.

Make it explicit which elements are implemented and which are planned.

## 15.4 Demo guide

Create a concise presentation guide that tells a presenter:

- Which role to select
- Which project to use
- Which actions to perform
- What each action demonstrates
- How to switch between applicant, officer, and administrator views
- How to reset the demo

The guide should follow the end-to-end demo journey in this prompt.

## 15.5 Final implementation report

When the work is complete, report:

- What was implemented
- Main routes and workflows
- Mock services and state strategy
- Tests and checks performed
- Build status
- Any known limitations
- How to run the prototype

Be factual. Do not report a test as passed unless it was actually run and passed.

---

# 16. DEFINITION OF DONE

The prototype is complete only when all of the following are true:

- [ ] The Next.js application starts successfully.
- [ ] The landing page and demo entry work.
- [ ] Applicant, officer, and administrator experiences are accessible.
- [ ] Role switching works.
- [ ] The project intake flow works.
- [ ] The project profile can be created and edited.
- [ ] A mock personalized roadmap is generated.
- [ ] Roadmap dependencies and parallel branches are visible.
- [ ] Approval nodes open useful detail views.
- [ ] The contextual assistant produces relevant mock responses.
- [ ] Documents can be selected or uploaded through the UI.
- [ ] Simulated document extraction and validation work.
- [ ] Document reuse is represented.
- [ ] The readiness check responds to mock data.
- [ ] Application submission updates shared state.
- [ ] Officers can review applications and take actions.
- [ ] Applicant and officer views stay consistent.
- [ ] Notifications reflect simulated events.
- [ ] SLA and delay indicators show explanations.
- [ ] Inspection coordination can be demonstrated.
- [ ] Grievances can be created, tracked, and escalated.
- [ ] Incentive discovery and preparation are functional at prototype level.
- [ ] Compliance and renewal reminders are represented.
- [ ] Regulatory monitoring can be simulated.
- [ ] An administrator can review a mock policy update.
- [ ] Regulatory changes can trigger a proposed roadmap reassessment.
- [ ] Analytics and filters work on mock data.
- [ ] Audit logs show relevant simulated activity.
- [ ] Demo state persists appropriately.
- [ ] The reset action restores the seed scenario.
- [ ] The primary presentation journey can be completed without code changes.
- [ ] No real backend or external credentials are required.
- [ ] Type checking, linting, and production build have been run and their results reported.
- [ ] The README and demo guide are present.

---

# 17. FINAL EXECUTION INSTRUCTIONS

Begin by inspecting the project directory and identifying the available development environment.

Then proceed through the following execution cycle:

1. Establish the application architecture and implementation checklist.
2. Initialize the Next.js project if needed.
3. Build the design system and shared application shell.
4. Implement the mock data model and shared state.
5. Implement all role-specific routes and core workflows.
6. Connect the workflows through shared mock services.
7. Implement the complete demo storyline.
8. Add the remaining supporting features.
9. Refine the visual design and responsive behavior.
10. Run checks and test the main interactions.
11. Fix issues and retest.
12. Write the README, architecture documentation, and demo guide.
13. Provide the final implementation report.

**Do not stop after the planning stage. Do not return only code snippets or instructions. Make the actual changes in the project workspace.**

If the environment requires a decision, choose the simplest maintainable solution that satisfies the requirements. Prioritize a coherent, polished, demonstrable product over unnecessary technical complexity.

**The final objective is a convincing, end-to-end IndusAI frontend prototype for a Smart India Hackathon presentation: a working simulation of an intelligent industrial approvals platform, built with Next.js, powered by realistic mock data, and designed so a real FastAPI and PostgreSQL backend can be integrated later.**