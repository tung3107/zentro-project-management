# Report Feature Architecture

## System Architecture Diagram

```mermaid
graph TB
    subgraph Frontend["Frontend (React + TypeScript)"]
        UI[Report Tab UI]
        ReportService[Report Service]
        UI --> ReportService
    end

    subgraph Backend["Backend (Node.js + Express)"]
        Routes[Report Routes]
        Controller[Report Controller]
        Service[Report Service]
        Routes --> Controller
        Controller --> Service
    end

    subgraph Database["Database (MySQL)"]
        Tasks[(Tasks)]
        Projects[(Projects)]
        Sprints[(Sprints)]
        Members[(Members)]
        Users[(Users)]
        Comments[(Comments)]
        Status[(Project Status)]
    end

    subgraph AI["AI Service"]
        Gemini[Google Gemini API]
    end

    ReportService -->|HTTP Request| Routes
    Controller -->|Response| Routes
    Routes -->|Response| ReportService

    Service -->|Query| Tasks
    Service -->|Query| Projects
    Service -->|Query| Sprints
    Service -->|Query| Members
    Service -->|Query| Users
    Service -->|Query| Comments
    Service -->|Query| Status

    Service -->|Generate Analysis| Gemini
    Gemini -->|AI Insights| Service
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant UI as Report UI
    participant API as Backend API
    participant DB as Database
    participant AI as Gemini AI

    User->>UI: Select filters & click Generate
    UI->>UI: Validate inputs
    UI->>API: POST /reports/generate

    API->>DB: Query tasks with filters
    DB-->>API: Return task data

    API->>DB: Query sprints
    DB-->>API: Return sprint data

    API->>DB: Query members
    DB-->>API: Return member data

    API->>DB: Query comments
    DB-->>API: Return comment data

    API->>API: Calculate statistics

    API->>AI: Send data + prompt
    AI-->>API: Return analysis (Markdown)

    API-->>UI: Return complete report
    UI->>UI: Render stats & AI analysis
    UI-->>User: Display report
```

## Component Structure

```
client/zentro-frontend/
├── src/
│   ├── feature/
│   │   └── admin/
│   │       ├── pages/
│   │       │   └── Report.tsx          ← Main report component
│   │       └── service/
│   │           └── report.service.ts   ← API calls
│   ├── types/
│   │   └── adminTab.ts                 ← Menu configuration (updated)
│   └── App.tsx                         ← Routes (updated)

server/
├── controllers/
│   └── report.controller.js            ← API endpoints
├── services/
│   └── report.service.js               ← Business logic + AI
├── routes/
│   └── report.routes.js                ← Route definitions
└── app.js                              ← Integrated routes
```

## Report Types & Use Cases

```mermaid
graph LR
    A[Report Types] --> B[Project Progress]
    A --> C[Team Performance]
    A --> D[Task Deadline]
    A --> E[General Report]

    B --> B1[Completion Rate]
    B --> B2[Delayed Tasks]
    B --> B3[Sprint Progress]

    C --> C1[Individual Performance]
    C --> C2[Workload Distribution]
    C --> C3[Top Performers]

    D --> D1[Overdue Tasks]
    D --> D2[Upcoming Deadlines]
    D --> D3[Priority Actions]

    E --> E1[Executive Summary]
    E --> E2[Full Overview]
    E --> E3[Recommendations]
```

## Statistics Calculation Flow

```mermaid
graph TD
    A[Raw Data] --> B{Calculate Stats}

    B --> C[Task Stats]
    C --> C1[Total Tasks]
    C --> C2[Completed/Pending/In Progress]
    C --> C3[Overdue Count]

    B --> D[Time Stats]
    D --> D1[Estimate vs Spent]
    D --> D2[Completion %]

    B --> E[Member Stats]
    E --> E1[Tasks per Member]
    E --> E2[Completion Rate]
    E --> E3[Overdue per Member]

    B --> F[Sprint Stats]
    F --> F1[Active Sprints]
    F --> F2[Completed Sprints]

    B --> G[Deadline Stats]
    G --> G1[Overdue List]
    G --> G2[Upcoming Deadlines]

    C1 --> H[Final Stats Object]
    C2 --> H
    C3 --> H
    D1 --> H
    D2 --> H
    E1 --> H
    E2 --> H
    E3 --> H
    F1 --> H
    F2 --> H
    G1 --> H
    G2 --> H

    H --> I[Send to AI for Analysis]
    I --> J[AI Analysis + Stats]
    J --> K[Return to Frontend]
```

## Filter Logic

```mermaid
graph TD
    A[User Filters] --> B{Date Range?}
    B -->|Yes| C[Filter by created_at]
    B -->|No| D[All time]

    C --> E{Project?}
    D --> E

    E -->|Yes| F[Filter by project_id]
    E -->|No| G[All projects user is member of]

    F --> H{User/Member?}
    G --> H

    H -->|Yes| I[Filter by assignee_id/reporter_id]
    H -->|No| J[All members]

    I --> K[Execute Query]
    J --> K

    K --> L[Return Filtered Data]
```

## UI State Management

```mermaid
stateDiagram-v2
    [*] --> Initial: Component Mount
    Initial --> LoadingProjects: Fetch Projects
    LoadingProjects --> Ready: Projects Loaded
    LoadingProjects --> Error: Load Failed

    Ready --> Filtering: User Selects Filters
    Filtering --> LoadingMembers: Project Selected
    LoadingMembers --> Ready: Members Loaded

    Ready --> Generating: Click Generate
    Generating --> ShowingReport: Report Generated
    Generating --> Error: Generation Failed

    ShowingReport --> Ready: Clear Report
    ShowingReport --> Exporting: Click Export
    ShowingReport --> Emailing: Click Email

    Exporting --> ShowingReport: Export Complete
    Emailing --> ShowingReport: Email Sent

    Error --> Ready: Reset
```

## Backend Service Methods

```mermaid
graph TD
    A[Report Service] --> B[generateReport]

    B --> C[collectReportData]
    C --> C1[Query Tasks]
    C --> C2[Query Comments]
    C --> C3[Query Members]
    C --> C4[Query Sprints]

    C1 --> D[formatTask]
    C2 --> E[formatComment]
    C3 --> F[formatMember]
    C4 --> G[formatSprint]

    D --> H[calculateStatistics]
    E --> H
    F --> H
    G --> H

    H --> I[Task Stats]
    H --> J[Member Performance]
    H --> K[Sprint Stats]
    H --> L[Deadline Stats]

    I --> M[buildAIPrompt]
    J --> M
    K --> M
    L --> M

    M --> N[generateAIAnalysis]
    N --> O{AI Success?}

    O -->|Yes| P[Return AI Analysis]
    O -->|No| Q[generateFallbackAnalysis]

    P --> R[Complete Report]
    Q --> R
```

## API Endpoint Structure

```
/api/v1/reports/
├── GET /projects
│   └── Returns: List of projects user is member of
│
├── GET /team-members/:projectId
│   └── Returns: List of team members for project
│
├── POST /generate
│   ├── Body: { reportType, startDate, endDate, projectId?, userId? }
│   └── Returns: { reportType, filters, data, aiAnalysis, generatedAt }
│
├── POST /export-pdf
│   ├── Body: Report data
│   └── Returns: PDF file (placeholder)
│
└── POST /send-email
    ├── Body: { report, recipients }
    └── Returns: Success message (placeholder)
```

## Security & Authentication

```mermaid
graph LR
    A[Client Request] --> B[protectRoute Middleware]
    B --> C{Valid JWT?}
    C -->|Yes| D[Extract User Info]
    C -->|No| E[401 Unauthorized]
    D --> F[Controller Action]
    F --> G[Check Project Access]
    G -->|Member| H[Allow]
    G -->|Not Member| I[403 Forbidden]
    H --> J[Execute Query]
    J --> K[Return Data]
```

---

**Note:** This architecture is designed to be scalable and maintainable, following the existing codebase patterns.
