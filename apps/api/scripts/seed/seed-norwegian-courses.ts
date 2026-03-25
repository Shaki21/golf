/**
 * Seed Norwegian Golf Courses
 * Manual seed data for testing weather API while waiting for GolfCourseAPI key
 */

import prisma from '../prisma/client';


// Popular Norwegian golf clubs with coordinates
const norwegianClubs = [
  {
    externalId: 'no-oslo-gc',
    name: 'Oslo Golfklubb',
    city: 'Oslo',
    country: 'Norway',
    countryCode: 'NO',
    latitude: 59.9650,
    longitude: 10.6842,
    website: 'https://www.oslogk.no',
    courses: [
      { name: 'Championship Course', holes: 18, par: 72 },
    ],
  },
  {
    externalId: 'no-bogstad-gc',
    name: 'Bogstad Golfklubb',
    city: 'Oslo',
    country: 'Norway',
    countryCode: 'NO',
    latitude: 59.9667,
    longitude: 10.6333,
    website: 'https://www.bogstadgolf.no',
    courses: [
      { name: 'Bogstad', holes: 18, par: 72 },
    ],
  },
  {
    externalId: 'no-miklagard-gc',
    name: 'Miklagard Golf',
    city: 'Kløfta',
    country: 'Norway',
    countryCode: 'NO',
    latitude: 60.0667,
    longitude: 11.1333,
    website: 'https://www.miklagardgolf.no',
    courses: [
      { name: 'Miklagard', holes: 18, par: 72 },
    ],
  },
  {
    externalId: 'no-holtsmark-gc',
    name: 'Holtsmark Golfklubb',
    city: 'Drammen',
    country: 'Norway',
    countryCode: 'NO',
    latitude: 59.7378,
    longitude: 10.2050,
    website: 'https://www.holtsmarkgolf.no',
    courses: [
      { name: 'Holtsmark', holes: 18, par: 72 },
    ],
  },
  {
    externalId: 'no-stavanger-gc',
    name: 'Stavanger Golfklubb',
    city: 'Stavanger',
    country: 'Norway',
    countryCode: 'NO',
    latitude: 58.9333,
    longitude: 5.7167,
    website: 'https://www.stavangergolf.no',
    courses: [
      { name: 'Stavanger', holes: 18, par: 72 },
    ],
  },
  {
    externalId: 'no-bergen-gc',
    name: 'Bergen Golfklubb',
    city: 'Bergen',
    country: 'Norway',
    countryCode: 'NO',
    latitude: 60.3167,
    longitude: 5.3500,
    website: 'https://www.bergengolf.no',
    courses: [
      { name: 'Fana', holes: 18, par: 71 },
    ],
  },
  {
    externalId: 'no-trondheim-gc',
    name: 'Trondheim Golfklubb',
    city: 'Trondheim',
    country: 'Norway',
    countryCode: 'NO',
    latitude: 63.3833,
    longitude: 10.3667,
    website: 'https://www.trondheimgolf.no',
    courses: [
      { name: 'Trondheim', holes: 18, par: 72 },
    ],
  },
  {
    externalId: 'no-kristiansand-gc',
    name: 'Kristiansand Golfklubb',
    city: 'Kristiansand',
    country: 'Norway',
    countryCode: 'NO',
    latitude: 58.1500,
    longitude: 8.0167,
    website: 'https://www.kristiansandgolf.no',
    courses: [
      { name: 'Kristiansand', holes: 18, par: 72 },
    ],
  },
  {
    externalId: 'no-losby-gc',
    name: 'Losby Golfklubb',
    city: 'Lørenskog',
    country: 'Norway',
    countryCode: 'NO',
    latitude: 59.9333,
    longitude: 10.9667,
    website: 'https://www.losbygolf.no',
    courses: [
      { name: 'Losby', holes: 18, par: 72 },
    ],
  },
  {
    externalId: 'no-asker-gc',
    name: 'Asker Golfklubb',
    city: 'Asker',
    country: 'Norway',
    countryCode: 'NO',
    latitude: 59.8333,
    longitude: 10.4333,
    website: 'https://www.askergolf.no',
    courses: [
      { name: 'Asker', holes: 18, par: 72 },
    ],
  },
];

async function main() {
  console.log('\n🏌️ Seeding Norwegian Golf Courses');
  console.log('===================================\n');

  let clubsCreated = 0;
  let coursesCreated = 0;

  for (const clubData of norwegianClubs) {
    try {
      // Upsert club
      const club = await prisma.golfClub.upsert({
        where: { externalId: clubData.externalId },
        create: {
          externalId: clubData.externalId,
          name: clubData.name,
          city: clubData.city,
          country: clubData.country,
          countryCode: clubData.countryCode,
          latitude: clubData.latitude,
          longitude: clubData.longitude,
          website: clubData.website,
          lastSynced: new Date(),
        },
        update: {
          name: clubData.name,
          latitude: clubData.latitude,
          longitude: clubData.longitude,
          lastSynced: new Date(),
        },
      });

      const existingClub = await prisma.golfClub.findUnique({
        where: { externalId: clubData.externalId },
        select: { id: true },
      });

      if (!existingClub) clubsCreated++;

      // Upsert courses
      for (const courseData of clubData.courses) {
        const courseExternalId = `${clubData.externalId}-${courseData.name.toLowerCase().replace(/\s+/g, '-')}`;

        await prisma.golfCourse.upsert({
          where: { externalId: courseExternalId },
          create: {
            externalId: courseExternalId,
            clubId: club.id,
            name: courseData.name,
            holes: courseData.holes,
            par: courseData.par,
            latitude: clubData.latitude,
            longitude: clubData.longitude,
            lastSynced: new Date(),
          },
          update: {
            name: courseData.name,
            holes: courseData.holes,
            par: courseData.par,
            lastSynced: new Date(),
          },
        });

        coursesCreated++;
      }

      console.log(`✅ ${clubData.name} (${clubData.city})`);
    } catch (error: any) {
      console.error(`❌ Failed to seed ${clubData.name}: ${error.message}`);
    }
  }

  // Get totals
  const totalClubs = await prisma.golfClub.count();
  const totalCourses = await prisma.golfCourse.count();

  console.log('\n-----------------------------------');
  console.log(`Total clubs in database: ${totalClubs}`);
  console.log(`Total courses in database: ${totalCourses}`);
  console.log('-----------------------------------\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
