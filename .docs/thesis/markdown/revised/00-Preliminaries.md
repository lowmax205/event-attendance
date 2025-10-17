# PRELIMINARIES

## Title Page

**A COMPREHENSIVE MOBILE WEB-BASED ATTENDANCE MONITORING SYSTEM WITH INTEGRATED ANALYTICS FOR SCHOOL EVENTS OF THE UNIVERSITY**

**Thesis Presented to**

**The Faculty of the College of Engineering & Information Technology**

**Surigao del Norte State University**

**In Partial Fulfillment**

**of the Requirements for the Degree**

**Bachelor of Science in Computer Science**

**By:**

**Nilo Jr. Olang**

**Cricedine P. Peñaranda**

**May 2025**

---

## Approval Sheet

**[TO BE INSERTED BY UNIVERSITY]**

_This page will be signed by the thesis panel members, thesis adviser, program chair, and college dean upon successful defense._

---

## Acknowledgement

**[TO BE WRITTEN BY RESEARCHERS]**

_This section should express gratitude to the following individuals and organizations:_

- _Thesis adviser and panel members_
- _University administration and CCIS faculty_
- _University Student Council (USC) and event organizers_
- _BSCS students who participated in system testing and evaluation_
- _Family, friends, and colleagues who provided support_
- _Technical mentors and professionals who guided the development_

_Template structure:_

_The researchers would like to express their sincerest gratitude to all the individuals who have contributed to the successful completion of this study..._

---

## Abstract

**[DATA PLACEHOLDER - TO BE COMPLETED AFTER CHAPTER 5]**

This study presents the development and evaluation of a comprehensive mobile web-based attendance monitoring system with integrated analytics designed for school events at Surigao del Norte State University (SNSU). The research addresses persistent challenges in traditional attendance tracking methods, including attendance fraud, inefficient record management, and lack of real-time monitoring capabilities.

**Methodology Overview:** The system was developed using Next.js with TypeScript for full-stack development, PostgreSQL for database management, and JWT for authentication. Following Agile and Rapid Application Development (RAD) methodologies within the Software Development Life Cycle (SDLC), the system incorporates multi-factor verification through QR code scanning, GPS location tracking, and selfie verification with event-specific backgrounds.

**Key Features:** The system provides real-time attendance monitoring, automated reporting capabilities with PDF/CSV export functionality, an integrated analytics dashboard displaying attendance trends and patterns, and comprehensive security measures to prevent proxy attendance and record manipulation.

**[INSERT EVALUATION RESULTS HERE]**

- _Number of respondents: [N = __]_
- _Overall system usability rating: [Mean = __, SD = __]_
- _Efficiency improvement compared to manual system: [__%]_
- _Security confidence level: [Mean = __, SD = __]_
- _Key findings from statistical analysis: [Briefly describe significant results]_

**Implications:** The system demonstrates that mobile web-based attendance tracking with multi-factor verification significantly improves accuracy, security, and efficiency in monitoring event attendance at educational institutions. The findings support the adoption of technology-enhanced attendance systems to address fraud prevention, administrative burden reduction, and real-time data accessibility.

**Keywords:** Attendance monitoring, QR code verification, GPS tracking, biometric authentication, mobile web application, event management, educational technology, Next.js, analytics dashboard

---

## Table of Contents

**PRELIMINARIES**

- Title Page ............................................................... i
- Approval Sheet .......................................................... ii
- Acknowledgement ......................................................... iii
- Abstract ................................................................ iv
- Table of Contents ....................................................... v
- List of Tables .......................................................... vii
- List of Figures ......................................................... viii
- List of Appendices ...................................................... ix

**CHAPTER 1: INTRODUCTION** ................................................ 1

- 1.1 Background of the Study ............................................. 1
- 1.2 Statement of the Problem ............................................ 3
- 1.3 Objectives of the Study ............................................. 4
  - 1.3.1 General Objective ............................................... 4
  - 1.3.2 Specific Objectives ............................................. 4
- 1.4 Significance of the Study ........................................... 5
- 1.5 Scope and Limitation ................................................ 6
- 1.6 Definition of Terms ................................................. 8

**CHAPTER 2: REVIEW OF RELATED LITERATURE AND STUDIES** .................. 10

- 2.1 Local and Foreign Studies/Literature ................................ 10
  - 2.1.1 RFID and Automated Attendance Tracking ......................... 10
  - 2.1.2 Mobile-Based Attendance Systems ................................ 11
  - 2.1.3 Biometric Authentication in Attendance Monitoring .............. 12
  - 2.1.4 GPS and NFC-Based Attendance Solutions ......................... 13
- 2.2 Synthesis of the Review ............................................. 14

**CHAPTER 3: THEORETICAL AND CONCEPTUAL FRAMEWORK** ...................... 16

- 3.1 Theoretical Framework ............................................... 16
  - 3.1.1 Human-Computer Interaction (HCI) ............................... 16
  - 3.1.2 Biometric Authentication Models ................................ 17
  - 3.1.3 Cloud Computing Models ......................................... 17
- 3.2 Conceptual Framework ................................................ 18

**CHAPTER 4: RESEARCH METHODOLOGY** ....................................... 20

- 4.1 Research Design ..................................................... 20
- 4.2 Research Respondents ................................................ 22
- 4.3 Research Instruments/Tools .......................................... 23
- 4.4 Research Implementation (SDLC Phases) ............................... 24
  - 4.4.1 Requirement Gathering .......................................... 24
  - 4.4.2 Design and Prototyping ......................................... 25
  - 4.4.3 Development .................................................... 26
  - 4.4.4 Testing and User Feedback ...................................... 27
- 4.5 Research Deployment (System Testing, User Acceptance) ............... 28
- 4.6 Research Evaluation ................................................. 29

**CHAPTER 5: RESULTS AND DISCUSSION** ..................................... 31

- 5.1 Presentation of Results ............................................. 31
  - 5.1.1 Respondent Profile Analysis .................................... 31
  - 5.1.2 System Usability and User Experience ........................... 32
  - 5.1.3 Efficiency and Performance ..................................... 34
  - 5.1.4 Security and Fraud Prevention .................................. 36
  - 5.1.5 Analytics and Reporting Features ............................... 38
  - 5.1.6 Open-Ended Feedback Analysis ................................... 40
- 5.2 Discussion of Findings .............................................. 41

**CHAPTER 6: CONCLUSION AND RECOMMENDATIONS** ............................ 45

- 6.1 Conclusion .......................................................... 45
- 6.2 Recommendations ..................................................... 46

**REFERENCES** ............................................................. 48

**APPENDICES** ............................................................. 51

- Appendix A: Letter to Conduct the Study ................................ 51
- Appendix B: Letter Asking Permission to Float the Questionnaire ........ 52
- Appendix C: Documentation during Data Gathering ........................ 53
- Appendix D: Letter Asking Permission to Deploy the System .............. 54
- Appendix E: Minutes of Proposal Defense and Final Defense .............. 55
- Appendix F: Curriculum Vitae of Researchers ............................ 56
- Appendix G: Evaluation Instruments ..................................... 57

---

## List of Tables

**Table 1:** Functional and Non-Functional Requirements ................... 26

**Table 2:** Hardware Requirements Specifications ......................... 27

**Table 3:** Software Requirements and Technologies ....................... 28

**Table 4:** [DATA PLACEHOLDER] Respondent Profile Distribution (N = \_\_) . 32

**Table 5:** [DATA PLACEHOLDER] System Usability Evaluation Results ...... 33

**Table 6:** [DATA PLACEHOLDER] Efficiency and Performance Metrics ....... 35

**Table 7:** [DATA PLACEHOLDER] Security and Fraud Prevention Assessment . 37

**Table 8:** [DATA PLACEHOLDER] Analytics Features Evaluation ............ 39

**Table 9:** [DATA PLACEHOLDER] Comparative Analysis: Manual vs. System .. 42

---

## List of Figures

**Figure 1:** Input-Process-Output (IPO) Model of the Study ............... 19

**Figure 2:** Use Case Diagram for Event Attendance System ................ 29

**Figure 3:** Low-Level System Design of Event Attendance System .......... 30

**Figure 4:** Agile and RAD Methodology Model ............................. 21

**Figure 5:** [DATA PLACEHOLDER] System Architecture Diagram ............. 31

**Figure 6:** [DATA PLACEHOLDER] Respondent Year Level Distribution ...... 33

**Figure 7:** [DATA PLACEHOLDER] System Usability Ratings ................ 34

**Figure 8:** [DATA PLACEHOLDER] Efficiency Performance Comparison ....... 36

**Figure 9:** [DATA PLACEHOLDER] Security Features Confidence Level ...... 38

**Figure 10:** [DATA PLACEHOLDER] Most Challenging Attendance Steps ...... 40

**Figure 11:** [DATA PLACEHOLDER] Device Usage Distribution .............. 41

---

## List of Appendices

**Appendix A:** Letter to Conduct the Study

**Appendix B:** Letter Asking Permission to Float the Questionnaire

**Appendix C:** Documentation during Data Gathering

- Photos from USC interview sessions
- Screenshots of system testing events
- Observation notes from live event monitoring

**Appendix D:** Letter Asking Permission to Deploy the System

**Appendix E:** Minutes of Proposal Defense and Final Defense

- Proposal Defense Minutes (April 26, 2025)
- Final Defense Minutes [TO BE ADDED]

**Appendix F:** Curriculum Vitae of Researchers

- Nilo Jr. Olang
- Cricedine P. Peñaranda

**Appendix G:** Evaluation Instruments

- Survey Questionnaire for BSCS Students
- Interview Guide for USC and Event Organizers
- System Evaluation Rubric
- User Acceptance Testing (UAT) Checklist
