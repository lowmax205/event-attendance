# CHAPTER 6: CONCLUSION AND RECOMMENDATIONS

**[IMPORTANT NOTE TO RESEARCHERS]**

_This chapter synthesizes the findings from Chapter 5 and provides conclusions about the research objectives and recommendations for future work. Since your data collection and analysis may still be ongoing, this document provides a structured template with guidance marked by **[GUIDANCE]** where you must insert content based on your actual findings._

_Instructions for completing this chapter:_
_1. Review all findings from Chapter 5 before writing conclusions_
_2. Ensure conclusions directly address each research objective_
_3. Base recommendations on actual limitations and gaps identified in your study_
_4. Be specific and actionable in your recommendations_
_5. Maintain academic tone while being clear and concise_

This chapter presents the conclusions drawn from the development and evaluation of the Event Attendance System for Surigao del Norte State University. The conclusions are organized according to the research objectives established in Chapter 1, synthesizing the key findings from the system evaluation presented in Chapter 5. Following the conclusions, the chapter offers recommendations for system improvements, broader implementation, and future research directions that build upon this study's contributions.

## 6.1 Conclusion

Based on the comprehensive evaluation of the Event Attendance System conducted with Bachelor of Science in Computer Science (BSCS) students during the pilot implementation phase, the researchers draw the following conclusions aligned with the research objectives:

### General Objective

**[GUIDANCE: Write 1-2 paragraphs concluding whether the general objective was achieved]**

_Template:_

The study successfully achieved its general objective of developing and evaluating a comprehensive mobile web-based event attendance monitoring system with integrated analytics that improves the accuracy, security, and convenience of tracking event attendance at Surigao del Norte State University. The system, which utilizes multi-factor verification through GPS tracking, QR code scanning, and selfie authentication, demonstrated **[summarize overall effectiveness based on Chapter 5 results]**.

The evaluation results with **[N]** BSCS student participants revealed **[overall mean ratings/satisfaction levels/achievement of success criteria]**, indicating that the system **[successfully/partially/met with challenges]** provides a secure and reliable mechanism for recording attendance at school events while offering real-time analytics and automated reporting capabilities. The integration of these technologies addressed the core problems of **[list main problems solved based on findings]**.

### Specific Objective 1: Event Attendance Management System

**[GUIDANCE: Conclude on the development and effectiveness of the core event management system]**

_Address:_
_- Was the full-stack system using Next.js and TypeScript successfully developed?_
_- Did JWT authentication effectively secure event data and student information?_
_- Was the responsive web interface accessible and functional across devices?_

_Template:_

The research successfully developed a comprehensive event attendance management system using Next.js 15 with TypeScript for full-stack development, creating a unified codebase for both client-side and server-side functionality. The system's JWT-based authentication mechanism **[describe effectiveness based on security findings]**, successfully securing event data and student information while providing **[describe user experience]**. The responsive web-based interface, accessible via mobile browsers, achieved **[usability ratings from Table 5]**, confirming that **[conclusion about accessibility and cross-device compatibility]**. The system's architecture **[met/exceeded/partially met]** the functional requirements established during the requirements gathering phase, providing **[list key features successfully implemented]**.

### Specific Objective 2: QR Code-Based Attendance Tracking

**[GUIDANCE: Conclude on QR code generation, encryption, and scanning effectiveness]**

_Address:_
_- Were unique QR codes successfully generated for each event?_
_- Did encryption prevent unauthorized access or tampering?_
_- How effective was the QR scanning process based on user feedback?_

_Template:_

The QR code-based attendance tracking component achieved its objectives by generating unique, encrypted QR codes for each event that contained event-specific information and security tokens. The QR code scanning process received **[mean rating from Q5]**, indicating that students found it **[interpretation]**. System logs revealed a QR scan success rate of **[X]**%, with **[description of any challenges from Chapter 5]**. The time-bound QR code validity mechanism successfully prevented **[describe fraud prevention outcomes]**. Overall, the QR code implementation provided **[conclude on effectiveness as an initiation method for attendance submission]**.

### Specific Objective 3: Location-Based and Visual Verification Features

**[GUIDANCE: Conclude on GPS tracking and selfie verification effectiveness]**

_Address:_
_- How effectively did GPS tracking verify physical presence?_
_- What was the success rate and user acceptance of selfie verification?_
_- Did multi-factor verification achieve its fraud prevention goals?_

_Template:_

The integration of location-based and visual verification features successfully addressed the critical challenge of preventing proxy attendance and ensuring students' physical presence at events. GPS location tracking achieved a verification success rate of **[X]**%, with **[description of accuracy and limitations based on findings]**. The selfie verification feature with event-specific backgrounds received **[mean rating from Q6]**, and the multi-factor approach (QR + GPS + selfie) generated **[level]** confidence in fraud prevention among students (M = **[rating from Q11]**). **[Number/percentage]** of respondents agreed that the combined verification methods effectively prevented proxy attendance, validating the biometric authentication model's application to this context. However, **[mention any limitations from environmental factors, GPS accuracy, lighting conditions]**.

### Specific Objective 4: Automated Reporting and Data Analytics

**[GUIDANCE: Conclude on analytics dashboards, report generation, and system logs]**

_Address:_
_- Did real-time monitoring provide useful insights to organizers?_
_- Were generated reports adequate for documentation needs?_
_- Was the analytics dashboard intuitive and valuable?_

_Template:_

The automated reporting and data analytics capabilities successfully reduced administrative burden and provided actionable insights for event management. Real-time attendance updates received **[mean rating from Q7 and Q15]**, with event organizers reporting that **[summarize organizer feedback from interviews]**. The automated generation of attendance reports in PDF and CSV formats with student verification photos achieved **[rating from Q16]** and met **[describe whether reports met institutional requirements]**. The integrated analytics dashboard displaying attendance trends, peak check-in times, and participation patterns was rated as **[interpretation of Q17]**. System logs effectively tracked **[describe what was logged and its utility]**. The automation features reduced post-event processing time by an estimated **[X]**% compared to manual methods, representing significant efficiency gains **[based on Table 9 comparative analysis]**.

### Overall System Effectiveness

**[GUIDANCE: Provide overarching conclusion about whether the system solved the identified problems]**

_Template:_

In addressing the central research problem—that conventional methods of monitoring attendance at school events are unreliable, error-prone, and easily manipulated—the Event Attendance System demonstrated substantial improvements across multiple dimensions:

1. **Reliability:** The system achieved **[uptime percentage]** uptime during the evaluation period, with a completion rate of **[X]**% for attendance submissions, significantly improving upon the **[describe manual system reliability issues]**.

2. **Accuracy:** Multi-factor verification reduced the potential for attendance fraud by **[describe evidence of fraud prevention]**. Event organizers reported **[quote or paraphrase organizer assessment of accuracy]**.

3. **Efficiency:** Average check-in time of **[X]** seconds per student represents a **[X]**% **[improvement/change]** compared to estimated manual processing times of **[X]** seconds, **[meeting/not meeting]** the established target of less than 60 seconds per student.

4. **Security:** Student confidence in data security and fraud prevention (M = **[overall security mean]**) indicates **[interpretation]**, supporting the system's security architecture and authentication mechanisms.

5. **Usability:** Overall usability ratings (M = **[overall usability mean]**) confirm that the system's Human-Computer Interaction design successfully created an intuitive, learnable interface requiring minimal training.

6. **Accessibility:** The mobile web-based approach received **[rating for browser convenience from Q18]**, validating the decision to avoid native app requirements and leverage existing student devices.

The theoretical frameworks of Human-Computer Interaction (Nielsen, 1993), Biometric Authentication Models (Jain et al., 2004), and Cloud Computing Models (Mell & Grance, 2011) were appropriately applied and supported by the empirical findings. The system demonstrated how integrating these frameworks creates a comprehensive solution that balances usability, security, and scalability.

### Contributions to Knowledge and Practice

This research makes several notable contributions:

**Methodological Contribution:** The study demonstrates the effectiveness of combining Agile and RAD methodologies for developing educational technology systems, showing that iterative development with continuous stakeholder feedback produces systems that align closely with user needs.

**Technological Contribution:** The research establishes that mobile web-based multi-factor verification (QR + GPS + selfie) provides an accessible, cost-effective alternative to expensive RFID or specialized biometric hardware while maintaining high security and fraud prevention.

**Empirical Contribution:** The study provides quantitative and qualitative evidence of system effectiveness in a real educational setting, filling a gap in the literature regarding comprehensive event attendance systems that integrate multiple verification methods.

**Practical Contribution:** The implemented system offers a replicable model for other educational institutions seeking to modernize their attendance tracking infrastructure without prohibitive costs or complex hardware requirements.

## 6.2 Recommendations

Based on the findings, conclusions, and limitations identified during this research, the following recommendations are offered for system improvements, broader implementation, future research, and institutional policy.

### 6.2.1 Recommendations for System Improvements

**[GUIDANCE: Base these recommendations on actual issues, lower-rated features, or user suggestions from Chapter 5]**

**Recommendation 1: Enhanced Offline Functionality**

_If network connectivity was identified as a challenge:_

Based on **[findings about network issues]**, the system should implement offline capability that allows students to complete the check-in process even with intermittent connectivity, temporarily storing submissions locally and synchronizing when connection is restored. This would address the **[X]**% of respondents who **[describe network-related challenges]**.

**Implementation approach:** Utilize Progressive Web App (PWA) technology with service workers to cache critical assets and enable offline data collection, then queue submissions for upload when connectivity returns.

**Recommendation 2: Improved GPS Tolerance for Indoor Venues**

_If GPS accuracy was problematic indoors:_

Given the **[findings about GPS challenges]**, the system should implement adaptive geofencing that automatically adjusts location tolerance based on venue type (indoor vs. outdoor) and allows manual verification by organizers when GPS signals are unreliable.

**Implementation approach:** Create venue profiles with building-specific parameters, implement backup verification methods (e.g., event-specific codes), and provide organizers with manual override capabilities for legitimate cases.

**Recommendation 3: Enhanced Selfie Verification Guidance**

_If photo quality issues were reported:_

To address the **[describe selfie-related issues]**, improve the camera interface with real-time quality feedback (lighting indicators, face detection overlays, composition guides) and automatic image enhancement (brightness adjustment, contrast optimization).

**Implementation approach:** Integrate computer vision libraries to assess photo quality before submission, provide visual feedback to help users capture better images, and implement automatic image enhancement algorithms.

**Recommendation 4: Streamlined Multi-Step Process**

_If certain steps were identified as challenging:_

Since **[X]**% of respondents found **[specific step]** most challenging, simplify this step by **[specific improvement]**. Consider reducing the number of permission prompts through pre-authorization during initial setup or combining steps where possible.

**Implementation approach:** Implement one-time permission requests during account setup, provide clear explanations of why each permission is needed, and store preferences to avoid repeated prompts.

**Recommendation 5: Enhanced Analytics Customization**

_If organizers requested more analytics features:_

Expand the analytics dashboard to include **[list specific features requested or needed]** such as comparative analysis across multiple events, exportable visualization images for presentations, customizable date ranges, and predictive analytics for future event planning.

**Implementation approach:** Develop modular analytics widgets that organizers can customize, add data export functionality for charts and graphs, and implement machine learning models to predict attendance patterns based on historical data.

**Recommendation 6: Multilingual Support**

_For broader accessibility:_

Implement multilingual support starting with **[local languages]** to ensure accessibility for all student populations, including those for whom English is not a primary language.

**Implementation approach:** Implement internationalization (i18n) framework, translate all interface text and error messages, and allow users to select their preferred language in account settings.

### 6.2.2 Recommendations for Broader Implementation

**Recommendation 1: Phased Expansion Strategy**

Following successful pilot testing with BSCS students, implement the system across the university using the planned phased approach:

**Phase 2 (Semester [INSERT]):** Expand to all College of Computing and Information Sciences (CCIS) programs including Computer Engineering, Information Technology, and Information Systems. Monitor performance under increased load and gather feedback from more diverse technical skill levels.

**Phase 3 (Semester [INSERT]):** Deploy university-wide for all University Student Council (USC) organized events across all colleges and programs. Ensure infrastructure scaling can accommodate thousands of simultaneous users during major university events.

**Phase 4 (Future):** Consider extending to classroom attendance tracking if evaluation results support broader application beyond events.

**Recommendation 2: Comprehensive Training Program**

Develop and implement a structured training program for different user groups:

**For Students:** Brief video tutorials (2-3 minutes) embedded in the system demonstrating the check-in process, accessible via QR codes posted at event venues or shared in orientation programs.

**For Event Organizers:** Hands-on training sessions (30-45 minutes) covering event creation, QR code generation, real-time monitoring, issue resolution, and report generation.

**For Administrators:** Technical training (2-3 hours) on system administration, user management, security monitoring, data export, and troubleshooting.

**Recommendation 3: Dedicated Support Infrastructure**

Establish a support system to assist users and maintain system quality:

- Create a dedicated support email (e.g., <attendance-support@snsu.edu.ph>) and/or chatbot
- Develop comprehensive FAQ documentation addressing common issues
- Assign technical support personnel during major events to provide immediate assistance
- Implement in-system help features and tooltips for guidance

**Recommendation 4: Integration with Institutional Systems**

Pursue integration opportunities with other university systems:

- Student Information System (SIS): Sync student profiles and enrollment data
- Learning Management System (LMS): Link event attendance to academic records where applicable
- University ID Card System: Explore integration with campus ID for additional verification
- Institutional Reporting Systems: Export attendance data to administrative dashboards

**Recommendation 5: Regular Performance Monitoring and Optimization**

Implement ongoing monitoring and continuous improvement processes:

- Conduct quarterly performance reviews analyzing system logs, error rates, and user satisfaction
- Schedule annual major evaluations similar to the pilot study to track long-term effectiveness
- Establish a feedback collection mechanism (e.g., in-app rating system, suggestion box)
- Prioritize and implement the most-requested features in regular update cycles

### 6.2.3 Recommendations for Future Research

**Research Recommendation 1: Longitudinal Study**

Conduct a longitudinal study over multiple semesters to assess:

- Long-term user adoption and sustained satisfaction rates
- Evolution of attendance fraud patterns and system's continued effectiveness
- Impact on student engagement and event participation rates over time
- System reliability and performance stability across diverse event types and scales

**Research Recommendation 2: Comparative Effectiveness Study**

Perform a comparative study evaluating this system against alternative approaches:

- Compare with RFID-based systems in terms of cost, accuracy, and user acceptance
- Evaluate against facial recognition-based systems for automated verification
- Assess trade-offs between different verification factor combinations (which factors are most critical?)

**Research Recommendation 3: Advanced Facial Recognition Integration**

Investigate the feasibility and acceptance of integrating automated facial recognition technology:

- Assess accuracy improvements of ML-based face recognition vs. manual photo review
- Evaluate privacy concerns and ethical implications among students and administrators
- Analyze cost-benefit ratio of implementing sophisticated biometric verification
- Determine acceptable balance between security and privacy for educational contexts

**Research Recommendation 4: Predictive Analytics for Student Engagement**

Develop and validate predictive models using attendance data:

- Identify patterns correlating event attendance with academic performance
- Predict student engagement levels based on attendance trends
- Develop early intervention systems for students showing declining participation
- Explore machine learning applications for personalized event recommendations

**Research Recommendation 5: Cross-Institutional Adaptation Study**

Collaborate with other universities to assess system adaptability:

- Test the system in different institutional contexts (public vs. private, large vs. small universities)
- Identify context-specific customization requirements
- Develop a generalized framework for adapting the system to diverse institutional needs
- Create a repository of best practices for attendance system implementation

**Research Recommendation 6: Mobile Application Development**

Investigate whether a native mobile application would provide benefits over the mobile web approach:

- Compare user experience between web app and native apps (iOS/Android)
- Assess whether offline functionality justifies development and maintenance costs
- Evaluate push notification effectiveness for event reminders
- Analyze app installation barriers vs. browser accessibility trade-offs

**Research Recommendation 7: Blockchain for Immutable Attendance Records**

Explore blockchain technology for creating tamper-proof attendance ledgers:

- Assess feasibility of recording attendance on a blockchain for permanent verification
- Evaluate performance and cost implications of blockchain integration
- Determine institutional interest in cryptographically verified attendance records
- Analyze legal and regulatory implications for record-keeping compliance

### 6.2.4 Recommendations for Institutional Policy

**Policy Recommendation 1: Data Privacy and Security Standards**

Establish clear institutional policies regarding:

- Data retention periods for attendance photos, GPS coordinates, and personal information
- Conditions under which attendance data can be accessed or shared
- Student rights to access, review, and request correction of their attendance records
- Procedures for secure disposal of data after retention periods expire
- Compliance with Data Privacy Act of 2012 and related regulations

**Policy Recommendation 2: Attendance Verification Standards**

Develop standardized guidelines for:

- Which types of events require mandatory attendance tracking
- Acceptable circumstances for attendance disputes and appeal processes
- Procedures for handling technical failures or system unavailability
- Backup attendance recording methods for emergency situations
- Consequences for students who attempt to circumvent verification systems

**Policy Recommendation 3: Accessibility and Inclusion**

Create policies ensuring equitable access:

- Accommodations for students without smartphones or with disabilities
- Alternative verification methods when technology is unavailable or inappropriate
- Support for students with privacy concerns regarding photos or location tracking
- Provisions for international students or those with limited technical proficiency

**Policy Recommendation 4: System Governance and Oversight**

Establish governance structures for system management:

- Designate responsible offices/personnel for system administration and maintenance
- Create a steering committee with representatives from students, faculty, and administration
- Define decision-making processes for major system changes or expansions
- Allocate budget for ongoing maintenance, updates, and support

**Policy Recommendation 5: Ethical Use Guidelines**

Develop ethical guidelines for attendance data usage:

- Prohibit use of attendance data for punitive measures without due process
- Establish boundaries for combining attendance data with other student information
- Create transparency requirements for how attendance data informs institutional decisions
- Protect students from unintended consequences of attendance pattern analysis

### 6.2.5 Recommendations for the University Student Council (USC)

**USC Recommendation 1: Standardize Event Creation Practices**

Develop standardized procedures for creating events in the system, including:

- Naming conventions for events to ensure clarity
- Required information fields to ensure complete event documentation
- Timeline for QR code generation and distribution (e.g., at least 24 hours before events)
- Guidelines for setting appropriate geofence boundaries for different venue types

**USC Recommendation 2: Leverage Analytics for Event Improvement**

Utilize the analytics dashboard to continuously improve event planning:

- Review attendance trends to identify optimal event timing and scheduling
- Analyze participation rates across programs to ensure inclusive programming
- Use peak check-in data to allocate staff resources effectively
- Track attendance patterns to evaluate event marketing effectiveness

**USC Recommendation 3: Communicate System Benefits to Students**

Develop a communication strategy to promote system adoption and reduce resistance:

- Emphasize convenience and time-saving benefits compared to manual sign-in
- Highlight fraud prevention as ensuring fairness for all students
- Demonstrate transparency through clear explanations of data usage
- Showcase success stories and positive feedback from early adopters

**USC Recommendation 4: Establish Feedback Collection Mechanism**

Create ongoing feedback channels:

- Conduct pulse surveys after major events to gather immediate reactions
- Host focus groups each semester with diverse student representatives
- Maintain an accessible suggestion box (digital or physical) for continuous input
- Respond publicly to common concerns or questions to demonstrate responsiveness

### 6.2.6 Recommendations for Other Institutions

For educational institutions considering implementing similar attendance systems:

**Recommendation 1: Prioritize Stakeholder Involvement**

Engage students, faculty, and administrators throughout the development process. The success of this system was significantly attributable to continuous feedback and iterative refinement based on actual user needs.

**Recommendation 2: Start Small and Scale Gradually**

Follow a phased pilot approach rather than university-wide immediate deployment. This allows identification and resolution of issues in a controlled environment before broader rollout.

**Recommendation 3: Balance Security with Usability**

While multi-factor verification provides robust fraud prevention, carefully consider the trade-off with user convenience. Each additional verification step should provide clear security benefits that justify the increased effort.

**Recommendation 4: Invest in Infrastructure and Support**

Ensure adequate cloud hosting, database capacity, and technical support infrastructure before deployment. Underestimating resource requirements can lead to poor performance and user dissatisfaction.

**Recommendation 5: Document Everything**

Maintain comprehensive documentation of system architecture, development decisions, troubleshooting procedures, and user guides. This investment in documentation pays dividends during expansion, maintenance, and knowledge transfer.

### Concluding Statement

The Event Attendance System represents a significant advancement over traditional manual attendance tracking methods for school events at Surigao del Norte State University. The successful pilot implementation with BSCS students provides empirical evidence that mobile web-based attendance systems with multi-factor verification can effectively address longstanding challenges of fraud, inefficiency, and inaccuracy in educational event attendance monitoring.

The research demonstrates that when guided by solid theoretical frameworks (Human-Computer Interaction, Biometric Authentication Models, and Cloud Computing Models) and developed through iterative, user-centered methodologies (Agile and RAD), educational technology systems can achieve high levels of usability, security, and effectiveness. The positive evaluation results—spanning usability ratings, efficiency metrics, security confidence, and analytics utility—suggest that the system is ready for broader deployment across the university.

However, this conclusion does not mark the end of development but rather the beginning of continuous evolution. The recommendations outlined in this chapter provide a roadmap for system refinement, expanded implementation, and future research that builds upon this foundation. As technology continues to advance and institutional needs evolve, the Event Attendance System must adapt and improve to maintain its effectiveness and relevance.

Ultimately, this research contributes to the growing body of knowledge on educational technology by demonstrating that comprehensive, multi-faceted solutions addressing real-world problems can be developed and successfully implemented in resource-constrained educational settings. The lessons learned, methodologies applied, and findings generated through this study offer valuable insights for other institutions embarking on similar digital transformation journeys.

The researchers are confident that with the recommended improvements and broader implementation, the Event Attendance System will continue to serve Surigao del Norte State University's event management needs effectively, providing accurate, secure, and efficient attendance tracking that benefits students, organizers, and administrators alike.

---

**[FINAL NOTE TO RESEARCHERS]**

_When completing this chapter:_

_1. Ensure all conclusions are directly supported by findings from Chapter 5_
_2. Avoid introducing new information not discussed in previous chapters_
_3. Be honest about both successes and limitations_
_4. Make recommendations specific and actionable, not vague suggestions_
_5. Prioritize recommendations based on feasibility and potential impact_
_6. Connect recommendations to specific problems or gaps identified in your study_
_7. Maintain consistency in terminology and references throughout_
_8. End with a forward-looking perspective that acknowledges ongoing work_

_A strong conclusion chapter synthesizes your entire thesis, clearly states what you accomplished, honestly acknowledges limitations, and provides a clear path forward for future work._
