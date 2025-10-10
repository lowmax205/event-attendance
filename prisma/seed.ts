import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data (in reverse order of dependencies)
  console.log("🧹 Cleaning existing data...");
  await prisma.attendance.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.userProfile.deleteMany({});
  await prisma.securityLog.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});

  // Hash password for all users (password: "Password123!")
  const hashedPassword = await hash("Password123!", 10);

  // Hash password for test users (password: "Test1234!")
  const testPasswordHash = await hash("Test1234!", 10);

  // Create Test Users for Manual Testing
  console.log("🧪 Creating Test Users...");

  // Test User 1: Complete Student
  const testStudent1 = await prisma.user.create({
    data: {
      email: "student@test.com",
      passwordHash: testPasswordHash,
      firstName: "John",
      lastName: "Doe",
      role: "Student",
      emailVerified: true,
      accountStatus: "ACTIVE",
      UserProfile: {
        create: {
          studentId: "2021-00001",
          department: "Computer Science",
          yearLevel: 3,
          section: "CS-3A",
          contactNumber: "+63 912 345 6789",
        },
      },
    },
  });

  // Test User 2: Complete Student
  const testStudent2 = await prisma.user.create({
    data: {
      email: "student2@test.com",
      passwordHash: testPasswordHash,
      firstName: "Jane",
      lastName: "Smith",
      role: "Student",
      emailVerified: true,
      accountStatus: "ACTIVE",
      UserProfile: {
        create: {
          studentId: "2021-00002",
          department: "Information Technology",
          yearLevel: 2,
          section: "IT-2B",
          contactNumber: "+63 912 345 6790",
        },
      },
    },
  });

  // Test User 3: Incomplete Student (no profile)
  const incompleteStudent = await prisma.user.create({
    data: {
      email: "incomplete@test.com",
      passwordHash: testPasswordHash,
      firstName: "", // Empty to simulate incomplete profile
      lastName: "Incomplete",
      role: "Student",
      emailVerified: true,
      accountStatus: "ACTIVE",
      // No UserProfile created
    },
  });

  // Test User 4: Complete Moderator
  const testModerator = await prisma.user.create({
    data: {
      email: "moderator@test.com",
      passwordHash: testPasswordHash,
      firstName: "Michael",
      lastName: "Johnson",
      role: "Moderator",
      emailVerified: true,
      accountStatus: "ACTIVE",
      UserProfile: {
        create: {
          studentId: "MOD-2020-001",
          department: "Student Affairs",
          yearLevel: 4,
          section: "N/A",
          contactNumber: "+63 912 345 6791",
        },
      },
    },
  });

  // Test User 5: Complete Administrator
  const testAdmin = await prisma.user.create({
    data: {
      email: "admin@test.com",
      passwordHash: testPasswordHash,
      firstName: "Sarah",
      lastName: "Williams",
      role: "Administrator",
      emailVerified: true,
      accountStatus: "ACTIVE",
      UserProfile: {
        create: {
          studentId: "ADM-2019-001",
          department: "Administration",
          yearLevel: 4,
          section: "N/A",
          contactNumber: "+63 912 345 6792",
        },
      },
    },
  });

  console.log("✅ Created 5 test users with password: Test1234!");

  // Create Administrator
  console.log("👤 Creating Administrator...");
  const admin = await prisma.user.create({
    data: {
      email: "admin@snsu.edu.ph",
      passwordHash: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: "Administrator",
      emailVerified: true,
      accountStatus: "ACTIVE",
      UserProfile: {
        create: {
          studentId: "ADM-2020-001",
          department: "Administration",
          yearLevel: 4,
          section: "N/A",
          contactNumber: "+63 912 345 6800",
        },
      },
    },
  });

  // Create Moderators (2)
  console.log("👥 Creating Moderators...");
  const moderators = await Promise.all([
    prisma.user.create({
      data: {
        email: "moderator1@snsu.edu.ph",
        passwordHash: hashedPassword,
        firstName: "Maria",
        lastName: "Santos",
        role: "Moderator",
        emailVerified: true,
        accountStatus: "ACTIVE",
        UserProfile: {
          create: {
            studentId: "MOD-2020-002",
            department: "Student Affairs",
            yearLevel: 4,
            section: "N/A",
            contactNumber: "+63 912 345 6801",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "moderator2@snsu.edu.ph",
        passwordHash: hashedPassword,
        firstName: "Juan",
        lastName: "Dela Cruz",
        role: "Moderator",
        emailVerified: true,
        accountStatus: "ACTIVE",
        UserProfile: {
          create: {
            studentId: "MOD-2020-003",
            department: "Student Affairs",
            yearLevel: 4,
            section: "N/A",
            contactNumber: "+63 912 345 6802",
          },
        },
      },
    }),
  ]);

  // Create Students (48 from actual roster)
  console.log("🎓 Creating 48 Students...");
  const studentData = [
    { firstName: "Prince Carl ", lastName: "AJOC" },
    { firstName: "Jerette-Jean ", lastName: "BAKER" },
    { firstName: "Jovi ", lastName: "BELING" },
    { firstName: "Jeschelle ", lastName: "BONITA" },
    { firstName: "Ma. Juvywin ", lastName: "BUENAVISTA" },
    { firstName: "Richie ", lastName: "BURDEOS" },
    { firstName: "Mark ", lastName: "CANTILLAS" },
    { firstName: "Leizl Mae ", lastName: "CAPISTRANO" },
    { firstName: "Joanna Izzy ", lastName: "CELMAR" },
    { firstName: "Jazztine Rey", lastName: "CERVANTES" },
    { firstName: "Aladin John", lastName: "COLONG" },
    { firstName: "Karen ", lastName: "COMANDANTE" },
    { firstName: "Neo ", lastName: "COMON" },
    { firstName: "Mailyn ", lastName: "CONFESOR" },
    { firstName: "Katrina Carla ", lastName: "DIAZ" },
    { firstName: "Josephine ", lastName: "DINGDING" },
    { firstName: "Doña Jeva ", lastName: "ESTOQUE" },
    { firstName: "Dunn Turquoise ", lastName: "FAELNAR" },
    { firstName: "Vincent ", lastName: "GABRITO" },
    { firstName: "Alyn Mae ", lastName: "GALGO" },
    { firstName: "Christian Joyce ", lastName: "GARCIA" },
    { firstName: "Richelle Mae ", lastName: "GIPALA" },
    { firstName: "Cecille ", lastName: "GONZALES" },
    { firstName: "Jumar ", lastName: "GUARDALUPE" },
    { firstName: "Felipe Jr. ", lastName: "GUDITO" },
    { firstName: "Jessa Mae ", lastName: "HIDALGO" },
    { firstName: "Remark ", lastName: "JAYME" },
    { firstName: "John Andrei ", lastName: "JULVE" },
    { firstName: "Cresencia Lady Mae ", lastName: "LACAYA" },
    { firstName: "Sancai ", lastName: "LADERO" },
    { firstName: "Anthony", lastName: "MACULA" },
    { firstName: "Kristian Kurt ", lastName: "MADELO" },
    { firstName: "Shane ", lastName: "MALASAN" },
    { firstName: "Jesyl Mae ", lastName: "MANLIMOS" },
    { firstName: "Gerry Jr. ", lastName: "MANTILLA" },
    { firstName: "Jo Marie ", lastName: "MARA" },
    { firstName: "Jamby ", lastName: "NARCISO" },
    { firstName: "Nilo Jr.", lastName: "OLANG" },
    { firstName: "Gilbert ", lastName: "OLVIS" },
    { firstName: "Stifhany", lastName: "PAGALAN" },
    { firstName: "Arjhay-Jun ", lastName: "PASTRANA" },
    { firstName: "Justin Mae ", lastName: "REPOLIDON" },
    { firstName: "Jessa Baculao", lastName: "REYES" },
    { firstName: "Aidrian Vic ", lastName: "RULIDA" },
    { firstName: "John Mike ", lastName: "SALVALEON" },
    { firstName: "Danna Rose ", lastName: "TENAZAS" },
    { firstName: "Nice Kyorie", lastName: "TERIOTE" },
    { firstName: "Nickel Jay", lastName: "TERIOTE" },
  ];

  const departments = [
    "College of Teacher Education",
    "College of Computing and Information Sciences",
    "College of Agri-Fisheries and Allied Sciences",
    "College of Engineering",
    "College of Technology",
    "College of Arts & Sciences",
  ];

  const sections = ["A", "B", "C", "D", "E"];
  const yearLevels = [1, 2, 3, 4];

  const students = [];
  for (let i = 0; i < studentData.length; i++) {
    const { firstName, lastName } = studentData[i];
    const studentIdNum = String(2024000 + i + 1).padStart(7, "0");

    const student = await prisma.user.create({
      data: {
        email: `${lastName.toLowerCase()}.${firstName.split(" ")[0].toLowerCase()}@snsu.edu.ph`,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        role: "Student",
        emailVerified: true,
        accountStatus: "ACTIVE",
        UserProfile: {
          create: {
            studentId: studentIdNum,
            department: departments[i % departments.length],
            yearLevel: yearLevels[i % yearLevels.length],
            section: sections[i % sections.length],
            contactNumber: `+639${String(Math.floor(Math.random() * 1000000000)).padStart(9, "0")}`,
          },
        },
      },
    });
    students.push(student);
  }

  console.log(`✅ Created ${students.length} students with profiles`);

  // Create Events (5)
  console.log("📅 Creating 5 Events...");
  const baseDate = new Date("2025-10-01T00:00:00Z");

  // Surigao del Norte State University base coordinate
  const baseLat = 9.787434;
  const baseLng = 125.494414;
  // 10 meters ≈ 0.00009 degrees latitude/longitude
  const meterOffset = 0.00009;

  const eventData = [
    {
      name: "Welcome Orientation 2025",
      description:
        "Annual orientation for new and returning students. Learn about campus facilities, academic policies, and student services.",
      venueName: "Main Auditorium",
      venueAddress: "University Building A, Ground Floor",
      venueLatitude: baseLat,
      venueLongitude: baseLng,
      dayOffset: 5,
      startHour: 9,
      durationHours: 3,
    },
    {
      name: "Technology Summit 2025",
      description:
        "Annual technology conference featuring industry speakers, workshops, and networking opportunities for CS and IT students.",
      venueName: "Innovation Center",
      venueAddress: "Tech Hub Building, 3rd Floor",
      venueLatitude: baseLat + meterOffset,
      venueLongitude: baseLng + meterOffset,
      dayOffset: 12,
      startHour: 13,
      durationHours: 4,
    },
    {
      name: "Career Fair: Industry Partners",
      description:
        "Connect with leading companies for internship and job opportunities. Bring your resume and dress professionally.",
      venueName: "Sports Complex",
      venueAddress: "University Grounds, East Wing",
      venueLatitude: baseLat + meterOffset * 2,
      venueLongitude: baseLng + meterOffset * 2,
      dayOffset: 19,
      startHour: 10,
      durationHours: 5,
    },
    {
      name: "Student Leadership Training",
      description:
        "Develop leadership skills through interactive workshops, team-building activities, and mentorship sessions.",
      venueName: "Conference Room 301",
      venueAddress: "Administration Building, 3rd Floor",
      venueLatitude: baseLat + meterOffset * 3,
      venueLongitude: baseLng + meterOffset * 3,
      dayOffset: 26,
      startHour: 8,
      durationHours: 6,
    },
    {
      name: "Research Symposium 2025",
      description:
        "Showcase of student research projects across all departments. Poster presentations and panel discussions.",
      venueName: "Library Atrium",
      venueAddress: "Main Library, 1st Floor",
      venueLatitude: baseLat + meterOffset * 4,
      venueLongitude: baseLng + meterOffset * 4,
      dayOffset: 33,
      startHour: 14,
      durationHours: 3,
    },
  ];

  const events: Awaited<ReturnType<typeof prisma.event.create>>[] = [];
  for (const data of eventData) {
    const startDateTime = new Date(baseDate);
    startDateTime.setDate(startDateTime.getDate() + data.dayOffset);
    startDateTime.setHours(data.startHour, 0, 0, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(startDateTime.getHours() + data.durationHours);

    const event = await prisma.event.create({
      data: {
        name: data.name,
        description: data.description,
        startDateTime,
        endDateTime,
        venueName: data.venueName,
        venueAddress: data.venueAddress,
        venueLatitude: data.venueLatitude,
        venueLongitude: data.venueLongitude,
        checkInBufferMins: 30,
        checkOutBufferMins: 30,
        qrCodePayload: `attendance:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
        qrCodeUrl: `https://placehold.co/400x400/png?text=QR+Code`,
        status: "Completed",
        createdById: moderators[events.length % moderators.length].id,
      },
    });
    events.push(event);
  }

  console.log(`✅ Created ${events.length} events`);

  // Create Attendances (60-90% of students per event)
  console.log("✅ Creating Attendances...");
  let totalAttendances = 0;

  for (const event of events) {
    // Random attendance rate between 60% and 90%
    const attendanceRate = 0.6 + Math.random() * 0.3;
    const numAttendees = Math.floor(students.length * attendanceRate);

    // Shuffle students and select random subset
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    const attendees = shuffledStudents.slice(0, numAttendees);

    console.log(
      `  📝 Event: ${event.name} - ${numAttendees}/${students.length} students (${Math.round(attendanceRate * 100)}%)`,
    );

    for (const student of attendees) {
      // Random submission time within event window
      const submittedAt = new Date(event.startDateTime);
      const eventDurationMs =
        event.endDateTime.getTime() - event.startDateTime.getTime();
      submittedAt.setTime(
        submittedAt.getTime() + Math.random() * eventDurationMs,
      );

      // Random distance from venue (most within 100m, some slightly outside)
      const distanceFromVenue =
        Math.random() < 0.95 ? Math.random() * 80 : 80 + Math.random() * 50;

      // Slightly offset coordinates (within ~20m)
      const latOffset = (Math.random() - 0.5) * meterOffset * 2; // ~20m max offset
      const lngOffset = (Math.random() - 0.5) * meterOffset * 2;

      // Verification status (85% approved, 10% pending, 5% rejected)
      let verificationStatus: "Pending" | "Approved" | "Rejected" = "Approved";
      let verifiedById: string | null = moderators[0].id;
      let verifiedAt: Date | null = new Date(submittedAt);
      verifiedAt?.setHours(verifiedAt.getHours() + 2);

      const rand = Math.random();
      if (rand > 0.95) {
        verificationStatus = "Rejected";
      } else if (rand > 0.85) {
        verificationStatus = "Pending";
        verifiedById = null;
        verifiedAt = null;
      }

      await prisma.attendance.create({
        data: {
          eventId: event.id,
          userId: student.id,
          // Check-in data (seed data represents completed check-ins)
          checkInSubmittedAt: submittedAt,
          checkInLatitude: event.venueLatitude + latOffset,
          checkInLongitude: event.venueLongitude + lngOffset,
          checkInDistance: distanceFromVenue,
          checkInFrontPhoto: `https://placehold.co/600x800/png?text=Front+Photo`,
          checkInBackPhoto: `https://placehold.co/600x800/png?text=Back+Photo`,
          checkInSignature: `https://placehold.co/400x200/png?text=Signature`,
          checkInIpAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
          checkInUserAgent:
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
          // Verification data
          verificationStatus,
          verifiedById,
          verifiedAt,
          disputeNote:
            verificationStatus === "Rejected"
              ? "Location verification failed - distance exceeds 100m threshold"
              : null,
        },
      });
      totalAttendances++;
    }
  }

  console.log(`✅ Created ${totalAttendances} total attendances`);

  // Create some security logs
  console.log("🔒 Creating Security Logs...");
  await prisma.securityLog.createMany({
    data: [
      {
        userId: admin.id,
        eventType: "LOGIN",
        metadata: { email: admin.email },
        ipAddress: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      {
        userId: moderators[0].id,
        eventType: "EVENT_CREATED",
        metadata: { eventName: events[0].name },
        ipAddress: "192.168.1.101",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      },
      {
        userId: moderators[1].id,
        eventType: "EVENT_CREATED",
        metadata: { eventName: events[1].name },
        ipAddress: "192.168.1.102",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    ],
  });

  console.log("✅ Created security logs");

  // Summary
  console.log("\n📊 Seed Summary:");
  console.log("================");
  console.log(`\n🧪 TEST USERS (Password: Test1234!):`);
  console.log(`   ✅ student@test.com - Student (Complete)`);
  console.log(`   ✅ student2@test.com - Student (Complete)`);
  console.log(`   ✅ incomplete@test.com - Student (Incomplete Profile)`);
  console.log(`   ✅ moderator@test.com - Moderator (Complete)`);
  console.log(`   ✅ admin@test.com - Administrator (Complete)`);
  console.log(`\n📚 DEMO DATA (Password: Password123!):`);
  console.log(`   ✅ 1 Administrator (admin@snsu.edu.ph)`);
  console.log(`   ✅ 2 Moderators (moderator1@, moderator2@snsu.edu.ph)`);
  console.log(`   ✅ ${studentData.length} Students (actual SNSU roster)`);
  console.log(`   ✅ 5 Events (60-90% attendance rate each)`);
  console.log(`   ✅ ${totalAttendances} Attendance records`);
  console.log(`   ✅ 3 Security log entries`);
  console.log(`\n📍 Location: Surigao del Norte State University`);
  console.log(`   Coordinates: 9.787434, 125.494414`);
  console.log("\n🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
