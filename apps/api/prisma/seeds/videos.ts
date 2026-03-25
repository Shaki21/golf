/**
 * Seed Test Videos
 * Creates demo videos for testing video progress and library features
 */

import prisma from '../client';


export async function seedVideos() {
  console.log('🎬 Seeding test videos...');

  try {
    // Get tenant
    const tenant = await prisma.tenant.findFirst({
      where: { slug: 'ak-golf-academy' },
    });

    if (!tenant) {
      console.log('   ⚠️  No tenant found, skipping video seeding');
      return;
    }

    // Get player
    const player = await prisma.player.findFirst({
      where: { email: 'player@demo.com' },
    });

    if (!player) {
      console.log('   ⚠️  No player found, skipping video seeding');
      return;
    }

    // Get player's user for uploadedById
    const playerUser = await prisma.user.findFirst({
      where: { email: 'player@demo.com' },
    });

    if (!playerUser) {
      console.log('   ⚠️  No player user found, skipping video seeding');
      return;
    }

    // Video categories and their progression over time
    const videoData = [
      // Full Swing progression (oldest to newest)
      {
        title: 'Driver - Første forsøk',
        description: 'Grunnleggende driver swing, jobber med tempo',
        category: 'swing',
        clubType: 'driver',
        viewAngle: 'down_the_line',
        daysAgo: 60,
      },
      {
        title: 'Driver - Uke 2',
        description: 'Forbedret backswing, fortsatt jobber med impact',
        category: 'swing',
        clubType: 'driver',
        viewAngle: 'face_on',
        daysAgo: 53,
      },
      {
        title: 'Jern 7 - Grunnlag',
        description: 'Fokus på ball-first kontakt',
        category: 'swing',
        clubType: 'iron_7',
        viewAngle: 'down_the_line',
        daysAgo: 45,
      },
      {
        title: 'Driver - Måned 2',
        description: 'Mye bedre tempo og lag',
        category: 'swing',
        clubType: 'driver',
        viewAngle: 'down_the_line',
        daysAgo: 30,
      },
      {
        title: 'Jern 7 - Forbedring',
        description: 'Konsistent ball-turf kontakt nå',
        category: 'swing',
        clubType: 'iron_7',
        viewAngle: 'face_on',
        daysAgo: 25,
      },
      {
        title: 'Driver - Nylig',
        description: 'Solid swing, jobber med finpuss',
        category: 'swing',
        clubType: 'driver',
        viewAngle: 'down_the_line',
        daysAgo: 14,
      },
      {
        title: 'Jern 5 - Ny klubb',
        description: 'Første gang med lange jern',
        category: 'swing',
        clubType: 'iron_5',
        viewAngle: 'face_on',
        daysAgo: 7,
      },
      {
        title: 'Driver - Siste økt',
        description: 'Beste swing hittil!',
        category: 'swing',
        clubType: 'driver',
        viewAngle: 'down_the_line',
        daysAgo: 2,
      },

      // Putting progression
      {
        title: 'Putting - Start',
        description: 'Grunnleggende putting teknikk',
        category: 'putting',
        clubType: 'putter',
        viewAngle: 'face_on',
        daysAgo: 50,
      },
      {
        title: 'Putting - Linjekontroll',
        description: 'Fokus på å holde linjen',
        category: 'putting',
        clubType: 'putter',
        viewAngle: 'down_the_line',
        daysAgo: 35,
      },
      {
        title: 'Putting - Avstandskontroll',
        description: 'Jobber med lengdekontroll',
        category: 'putting',
        clubType: 'putter',
        viewAngle: 'face_on',
        daysAgo: 20,
      },
      {
        title: 'Putting - Konkurranseøkt',
        description: 'Putting under press',
        category: 'putting',
        clubType: 'putter',
        viewAngle: 'face_on',
        daysAgo: 5,
      },

      // Short game
      {
        title: 'Chip - Grunnlag',
        description: 'Basic chip shot teknikk',
        category: 'short_game',
        clubType: 'wedge_56',
        viewAngle: 'face_on',
        daysAgo: 40,
      },
      {
        title: 'Pitch - 50 meter',
        description: 'Pitch shot fra 50 meter',
        category: 'short_game',
        clubType: 'wedge_52',
        viewAngle: 'down_the_line',
        daysAgo: 28,
      },
      {
        title: 'Bunker - Sand save',
        description: 'Bunker shot teknikk',
        category: 'short_game',
        clubType: 'wedge_56',
        viewAngle: 'face_on',
        daysAgo: 15,
      },
      {
        title: 'Flop shot',
        description: 'Høy lob over hindring',
        category: 'short_game',
        clubType: 'wedge_60',
        viewAngle: 'face_on',
        daysAgo: 3,
      },
    ];

    // Check if videos already exist
    const existingCount = await prisma.video.count({
      where: { tenantId: tenant.id, playerId: player.id },
    });

    if (existingCount > 0) {
      console.log(`   ⚠️  ${existingCount} videos already exist, skipping`);
      return;
    }

    // Create videos
    for (const video of videoData) {
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - video.daysAgo);

      await prisma.video.create({
        data: {
          tenantId: tenant.id,
          playerId: player.id,
          uploadedById: playerUser.id,
          title: video.title,
          description: video.description,
          category: video.category,
          clubType: video.clubType,
          viewAngle: video.viewAngle,
          s3Key: `tenants/${tenant.id}/videos/${player.id}/${Date.now()}-${video.title.replace(/\s+/g, '_')}.mp4`,
          duration: 5 + Math.floor(Math.random() * 25), // 5-30 seconds
          fileSize: BigInt(1024 * 1024 * (5 + Math.floor(Math.random() * 45))), // 5-50 MB
          mimeType: 'video/mp4',
          status: 'ready',
          visibility: 'private',
          createdAt,
          updatedAt: createdAt,
          processedAt: createdAt,
        },
      });
    }

    console.log(`   ✅ Created ${videoData.length} test videos`);
    console.log('   📊 Videos by category:');
    console.log('      • Swing: 8 videos (60 days of progress)');
    console.log('      • Putting: 4 videos');
    console.log('      • Short Game: 4 videos');

  } catch (error) {
    console.error('❌ Error seeding videos:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedVideos()
    .then(() => {
      console.log('✅ Video seeding complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
