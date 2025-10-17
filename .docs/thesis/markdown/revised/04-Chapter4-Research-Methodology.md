# CHAPTER 4: RESEARCH METHODOLOGY

This chapter describes the comprehensive research methods employed in developing and evaluating the Event Attendance System for Surigao del Norte State University. The methodology section details the research design, respondent selection, data gathering instruments, implementation process following the Software Development Life Cycle (SDLC), deployment strategies, and evaluation procedures. The systematic approach ensures that the research objectives are addressed rigorously and that the findings are valid, reliable, and applicable to similar educational contexts.

## 4.1 Research Design

This study employs a mixed-methods research design that combines quantitative and qualitative approaches to comprehensively evaluate the Event Attendance System. The research design integrates developmental research (system development) with evaluative research (system assessment) to both create a functional solution and empirically measure its effectiveness.

The system development component follows a combined **Agile and Rapid Application Development (RAD)** methodology within the broader framework of the Software Development Life Cycle (SDLC). This hybrid approach was selected for several compelling reasons:

**Agile Methodology Benefits:**

- Iterative development cycles allow for continuous refinement based on stakeholder feedback
- Flexibility to adapt to changing requirements as understanding of user needs evolves
- Incremental delivery of functional features enables early testing and validation
- Emphasis on collaboration between developers and stakeholders ensures alignment with institutional needs
- Risk mitigation through frequent assessment and adjustment of development priorities

**RAD Methodology Benefits:**

- Rapid prototyping accelerates the feedback loop with end users
- Time-boxed development phases prevent scope creep and maintain project momentum
- Component-based construction enables parallel development of system modules
- User involvement throughout development ensures the final product meets actual needs
- Reduced time from conception to deployment compared to traditional waterfall approaches

### Figure 4: Agile and RAD Methodology Model

**[FIGURE PLACEHOLDER]**

**Figure 4. Combined Agile and RAD Methodology Model for Event Attendance System Development**

_This figure should be recreated as a cyclical flowchart diagram showing the iterative development process with the following elements:_

_Central element: "PLANNING" circle at the top, representing the initial project planning phase where objectives, scope, and resources are defined._

_Surrounding the planning hub, create a circular flow with five connected phases:_

1. **REQUIREMENT GATHERING** (with icon: document/checklist)
   - Stakeholder interviews
   - Survey distribution
   - Current system analysis
   - Pain point identification

2. **DESIGN & PROTOTYPING** (with icon: wireframe/blueprint)
   - UI/UX design
   - System architecture
   - Database schema
   - Prototype creation

3. **DEVELOPMENT** (with icon: code brackets/laptop)
   - Frontend implementation
   - Backend development
   - API integration
   - Database setup

4. **TESTING & USER FEEDBACK** (with icon: checklist/user group)
   - Alpha testing
   - Beta testing with BSCS students
   - Feedback collection
   - Bug identification

5. **DEPLOYMENT & REVIEW** (with icon: rocket/checkmark)
   - System deployment
   - User training
   - Performance monitoring
   - Evaluation

_Show curved arrows connecting each phase in clockwise direction, emphasizing the cyclical nature. Include a "FEEDBACK LOOP" arrow from Testing & User Feedback back to Design & Prototyping, and another from Deployment & Review back to Requirements Gathering, illustrating continuous improvement._

_At the bottom, show "FINAL DEPLOYMENT" as the end goal when all iterations meet acceptance criteria._

_Visual design notes: Use distinct colors for each phase (e.g., blue for requirements, purple for design, green for development, orange for testing, red for deployment). Include small icons representing each phase's activities. Use thicker arrows to emphasize the iterative cycles._

---

The methodology illustrated in Figure 4 represents the systematic approach employed throughout the system development process. This cyclical model ensures that each development phase is informed by previous phases and that continuous stakeholder feedback shapes the evolution of the system.

**Planning Phase** serves as the foundation, establishing project objectives, scope boundaries, resource allocation, timeline milestones, success criteria, and risk management strategies. During this initial phase, the research team conducted preliminary meetings with USC representatives and university administration to align expectations and secure necessary permissions and resources.

The **iterative development cycles** (Requirements → Design → Development → Testing → Deployment) enable continuous refinement and improvement. Unlike traditional waterfall methodologies where each phase is completed sequentially with limited opportunity for revision, the Agile/RAD approach allows the team to revisit earlier phases when new insights emerge from user testing or when requirements evolve based on stakeholder feedback.

**Feedback loops** are integral to the methodology, with formal feedback collection occurring after each testing cycle and informal feedback gathered continuously through stakeholder communication channels. This feedback directly influences subsequent iterations, ensuring that the final system reflects actual user needs rather than initial assumptions.

The research design also incorporates **evaluation research** to assess the system's effectiveness. This evaluation employs:

- **Quantitative methods:** Survey questionnaires with Likert-scale items to measure usability, efficiency, security confidence, and satisfaction. Statistical analysis of survey data includes descriptive statistics (means, standard deviations, frequency distributions) and, where applicable, inferential statistics to identify significant relationships or differences.

- **Qualitative methods:** Structured interviews with USC representatives and event organizers to gather in-depth insights into system impact on their workflows. Open-ended survey questions allowing students to express experiences and suggestions in their own words. Observation of system usage during live events to identify usability issues and user behavior patterns.

- **Mixed-methods integration:** Triangulation of quantitative and qualitative findings to provide comprehensive understanding of system effectiveness. Quantitative data identifies what patterns exist (e.g., 85% of users rate the system as easy to use), while qualitative data explains why those patterns exist (e.g., users appreciate the step-by-step guidance provided).

## 4.2 Research Respondents

The selection of research respondents follows a **purposive sampling** strategy with **phased expansion** to ensure thorough evaluation while managing implementation complexity and risk.

### Phase 1: Pilot Testing with BSCS Students (Current Phase)

The initial pilot testing phase targets Bachelor of Science in Computer Science (BSCS) students across all year levels (1st through 4th year) at Surigao del Norte State University. This population was strategically selected for several reasons:

**Technical Proficiency:** BSCS students possess higher-than-average technical literacy, enabling them to quickly adapt to the new system and provide informed feedback on technical aspects of implementation.

**Constructive Feedback Capability:** Computer science students can offer detailed, actionable feedback on user interface design, system performance, and technical functionality, helping identify issues that general users might not articulate clearly.

**Early Adopter Characteristics:** This population is typically more receptive to technology adoption and less resistant to change, providing an optimal environment for initial testing and refinement.

**Manageable Scale:** The BSCS student population (estimated at [INSERT ACTUAL NUMBER]) provides sufficient diversity for meaningful evaluation while remaining small enough for intensive monitoring and rapid issue resolution.

**Program Relevance:** As future technology professionals, BSCS students have a vested interest in contributing to the development of educational technology solutions and can appreciate the learning opportunity inherent in participating in system evaluation.

### Sampling Framework

The target sample size for Phase 1 evaluation is determined using Slovin's formula to ensure statistical adequacy:

n = N / (1 + Ne²)

Where:

- n = sample size
- N = total population of BSCS students
- e = margin of error (typically 0.05 for 95% confidence level)

**[DATA PLACEHOLDER]**
_After determining the exact BSCS student population from university records:_

- Total BSCS population (N) = [INSERT NUMBER]
- Desired confidence level: 95%
- Margin of error (e) = 0.05
- Calculated minimum sample size (n) = [CALCULATE: N / (1 + N(0.05)²)]
- Target sample size with buffer: [CALCULATE: n × 1.2 to account for non-response]

### Respondent Distribution

The study aims for representative distribution across year levels to capture diverse perspectives:

**[DATA PLACEHOLDER - TO BE COMPLETED DURING DATA COLLECTION]**

- 1st Year BSCS: Target [X] respondents (approximately [Y]% of sample)
- 2nd Year BSCS: Target [X] respondents (approximately [Y]% of sample)
- 3rd Year BSCS: Target [X] respondents (approximately [Y]% of sample)
- 4th Year BSCS: Target [X] respondents (approximately [Y]% of sample)

### Inclusion Criteria

Respondents must meet the following criteria to participate:

- Currently enrolled as a BSCS student at SNSU during the study period
- Attended at least one BSCS or CCIS department event during the semester using the new attendance system
- Voluntarily consented to participate in the evaluation
- Successfully completed the attendance check-in process at least once

### Exclusion Criteria

The following individuals are excluded from the evaluation sample:

- Students who did not use the system (to ensure feedback is based on actual experience)
- Individuals who withdraw participation consent at any time
- Responses with extensive missing data (more than 30% of items unanswered)
- Duplicate submissions (only the first complete response is retained)

### Key Informants for Qualitative Interviews

In addition to the survey respondents, the study includes **key informant interviews** with:

**USC Representatives (n = [3-5])**

- USC President
- USC Event Coordinators
- USC Members responsible for attendance tracking

**University Administrators (n = [2-3])**

- CCIS Dean or Program Chair
- Event management personnel
- IT support staff

**Faculty Advisers (n = [2-3])**

- Thesis adviser
- Panelists with event management experience
- Faculty members who organized events using the system

These key informants provide contextual depth and administrative perspectives that complement student survey data.

### Future Phases (Beyond Current Scope)

While not part of the current evaluation, the research design outlines future expansion phases:

**Phase 2:** Extension to all CCIS programs (Computer Engineering, Information Technology, etc.)

- Estimated population: [INSERT ESTIMATED NUMBER]
- Purpose: Validate findings across broader student population with varying technical backgrounds

**Phase 3:** University-wide deployment for all USC-organized events

- Estimated population: All SNSU students
- Purpose: Assess scalability and effectiveness across diverse academic programs and event types

## 4.3 Research Instruments/Tools

The study employs multiple data collection instruments to gather comprehensive information about system effectiveness and user experiences.

### 4.3.1 Survey Questionnaire for Students

A structured survey questionnaire was developed based on established usability and system evaluation frameworks, including the System Usability Scale (SUS) and Technology Acceptance Model (TAM). The questionnaire consists of four main sections:

**Section A: Respondent Profile** (2 items)

- Year level classification
- Event attendance frequency
- Purpose: Demographic characterization of sample and identification of usage patterns

**Section B: Likert-Scale Evaluation** (16 items across 4 dimensions)

1. **System Usability & User Experience** (4 items)
   - Interface navigation ease
   - Instruction clarity
   - QR scanning functionality
   - Selfie capture process
   - Measured on 5-point Likert scale: 1 = Strongly Disagree to 5 = Strongly Agree

2. **Efficiency & Performance** (4 items)
   - Real-time update speed
   - GPS verification time
   - System responsiveness during peak usage
   - Overall check-in speed
   - Measured on 5-point Likert scale: 1 = Strongly Disagree to 5 = Strongly Agree

3. **Security & Fraud Prevention** (4 items)
   - Confidence in multi-factor verification
   - Data security perception
   - Permission transparency
   - Trust in record integrity
   - Measured on 5-point Likert scale: 1 = Strongly Disagree to 5 = Strongly Agree

4. **Analytics & Reporting Features** (4 items)
   - Dashboard effectiveness for monitoring
   - Report adequacy for documentation
   - Analytics interpretability
   - Mobile browser convenience
   - Measured on 5-point Likert scale: 1 = Strongly Disagree to 5 = Strongly Agree

**Section C: Multiple Choice Questions** (3 items)

- Most challenging attendance step
- Frequency of system errors encountered
- Primary device used for access

**Section D: Open-Ended Questions** (2 items)

- Aspects that worked best and reasons
- Suggested improvements and additional features

The complete questionnaire is included in **Appendix G: Evaluation Instruments**.

### 4.3.2 Interview Guide for Event Organizers

A semi-structured interview guide was developed to gather qualitative insights from USC representatives, event organizers, and administrators. The guide includes open-ended questions covering:

**Current System Challenges** (Questions 1-6)

- Traditional attendance recording methods
- Challenges in manual attendance taking
- Experiences with attendance fraud
- Time required for attendee check-in
- Verification difficulties
- Data management after events

**Technology Adoption and Concerns** (Questions 7-9)

- Openness to mobile app usage
- Concerns about GPS, QR codes, and selfie verification
- Security and privacy considerations

**System Effectiveness Evaluation** (Questions 10-15)

- Biggest difficulties in attendance verification
- Methods for ensuring registered-only attendance
- Impact of automated system on efficiency
- Policy and guideline alignment
- Dispute handling procedures
- Accountability improvements

**Future Improvements** (Questions 16-20)

- Security concerns about digital methods
- Success measurement criteria
- Anticipated adaptation challenges
- Most useful features for organizers
- Design and usability enhancement suggestions

The complete interview guide is included in **Appendix G: Evaluation Instruments**.

### 4.3.3 Observation Protocol

During live event testing, researchers employed a structured observation protocol to document:

- User behavior during check-in process
- Time taken for each verification step
- Frequency and types of errors encountered
- User reactions to system feedback
- Environmental factors affecting performance (lighting, network connectivity, crowding)
- Organizer interactions with monitoring dashboard

Observations were recorded in field notes and supplemented with photographs (when permitted) to document the context of system usage. This observational data provides valuable context for interpreting survey and interview findings.

### 4.3.4 System Log Data

The system automatically generates comprehensive logs that serve as objective data sources:

- Attendance submission logs (timestamps, verification results, error codes)
- Authentication logs (login attempts, session durations, authorization events)
- Performance metrics (response times, page load speeds, API latency)
- Error logs (failure types, frequency, resolution status)
- Usage analytics (feature utilization rates, peak usage times, device/browser distribution)

These system-generated logs provide quantitative data to complement self-reported survey responses, enabling triangulation of findings.

### Validity and Reliability of Instruments

**Content Validity:** The survey questionnaire and interview guide were reviewed by the thesis adviser and panel members to ensure that items adequately cover all dimensions of system evaluation (usability, efficiency, security, analytics).

**Face Validity:** Instruments were pre-tested with a small group of BSCS students (n = [5-10]) who were not part of the main study sample. Feedback from pre-testing was used to clarify ambiguous wording and adjust item difficulty.

**Internal Consistency:** After data collection, Cronbach's alpha coefficient will be calculated for each Likert-scale dimension to assess reliability:

**[DATA PLACEHOLDER - TO BE CALCULATED AFTER DATA COLLECTION]**

- System Usability & User Experience: Cronbach's α = [INSERT VALUE]
- Efficiency & Performance: Cronbach's α = [INSERT VALUE]
- Security & Fraud Prevention: Cronbach's α = [INSERT VALUE]
- Analytics & Reporting: Cronbach's α = [INSERT VALUE]

_Alpha values above 0.70 are generally considered acceptable, above 0.80 good, and above 0.90 excellent._

## 4.4 Research Implementation (SDLC Phases)

The development of the Event Attendance System follows the Software Development Life Cycle (SDLC) with integrated Agile and RAD methodologies, as illustrated in Figure 4. This section details each phase of implementation.

### 4.4.1 Requirement Gathering

The requirement gathering phase began in February 2025 with formal permission requests submitted to the University Student Council (USC) President (see **Appendix A: Letter to Conduct the Study**). This phase involved multiple data collection activities:

**Stakeholder Interviews:**
Structured interviews were conducted with USC representatives to understand their attendance monitoring needs, challenges with existing manual systems, and desired features for an automated solution. Interview sessions were conducted at the USC office on the SNSU main campus and typically lasted 45-60 minutes. Key discussion topics included:

- Current attendance taking procedures and pain points
- Instances of attendance fraud or irregularities
- Time and effort required for manual attendance processing
- Reporting requirements for event documentation
- Security and privacy expectations
- Technical infrastructure available (internet connectivity, device availability)

**Student Surveys:**
Preliminary surveys were distributed to BSCS students to assess their experiences with traditional attendance systems, technology proficiency, device ownership, and willingness to use mobile web-based solutions. Survey findings informed feature prioritization and usability design decisions.

**Observational Study:**
Researchers observed traditional attendance taking at actual university events to document workflows, identify bottlenecks, and understand the environmental context (venue layouts, crowd dynamics, organizer challenges). Observations were conducted during [INSERT NUMBER] events between February and March 2025.

**System Analysis:**
The research team analyzed existing attendance systems at other institutions (through literature review) and evaluated available technologies (QR code libraries, GPS APIs, image upload services) to determine optimal technical solutions.

**Requirements Documentation:**
All gathered requirements were documented and categorized as:

**Functional Requirements:**

- User authentication and authorization (student login, role-based access control)
- Event management (create, edit, delete events; generate QR codes)
- Attendance verification (QR scanning, GPS validation, selfie capture, signature collection)
- Dashboard and reporting (real-time monitoring, analytics visualizations, PDF/CSV export)
- System administration (user management, system configuration, log viewing)

**Non-Functional Requirements:**

- Performance (page load time < 3 seconds, check-in process < 60 seconds per student)
- Scalability (support for events with up to [X] simultaneous users)
- Security (JWT authentication, encrypted data transmission, secure photo storage)
- Usability (mobile-responsive design, intuitive navigation, minimal training required)
- Reliability (99% uptime, automatic error recovery, data backup)
- Compliance (Data Privacy Act compliance, secure handling of biometric data)

These requirements were reviewed and approved by stakeholders before proceeding to the design phase.

### 4.4.2 Design and Prototyping

The design phase focused on translating requirements into visual and architectural representations that guide system development.

**System Architecture Design:**

The researchers developed a comprehensive system architecture diagram (**Figure 3: Low-Level System Design**) illustrating:

- **Client Layer:** Mobile web browsers accessing the Next.js frontend
- **Application Layer:** Next.js server-side rendering, API routes, server actions
- **Service Layer:** Authentication services (JWT), verification services (QR, GPS, photo), notification services
- **Integration Layer:** Third-party APIs (Mapbox for GPS, Cloudinary for photo storage)
- **Data Layer:** PostgreSQL database with Prisma ORM, structured into User, Event, Attendance, and Analytics schemas
- **Security Layer:** Authentication middleware, authorization checks, rate limiting, input validation

**Database Schema Design:**

Entity-Relationship Diagrams (ERDs) were created to define:

- User table (student profiles, credentials, roles)
- Event table (event details, organizers, venues, QR codes)
- Attendance table (check-in records, verification data, timestamps, photos)
- SecurityLog table (audit trails, access logs)
- ExportRecord table (report generation history)

Relationships between entities ensure referential integrity and enable efficient querying for analytics.

**Use Case Modeling:**

**Figure 2: Use Case Diagram** illustrates the interactions between system actors and functionalities:

**Actors:**

- Student: Scans QR, submits attendance, views personal history
- Moderator/Organizer: Creates events, monitors attendance, generates reports
- Administrator: Manages users, configures system, views security logs
- System: Automated processes (QR generation, verification, notifications)

**Use cases** depict specific interactions such as "Student scans event QR code," "System validates GPS location," "Moderator exports attendance report," providing clear understanding of system functionality from user perspective.

**User Interface Prototyping:**

Low-fidelity wireframes were created for all major interfaces:

- Student registration and login screens
- Event listing and details pages
- QR code scanning interface with camera integration
- Selfie capture screen with event background overlay
- Signature pad interface
- Attendance confirmation screen
- Organizer dashboard with analytics visualizations
- Event creation and management forms
- Report generation and export interfaces

Wireframes were developed using [INSERT TOOL: Figma/Adobe XD/Sketch] and iteratively refined based on feedback from the thesis adviser and preliminary user reviews.

High-fidelity mockups incorporating Tailwind CSS styling and shadcn/ui components were then created to demonstrate the final visual appearance. These mockups established the color scheme, typography, iconography, layout grid, and responsive breakpoints for mobile and desktop views.

**Workflow Mapping:**

Flowcharts documented the step-by-step processes for critical user journeys:

- Student attendance submission workflow (QR scan → permission prompts → location verification → photo capture → signature → submission → confirmation)
- Event creation workflow (organizer login → event details entry → venue selection → QR generation → event publication)
- Report generation workflow (filter selection → data aggregation → format selection → export)

**Prototyping and User Testing:**

Interactive prototypes were developed using Next.js to allow stakeholders to experience the system before full implementation. Prototype testing sessions with USC representatives and selected BSCS students identified usability issues, confusing navigation patterns, unclear instructions, and missing features. Feedback from prototype testing directly influenced design refinements before proceeding to full development.

### 4.4.3 Development

The development phase involved coding the system according to the approved designs and requirements. Development was organized into sprint cycles, with each sprint delivering functional increments.

**Technology Stack:**

- **Frontend:** Next.js 15 with App Router, React Server Components, TypeScript (strict mode)
- **Styling:** Tailwind CSS 4, shadcn/ui components, custom utility classes
- **Backend:** Next.js API routes and server actions for business logic
- **Database:** PostgreSQL managed via Prisma ORM, with type-safe queries
- **Authentication:** JWT-based authentication with secure token handling
- **File Storage:** Cloudinary for image uploads (selfies, event backgrounds)
- **Geolocation:** Mapbox API for GPS coordinates and map visualization
- **QR Codes:** `qrcode` library for generation, browser-based scanning
- **Deployment:** [INSERT PLATFORM: Vercel/Render/Railway] for hosting
- **Version Control:** Git with GitHub for code repository and collaboration

**Development Sprints:**

**Sprint 1: Core Infrastructure (Weeks 1-2)**

- Project initialization and configuration
- Database schema implementation in Prisma
- Authentication system (registration, login, JWT generation and validation)
- Basic routing structure and layout components
- User role management and authorization middleware

**Sprint 2: Event Management (Weeks 3-4)**

- Event creation interface for organizers
- Event listing and detail pages
- QR code generation for events
- Event editing and deletion functionality
- Database operations for event CRUD operations

**Sprint 3: Attendance Submission (Weeks 5-7)**

- QR code scanning interface using device camera
- GPS location capture and validation against event venue
- Selfie capture interface with camera integration
- Image upload to Cloudinary with progress indicators
- Digital signature pad implementation
- Attendance record creation and storage
- Submission confirmation and feedback

**Sprint 4: Dashboard and Analytics (Weeks 8-9)**

- Real-time attendance monitoring dashboard
- Data aggregation queries for analytics
- Visualization components (charts, graphs, statistics)
- Attendance trend analysis
- Event comparison features

**Sprint 5: Reporting and Export (Week 10)**

- PDF report generation with student photos
- CSV export functionality
- Report customization and filtering options
- Batch operations for multiple events

**Sprint 6: Security and Optimization (Week 11)**

- Rate limiting implementation (Upstash Redis)
- Input validation and sanitization
- Error handling and logging
- Performance optimization (code splitting, lazy loading, image optimization)
- Security audit and vulnerability assessment

**Sprint 7: Testing and Bug Fixes (Week 12)**

- Unit testing critical functions
- Integration testing API endpoints
- Browser compatibility testing
- Mobile device testing across various screen sizes
- Bug identification and resolution
- User acceptance testing preparation

**Development Practices:**

- **Code Reviews:** All code changes reviewed by at least one team member before merging
- **Version Control:** Git branching strategy (feature branches, development branch, main branch)
- **Documentation:** Inline code comments, README files, API documentation
- **Continuous Integration:** Automated builds and basic testing on each commit
- **Pair Programming:** Complex features developed collaboratively to improve code quality and knowledge sharing

### 4.4.4 Testing and User Feedback

Testing occurred throughout development (unit testing during sprints) and as a dedicated phase before deployment.

**Alpha Testing (Internal):**

The development team conducted comprehensive internal testing including:

- **Functional Testing:** Verification that all features work as specified (QR scanning, GPS validation, photo uploads, report generation)
- **Usability Testing:** Evaluation of interface intuitiveness, navigation flow, error message clarity
- **Performance Testing:** Load testing to assess system behavior under various user volumes, response time measurement under normal and peak conditions
- **Security Testing:** Attempted authentication bypass, SQL injection tests, Cross-Site Scripting (XSS) vulnerability checks, unauthorized access attempts
- **Compatibility Testing:** Testing across browsers (Chrome, Safari, Firefox, Edge) and devices (various Android and iOS smartphones, tablets)

Issues identified during alpha testing were logged in the issue tracking system and prioritized for resolution before beta testing.

**Beta Testing (External with BSCS Students):**

Following alpha testing and issue resolution, beta testing was conducted with actual BSCS students at live university events. Beta testing objectives included:

- Validating system functionality in real-world conditions (actual event venues, real network conditions, diverse user devices)
- Gathering user feedback on usability and experience
- Identifying edge cases and scenarios not anticipated in development
- Assessing system performance under actual usage loads
- Measuring check-in times and completion rates

**Beta Testing Procedure:**

1. **Event Selection:** [INSERT NUMBER] BSCS/CCIS events were designated as beta testing venues between [MONTH YEAR] and [MONTH YEAR]
2. **Participant Briefing:** Brief orientation provided to students before first use, emphasizing the pilot nature and encouraging feedback
3. **Monitored Usage:** Research team members observed check-in processes, noted issues, and provided immediate support for technical difficulties
4. **Feedback Collection:** Post-event surveys distributed to beta test participants to gather immediate reactions and suggestions
5. **Issue Resolution:** Bugs and usability issues identified during beta testing addressed in subsequent development sprints
6. **Iterative Refinement:** System improvements deployed and tested in subsequent events, with changes documented

**Feedback Incorporation:**

User feedback from beta testing directly influenced system refinements:

**Example improvements based on beta feedback:**

- **[INSERT ACTUAL FEEDBACK-DRIVEN CHANGES, SUCH AS:]**
  - Increased button size for easier touch target interaction on small screens
  - Added progress indicators during photo upload to reduce user anxiety
  - Simplified permission request prompts for location and camera access
  - Implemented retry mechanisms for failed uploads due to network instability
  - Enhanced error messages to provide clearer guidance on issue resolution
  - Adjusted GPS tolerance radius based on venue-specific accuracy limitations

This iterative feedback-refinement cycle continued until system performance and usability reached acceptable levels for full deployment.

## 4.5 Research Deployment (System Testing, User Acceptance)

The deployment phase transitions the system from development/testing environments to production use, following a phased rollout strategy to manage risk and ensure quality.

### Deployment Infrastructure

The system is deployed on [INSERT PLATFORM: Vercel/Render/Railway] with the following configuration:

- **Production URL:** [INSERT URL]
- **Database:** PostgreSQL hosted on [INSERT PROVIDER: Neon/Supabase/Railway]
- **File Storage:** Cloudinary account configured for SNSU usage
- **Monitoring:** [INSERT TOOLS: Sentry for error tracking, Vercel Analytics for usage metrics]
- **Backup:** Automated daily database backups with [X]-day retention

### Phase 1: Pilot Deployment (BSCS Students)

**Preparation:**

- Final security audit and penetration testing
- Load testing to confirm system can handle expected concurrent users
- Preparation of user documentation (quick start guides, FAQs, troubleshooting tips)
- Training session for USC representatives on event management interface

**Rollout:**
On [INSERT DATE], the system was officially launched for BSCS events with the following steps:

1. **Announcement:** Email and poster campaign informing BSCS students of the new system
2. **Orientation:** Brief in-class presentations explaining how to use the system
3. **Support:** Dedicated support channel (e.g., Facebook group, email) for technical questions
4. **Monitoring:** Intensive monitoring during first week to quickly identify and resolve issues

**User Acceptance Testing (UAT):**

User Acceptance Testing evaluates whether the system meets stakeholder requirements and is ready for broader deployment. UAT criteria include:

**Functional Acceptance:**

- All specified features are present and functional
- Verification steps complete successfully at acceptable rates (target: >95% completion rate)
- Reports generate accurately with correct data
- No critical bugs remain unresolved

**Performance Acceptance:**

- Average check-in time: < 60 seconds per student
- Page load times: < 3 seconds on typical mobile connections
- System uptime: > 99% during event periods
- Concurrent user capacity: Handles [X] simultaneous check-ins without degradation

**Usability Acceptance:**

- Average System Usability Scale (SUS) score: > 70 (above average usability)
- User satisfaction ratings: Mean ≥ 4.0 on 5-point scale
- Task completion rate without assistance: > 80%
- Critical error frequency: < 5% of attempts

**Security Acceptance:**

- No security vulnerabilities identified in final audit
- Data encryption in transit (HTTPS) and at rest
- Authentication bypass attempts fail
- Unauthorized access prevented

UAT results inform the decision to proceed with broader deployment phases or to conduct additional refinement iterations.

### Post-Deployment Monitoring

Following deployment, continuous monitoring ensures system stability and performance:

- **Real-Time Monitoring:** Dashboard tracking active users, check-in rates, error frequencies, server resource utilization
- **Error Tracking:** Automated alerts for critical errors, weekly error log reviews
- **Performance Monitoring:** Response time tracking, database query performance analysis
- **Usage Analytics:** Feature utilization rates, user retention, peak usage patterns
- **Feedback Collection:** Ongoing support ticket analysis, periodic pulse surveys

## 4.6 Research Evaluation

The evaluation phase assesses the effectiveness of the Event Attendance System in achieving its objectives and addresses the research questions posed in Chapter 1.

### Evaluation Design

The evaluation employs a **convergent parallel mixed-methods design**, where quantitative and qualitative data are collected simultaneously, analyzed separately, and then integrated to provide comprehensive understanding of system effectiveness.

**Quantitative Evaluation Component:**

**Data Collection:**
Survey questionnaires distributed to all BSCS students who used the system during the pilot phase. Distribution methods include:

- Digital surveys via Google Forms/Microsoft Forms sent via email
- QR codes posted in CCIS classrooms linking to the survey
- In-class survey completion during designated period
- Follow-up reminders to maximize response rate

**Target Response Rate:** Minimum 70% of eligible participants

**Data Analysis:**
Quantitative survey data are analyzed using statistical software [INSERT: SPSS/R/Python pandas]:

1. **Descriptive Statistics:**
   - Frequency distributions for demographic variables and multiple-choice items
   - Measures of central tendency (mean, median) and dispersion (standard deviation, range) for Likert-scale items
   - Percentage calculations for categorical variables

2. **Reliability Analysis:**
   - Cronbach's alpha for internal consistency of Likert-scale dimensions
   - Item-total correlations to identify problematic items

3. **Comparative Analysis:**
   - Comparison of mean ratings across evaluation dimensions (usability, efficiency, security, analytics)
   - Identification of highest and lowest rated features

4. **Inferential Statistics** (if applicable):
   - Independent samples t-tests to compare ratings across year levels or other groups
   - ANOVA to test for significant differences across multiple groups
   - Correlation analysis to examine relationships between variables (e.g., frequency of use and satisfaction)

**Interpretation Guidelines:**
For Likert-scale items (1-5 scale):

- Mean 1.00-1.80: Strongly Disagree/Very Poor
- Mean 1.81-2.60: Disagree/Poor
- Mean 2.61-3.40: Neutral/Moderate
- Mean 3.41-4.20: Agree/Good
- Mean 4.21-5.00: Strongly Agree/Excellent

**Qualitative Evaluation Component:**

**Data Collection:**

- Open-ended survey questions provide written feedback
- Semi-structured interviews with USC representatives (n = [3-5]), administrators (n = [2-3]), and faculty (n = [2-3])
- Observation field notes from live event monitoring

**Data Analysis:**
Qualitative data are analyzed using thematic analysis procedures:

1. **Data Familiarization:** Reading and re-reading transcripts and responses to gain comprehensive understanding
2. **Initial Coding:** Identifying interesting features and assigning preliminary codes to text segments
3. **Theme Development:** Grouping codes into potential themes representing patterns in the data
4. **Theme Review:** Refining themes to ensure they accurately represent coded data
5. **Theme Naming:** Defining clear, concise names for each theme
6. **Report Generation:** Selecting compelling excerpts to illustrate each theme

**Mixed-Methods Integration:**

The integration of quantitative and qualitative findings occurs through:

**Convergence:** Identifying areas where quantitative ratings and qualitative feedback align (e.g., high usability ratings + positive comments about ease of use)

**Expansion:** Using qualitative data to explain or elaborate on quantitative patterns (e.g., why certain features received lower ratings)

**Divergence:** Examining discrepancies between quantitative and qualitative findings to gain deeper insights

### Evaluation Metrics and Success Criteria

The evaluation assesses whether the system achieves its intended objectives:

**Objective 1: Event Attendance Management System**

- **Metric:** System completeness (percentage of planned features implemented and functional)
- **Success Criterion:** 100% of core features functional
- **Metric:** Accessibility (system loads successfully on various devices/browsers)
- **Success Criterion:** >95% compatibility rate

**Objective 2: QR Code-Based Attendance Tracking**

- **Metric:** QR scan success rate
- **Success Criterion:** >90% successful scans on first attempt
- **Metric:** User rating of QR scanning process (Likert item)
- **Success Criterion:** Mean ≥ 4.0

**Objective 3: Location-Based and Visual Verification**

- **Metric:** GPS verification success rate
- **Success Criterion:** >85% successful location validations
- **Metric:** Selfie capture success rate
- **Success Criterion:** >90% successful submissions
- **Metric:** Fraud prevention confidence (Likert item)
- **Success Criterion:** Mean ≥ 4.0

**Objective 4: Automated Reporting and Analytics**

- **Metric:** Report accuracy (comparison of system reports to manual counts)
- **Success Criterion:** >98% accuracy
- **Metric:** Time saved compared to manual processing
- **Success Criterion:** >70% reduction in processing time
- **Metric:** Analytics usefulness rating (Likert item)
- **Success Criterion:** Mean ≥ 3.8

**Overall System Effectiveness:**

- **Metric:** System Usability Scale (SUS) score
- **Success Criterion:** Mean SUS score >70 (above average)
- **Metric:** Net Promoter Score (NPS) - likelihood to recommend
- **Success Criterion:** NPS >0 (more promoters than detractors)
- **Metric:** User satisfaction
- **Success Criterion:** Mean overall satisfaction ≥ 4.0

### Ethical Considerations

The research adheres to ethical principles for human subjects research:

**Informed Consent:** All participants receive clear information about the study purpose, procedures, risks, benefits, and their right to withdraw. Consent forms are obtained before data collection (see consent form in Appendix G).

**Voluntary Participation:** Participation in evaluation surveys and interviews is voluntary. Non-participation does not affect students' academic standing or access to university services.

**Confidentiality:** Survey responses are anonymized. Interview recordings are stored securely and accessible only to research team members. Personally identifiable information is separated from evaluation data.

**Data Privacy Compliance:** The system and research procedures comply with the Data Privacy Act of 2012 (Republic Act No. 10173). Students' personal information, photos, and location data are collected only with explicit consent and used solely for attendance verification purposes.

**Beneficence:** The research aims to benefit the university community by improving attendance tracking. Risks to participants are minimal and primarily involve time commitment for surveys/interviews.

**Institutional Approval:** Necessary permissions were obtained from university administration (see Appendix A, B, D) and the University Student Council before proceeding with research activities.

### Timeline of Research Activities

**[SUMMARY TABLE OF RESEARCH TIMELINE]**

| Phase                     | Activities                                                      | Duration | Period         |
| ------------------------- | --------------------------------------------------------------- | -------- | -------------- |
| Planning & Preparation    | Literature review, proposal development, permission acquisition | 4 weeks  | Jan - Feb 2025 |
| Requirement Gathering     | Stakeholder interviews, surveys, observation                    | 4 weeks  | Feb - Mar 2025 |
| Design & Prototyping      | Architecture design, UI/UX design, prototype development        | 4 weeks  | Mar 2025       |
| Development (Sprints 1-7) | Coding, internal testing, refinement                            | 12 weeks | Mar - Jun 2025 |
| Beta Testing              | Live event testing with BSCS students                           | 4 weeks  | [Month] 2025   |
| Deployment & Evaluation   | Full pilot rollout, data collection, analysis                   | 6 weeks  | [Month] 2025   |
| Reporting & Defense       | Results analysis, thesis writing, final defense                 | 4 weeks  | May 2025       |

_Note: Actual timeline may be adjusted based on institutional calendar and technical considerations._

This comprehensive methodology ensures that the Event Attendance System is developed systematically, tested rigorously, and evaluated thoroughly to provide valid, reliable evidence of its effectiveness in addressing the identified problem and achieving the research objectives.
