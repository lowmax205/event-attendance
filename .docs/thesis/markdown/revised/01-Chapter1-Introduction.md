# CHAPTER 1: INTRODUCTION

## 1.1 Background of the Study

School events play a vital role in the educational ecosystem as they actively engage students beyond the classroom, foster community building, and enhance holistic learning experiences. However, tracking participant attendance at these events remains a persistent challenge, particularly for large universities such as Surigao del Norte State University (SNSU). The traditional method of recording student attendance using pen and paper is not only time-consuming but also prone to loss, manipulation, and human error. Furthermore, the manual processing and management of attendance records by university administration significantly delays data consolidation and reporting, creating bottlenecks in decision-making and event evaluation (Mulay, 2022).

Despite the rapid advancement of technology in recent years, most educational institutions, including SNSU, have not successfully implemented comprehensive and secure systems to prevent attendance fraud. Common fraudulent practices include proxy sign-ins, where one student signs on behalf of another, and false attendance logging. The lack of real-time verification mechanisms in traditional attendance systems makes it exceedingly difficult for event organizers and administrators to properly monitor and validate participation. An efficient system that provides instant verification and automates the tracking of attendance can significantly assist educational institutions in improving operational efficiency and reducing errors (Caytuiro-Silva et al., 2024).

Several research studies have explored innovative approaches to improve school attendance tracking systems. Studies have demonstrated that integrating cloud computing and machine learning into attendance systems can greatly enhance precision and efficiency (Caytuiro-Silva et al., 2024). Web-based attendance management systems that incorporate cloud databases and QR code integration have been shown to expedite the attendance process while minimizing errors and time consumption. Additional research indicates that Radio-Frequency Identification (RFID) tags function effectively as a method for student identification and can transmit attendance information through SMS alerts to parents and administrators (Satria et al., 2018). However, despite these technological advancements, some solutions remain inaccessible to certain students due to the high cost of required devices and the assumption that all students possess personal smartphones or RFID-enabled identification cards.

Attendance fraud, inefficient record management, and delayed event monitoring persist in many educational settings despite technological advancements. Many institutions continue to rely on outdated logging methods such as manual sign-in sheets and paper-based attendance forms. These methods are time-consuming, error-prone, and susceptible to attendance dishonesty, such as proxy signing where students sign on behalf of absent peers. Traditional systems lack robust verification mechanisms, enabling students to alter records or log fraudulent attendance without detection. Administrators struggle to identify irregularities and prevent abuse due to the absence of real-time monitoring tools and insufficient personnel for manual verification. SNSU and similar institutions urgently require a secure, adaptable system to ensure accurate attendance monitoring during educational events.

This study proposes the development of a comprehensive mobile web-based attendance system that integrates GPS tracking, QR code scanning, and selfie verification with event-specific backgrounds to address these challenges. This innovative system offers real-time attendance tracking that not only improves accuracy but also effectively prevents fraudulent attendance practices by students. Research on biometric authentication and location-based tracking demonstrates that these methods efficiently and user-friendly confirm a student's physical presence at an event (Tsai & Li, 2022). Since the proposed system is designed to operate through mobile web browsers, students can access it without the need to download and install a dedicated mobile application, thereby ensuring broader accessibility across different devices and operating systems. By utilizing cloud storage and secure authentication methods, the system can guarantee accessibility, reliability, and data integrity, making it an ideal solution for universities like SNSU seeking to enhance event attendance tracking.

## 1.2 Statement of the Problem

Conventional methods of monitoring attendance at school events are unreliable, error-prone, and easily manipulated. Traditional attendance systems fail to prevent attendance fraud, impose significant administrative burden on event organizers, and do not enable real-time attendance monitoring capabilities. To address these critical deficiencies, educational institutions require a reliable and automated solution that can prevent fraudulent practices, reduce administrative workload, lower implementation costs, and provide real-time data access.

This research proposes to develop and evaluate a comprehensive mobile web-based event attendance tracking system to enhance the accuracy, reliability, and efficiency of attendance logging at SNSU and similar educational institutions. The system aims to integrate multi-factor verification methods, including QR code scanning, GPS location tracking, and selfie verification with event-specific backgrounds, to create a robust and secure attendance monitoring solution.

The study seeks to answer the following research questions:

1. What are the current challenges and limitations faced by SNSU in monitoring attendance at school events using traditional manual methods?

2. How can a mobile web-based system integrating QR code scanning, GPS tracking, and selfie verification improve the accuracy and security of attendance tracking?

3. What are the functional and non-functional requirements necessary for developing an effective event attendance monitoring system for SNSU?

4. How do students, event organizers, and administrators evaluate the usability, efficiency, security, and analytics features of the proposed system?

5. To what extent does the implemented system reduce attendance fraud, administrative burden, and processing time compared to traditional manual methods?

## 1.3 Objectives of the Study

### 1.3.1 General Objective

The general objective of this study is to develop and evaluate a comprehensive mobile web-based event attendance monitoring system with integrated analytics that improves the accuracy, security, and convenience of tracking event attendance at Surigao del Norte State University. The system utilizes GPS tracking, QR code scanning, and biometric verification through selfie authentication to provide a secure and reliable mechanism for recording attendance at SNSU school events while offering real-time analytics and automated reporting capabilities.

### 1.3.2 Specific Objectives

Specifically, this study aims to:

1. **Develop an Event Attendance Management System** that provides:
   - A full-stack event attendance management system using Next.js with TypeScript for both frontend and backend development
   - An integrated student authentication system to secure event data and student information using JWT (JSON Web Tokens)
   - A responsive web-based interface accessible via mobile browsers for students, event organizers, and administrators

2. **Implement QR Code-Based Attendance Tracking** that includes:
   - Generation of unique, encrypted QR codes for each event
   - Secure QR code scanning functionality with payload validation
   - Time-bound QR code validity to prevent reuse and unauthorized access

3. **Integrate Location-Based and Visual Verification Features** consisting of:
   - Location-based technologies using GPS to track student presence at scheduled events and verify participation
   - Selfie verification with event-specific backgrounds to prevent proxy attendance and confirm physical presence
   - Multi-factor authentication combining location, visual, and temporal verification

4. **Develop Automated Reporting and Data Analytics Capabilities** providing:
   - Real-time attendance updates and monitoring dashboards for event organizers
   - Automated generation of attendance reports in CSV and PDF formats with student photos
   - Integrated analytics dashboard displaying attendance trends, peak check-in times, and pattern analysis
   - Comprehensive system logs to track student and moderator activities for security and accountability

## 1.4 Significance of the Study

This study aims to improve the effectiveness and efficiency of attendance monitoring in campus events at Surigao del Norte State University. Many universities, including SNSU, continue to use traditional manual methods for marking attendance, which are time-consuming and create long queues at event check-in points. These outdated practices render attendance monitoring ineffective and unreliable, resulting in inaccurate data, administrative burden, and opportunities for fraudulent behavior. The proposed system offers a computerized alternative that provides secure, reliable, and convenient attendance monitoring with real-time verification and analytics capabilities.

This research project will be beneficial to the following stakeholders:

**For the University Administration:** The system ensures an efficient and fraud-resistant method for tracking student attendance at institutional events, reducing the need for manual sign-in procedures and eliminating event registration bottlenecks caused by long queues. The integrated analytics dashboard provides administrators with data-driven insights into student engagement patterns, event popularity, and participation trends, enabling better resource allocation and event planning decisions.

**For Event Organizers and Moderators:** The real-time monitoring capability allows event organizers to track attendance as it happens, identify potential issues during check-in, and respond promptly to discrepancies. Administrators can easily export comprehensive student data, including attendance lists, verification photos, timestamps, and location information, in standardized formats for reporting and record-keeping purposes. The automated reporting features eliminate hours of manual data consolidation and verification work.

**For Students:** The system minimizes the time and effort required for attendance confirmation by streamlining the check-in process to a few simple steps: scan, capture, and submit. Students benefit from reduced waiting times at event entrances and greater transparency in attendance tracking. The system ensures fairness by preventing proxy attendance and providing students with immediate confirmation of their recorded attendance, reducing disputes and misunderstandings.

**For Future Researchers:** This study provides a comprehensive foundation for further research on improving attendance monitoring systems through emerging technologies such as artificial intelligence for facial recognition, advanced cloud computing architectures for scalability, enhanced biometric verification methods, and predictive analytics for student engagement. The documented development process, evaluation methodology, and findings can guide similar projects at other educational institutions seeking to modernize their attendance tracking infrastructure.

**For the Academic Community:** The research contributes to the body of knowledge on educational technology, specifically in the areas of mobile web applications, multi-factor authentication, location-based services, and real-time data analytics in educational settings. The study demonstrates the practical application of contemporary web technologies (Next.js, TypeScript, PostgreSQL, JWT authentication) in solving real-world problems in educational administration.

## 1.5 Scope and Limitation

This study was conducted at Surigao del Norte State University (SNSU) from the second semester of the 2024-2025 academic year to the first semester of the 2025-2026 academic year. The research focuses on developing, implementing, and evaluating a mobile web-based attendance monitoring system that uses QR code scanning, GPS location verification, and selfie authentication to improve attendance tracking for school events. The proposed system was tested at SNSU and evaluated for its accuracy, security, efficiency, and usability.

### Scope

The core features and functionalities of the Event Attendance System include:

#### 1. Event Attendance Management System

- Development of a comprehensive event attendance management system using Next.js with TypeScript for full-stack development, providing a unified codebase for both client-side and server-side functionality
- Integration of a secure student authentication system to protect event data and student information using JWT (JSON Web Tokens) for stateless authentication
- Implementation of a responsive web-based interface accessible via mobile browsers for students, event organizers, and administrators, eliminating the need for native mobile application downloads
- Role-based access control (RBAC) to differentiate permissions between students, moderators, and administrators

#### 2. QR Code-Based Attendance Tracking

- Generation of unique, encrypted QR codes for each event containing event-specific information and security tokens
- Implementation of secure QR code encryption to prevent unauthorized duplication or tampering
- QR code scanning functionality accessible through mobile device cameras via web browsers
- Time-bound QR code validity to ensure codes can only be used during designated event timeframes

#### 3. Location-Based and Visual Verification Features

- Integration of location-based technologies using GPS to verify student physical presence at scheduled event locations
- Geofencing capabilities to validate that students are within acceptable proximity to event venues
- Implementation of selfie verification with event-specific background overlays to prevent proxy attendance
- Multi-factor verification combining QR code scanning, GPS location, and selfie authentication for comprehensive security
- Digital signature capture for additional identity confirmation

#### 4. Automated Reporting and Data Analytics

- Real-time attendance updates providing instant visibility into check-in status during events
- Automated generation of attendance reports in CSV and PDF formats with customizable fields
- Integration of student verification photos in exported reports for visual confirmation
- Analytics dashboard displaying attendance trends, participation patterns, peak check-in times, and comparative statistics across events
- Comprehensive system logs tracking student check-ins, moderator activities, and system access for security auditing and accountability

#### 5. System Deployment and Evaluation

- Phased deployment approach beginning with BSCS students as pilot testers, expanding to all CCIS programs, and culminating in university-wide USC events implementation
- User acceptance testing (UAT) with actual event participants and organizers
- Quantitative evaluation using survey questionnaires distributed to BSCS students across all year levels
- Qualitative evaluation through structured interviews with event organizers, student leaders, and university administrators

### Limitations

However, there are certain limitations to the Event Attendance System that must be acknowledged:

1. **Network Dependency:** The system requires a stable internet connection for real-time updates, QR code validation, photo uploads, and GPS verification. System performance may be compromised in areas with poor network coverage or during network outages, potentially resulting in delayed submissions or failed check-ins.

2. **GPS Accuracy Constraints:** Environmental variables including building structures, weather conditions, indoor event locations, and device hardware limitations can impact GPS accuracy. GPS signal interference in indoor venues or densely constructed areas may lead to location verification challenges, requiring manual review by moderators.

3. **Selfie Verification Challenges:** Poor lighting conditions, camera quality variations across different devices, improper photo angles, and environmental factors may result in unclear or rejected selfie submissions during verification. Students may need to retake photos multiple times in suboptimal conditions, potentially slowing the check-in process.

4. **Event Scale Limitations:** The system is designed and optimized for school-related events with attendance ranging from small gatherings to large campus-wide events. Deployment for extremely large-scale events (e.g., thousands of simultaneous check-ins) may require infrastructure scaling and performance optimization beyond the scope of this study.

5. **Privacy and Data Security Concerns:** GPS tracking, facial verification through selfies, and storage of biometric-related data raise legitimate privacy concerns that require strict data protection procedures, compliance with data privacy regulations, and transparent communication with students regarding data usage. The system must implement robust security measures to protect sensitive student information and ensure compliance with the Data Privacy Act of 2012 (Republic Act No. 10173).

6. **Device and Browser Compatibility:** While the system is designed to be responsive and compatible with modern mobile browsers, variations in browser versions, operating systems, and device capabilities may result in inconsistent user experiences. Students using older devices or outdated browsers may encounter functionality limitations.

7. **User Adoption and Digital Literacy:** The effectiveness of the system depends on user adoption and basic digital literacy among students and event organizers. Students unfamiliar with QR code scanning, browser permissions, or smartphone cameras may require additional guidance and support during initial implementation.

8. **Evaluation Scope:** The system evaluation is limited to BSCS students in Phase 1 of deployment. Findings may not be fully generalizable to all student populations, programs, or event types across the university until broader deployment and evaluation are completed in subsequent phases.

## 1.6 Definition of Terms

To ensure clarity and understanding of the technical and contextual terms used throughout this study, the following definitions are provided:

**Attendance Fraud:** The deliberate act of falsifying attendance records through various means, including proxy sign-ins (where one student signs on behalf of another absent student), false check-ins using manipulated credentials, or submission of fraudulent verification materials.

**GPS Tracking:** The utilization of a mobile device's Global Positioning System (GPS) to determine and verify a student's physical presence at a specific event location. GPS tracking uses satellite signals to provide geographic coordinates that are compared against predefined event venue boundaries to confirm attendance legitimacy.

**QR Code Scanning:** A technological process where students use their mobile device cameras to scan a unique Quick Response (QR) code that contains encrypted event information and authentication tokens, thereby confirming their attendance at a specific event. The QR code serves as a rapid and secure method for initiating the attendance verification process.

**Selfie Verification:** A biometric-based method of identity verification where students capture a self-photograph (selfie) with the event background visible in the frame to confirm their physical attendance and identity. This visual verification prevents proxy attendance by requiring the registered student to be physically present and visible in the photo.

**Real-Time Monitoring:** The technological capability to track, process, and display attendance records instantaneously through a mobile or web-based platform, allowing event organizers and administrators to view check-in status, identify issues, and respond to discrepancies as they occur during the event.

**Cloud-Based Storage:** A digital database infrastructure hosted on remote servers that securely stores attendance records, student information, verification photos, and system logs for easy access, retrieval, backup, and long-term archival. Cloud storage enables data accessibility from multiple locations and devices while maintaining security and redundancy.

**RFID Technology (Radio-Frequency Identification):** A wireless communication system that uses electromagnetic fields and radio waves to automatically identify and track tags attached to objects, such as student identification cards, for automated attendance logging. While not implemented in this study, RFID serves as an alternative attendance tracking method discussed in related literature.

**Biometric Authentication:** The use of unique biological characteristics (such as facial features) or behavioral characteristics for identification and authentication purposes. In this study, selfie verification serves as a form of biometric authentication to ensure that the person checking in is the registered student.

**Authentication:** The security process of verifying the identity of a user, system, or process before granting access to resources or services. The study's system employs JWT (JSON Web Tokens) for user authentication and multi-factor verification for attendance authentication.

**JWT (JSON Web Tokens):** A compact, URL-safe means of representing claims to be transferred between two parties, used in this study for secure user authentication and authorization. JWTs enable stateless authentication, allowing the system to verify user identity without maintaining server-side session data.

**Next.js:** A React-based full-stack web development framework that enables server-side rendering, static site generation, and API routes. The study utilizes Next.js with TypeScript for building both the frontend user interface and backend server functionality of the attendance system.

**API (Application Programming Interface):** A software intermediary that allows two applications or systems to communicate with each other. The study implements APIs for QR code generation, GPS location services, image uploads, and data retrieval.

**SDLC (Software Development Life Cycle):** A structured process used to plan, design, develop, test, deploy, and maintain software systems. This study follows the SDLC framework with Agile and Rapid Application Development (RAD) methodologies.

**Data Analytics:** The systematic computational process of examining raw data to discover patterns, trends, and insights that inform decision-making. The study's system includes analytics capabilities to visualize attendance trends, participation patterns, and event statistics.

**Multi-Factor Verification:** A security mechanism that requires multiple forms of evidence (factors) to verify identity or confirm an action. The study's attendance system employs multi-factor verification combining QR code scanning (something you have), GPS location (somewhere you are), and selfie verification (something you are).

**Geofencing:** A location-based technology that creates virtual geographic boundaries, enabling the system to trigger automated responses when a mobile device enters or exits a defined area. The study uses geofencing to verify that students are within acceptable proximity to event venues.

**PostgreSQL:** An open-source relational database management system used in this study to store and manage event data, student information, attendance records, verification photos, and system logs with strong data integrity and security features.

**Cloudinary:** A cloud-based media management platform used in this study to handle the upload, storage, optimization, and delivery of verification photos and event images, ensuring efficient media handling and accessibility.

**Responsive Web Design:** An approach to web development that ensures web applications automatically adapt their layout, images, and functionality to provide optimal viewing and interaction experiences across a wide range of devices and screen sizes, from desktop computers to mobile smartphones.
