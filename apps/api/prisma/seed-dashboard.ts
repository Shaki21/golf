/**
 * ================================================================
 * Dashboard Seed Data - AK Golf Academy
 * ================================================================
 *
 * Seeds achievement definitions, player achievements, goals,
 * weekly stats, and chat data for testing the dashboard.
 * ================================================================
 */

import prisma from './client';

async function seedDashboardData() {
  console.log('Seeding dashboard data...');

  // Get a tenant and player
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) {
    console.log('No tenant found. Please run main seed first.');
    return;
  }

  const player = await prisma.player.findFirst({
    where: { tenantId: tenant.id },
  });

  if (!player) {
    console.log('No player found. Please run main seed first.');
    return;
  }

  console.log(`Seeding for player: ${player.firstName} ${player.lastName}`);

  // ============================================================================
  // 1. Achievement Definitions
  // ============================================================================
  console.log('Creating achievement definitions...');

  const achievementDefinitions = [
    // Streak achievements
    {
      code: 'streak_3',
      name: '3-dagers streak',
      description: 'Tren 3 dager pa rad',
      category: 'streak',
      icon: '🔥',
      tier: 'bronze',
      requirements: { type: 'streak', days: 3 },
      pointsValue: 10,
      sortOrder: 1,
    },
    {
      code: 'streak_7',
      name: '7-dagers streak',
      description: 'Tren 7 dager pa rad',
      category: 'streak',
      icon: '🏆',
      tier: 'gold',
      requirements: { type: 'streak', days: 7 },
      pointsValue: 50,
      sortOrder: 2,
    },
    {
      code: 'streak_14',
      name: '2-ukers streak',
      description: 'Tren 14 dager pa rad',
      category: 'streak',
      icon: '💎',
      tier: 'platinum',
      requirements: { type: 'streak', days: 14 },
      pointsValue: 100,
      sortOrder: 3,
    },
    // Milestone achievements
    {
      code: 'sessions_10',
      name: '10 okter',
      description: 'Fullfør 10 treningsokter',
      category: 'milestone',
      icon: '🎯',
      tier: 'bronze',
      requirements: { type: 'sessions', count: 10 },
      pointsValue: 20,
      sortOrder: 10,
    },
    {
      code: 'sessions_50',
      name: '50 okter',
      description: 'Fullfør 50 treningsokter',
      category: 'milestone',
      icon: '🎯',
      tier: 'silver',
      requirements: { type: 'sessions', count: 50 },
      pointsValue: 75,
      sortOrder: 11,
    },
    {
      code: 'sessions_100',
      name: '100 okter',
      description: 'Fullfør 100 treningsokter',
      category: 'milestone',
      icon: '🎯',
      tier: 'gold',
      requirements: { type: 'sessions', count: 100 },
      pointsValue: 150,
      sortOrder: 12,
    },
    // Hours achievements
    {
      code: 'hours_10',
      name: '10 timer',
      description: 'Tren i 10 timer totalt',
      category: 'milestone',
      icon: '⏱️',
      tier: 'bronze',
      requirements: { type: 'hours', total: 10 },
      pointsValue: 15,
      sortOrder: 20,
    },
    {
      code: 'hours_50',
      name: '50 timer',
      description: 'Tren i 50 timer totalt',
      category: 'milestone',
      icon: '💪',
      tier: 'silver',
      requirements: { type: 'hours', total: 50 },
      pointsValue: 60,
      sortOrder: 21,
    },
    {
      code: 'hours_100',
      name: '100 timer',
      description: 'Tren i 100 timer totalt',
      category: 'milestone',
      icon: '💪',
      tier: 'gold',
      requirements: { type: 'hours', total: 100 },
      pointsValue: 120,
      sortOrder: 22,
    },
    // Skill achievements
    {
      code: 'l5_master',
      name: 'L5 Master',
      description: 'Oppna L5 i en ferdighet',
      category: 'skill',
      icon: '⭐',
      tier: 'gold',
      requirements: { type: 'learning_phase', level: 'L5' },
      pointsValue: 200,
      sortOrder: 30,
    },
    {
      code: 'test_pass_5',
      name: 'Test Master',
      description: 'Besta 5 tester',
      category: 'skill',
      icon: '✅',
      tier: 'silver',
      requirements: { type: 'test_pass', count: 5 },
      pointsValue: 80,
      sortOrder: 31,
    },
  ];

  for (const def of achievementDefinitions) {
    await prisma.achievementDefinition.upsert({
      where: { code: def.code },
      update: def,
      create: def,
    });
  }
  console.log(`Created ${achievementDefinitions.length} achievement definitions`);

  // ============================================================================
  // 2. Player Achievements
  // ============================================================================
  console.log('Creating player achievements...');

  const achievements = await prisma.achievementDefinition.findMany({
    where: { code: { in: ['streak_7', 'sessions_100', 'hours_50', 'l5_master'] } },
  });

  const now = new Date();
  for (const achievement of achievements) {
    await prisma.playerAchievement.upsert({
      where: {
        playerId_achievementId: {
          playerId: player.id,
          achievementId: achievement.id,
        },
      },
      update: {},
      create: {
        playerId: player.id,
        achievementId: achievement.id,
        earnedAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        context: {
          streak: achievement.code === 'streak_7' ? 7 : undefined,
        },
        notified: true,
      },
    });
  }
  console.log(`Created ${achievements.length} player achievements`);

  // ============================================================================
  // 3. Player Goals
  // ============================================================================
  console.log('Creating player goals...');

  const goals = [
    {
      playerId: player.id,
      title: 'Reduser snittscore til under 73',
      description: 'Forbedre snittscore gjennom konsistent trening',
      goalType: 'score',
      timeframe: 'medium',
      targetValue: 73,
      currentValue: 74.2,
      startValue: 76,
      unit: 'score',
      progressPercent: 65,
      startDate: new Date(now.getFullYear(), 0, 1),
      targetDate: new Date(now.getFullYear() + 1, 7, 1),
      icon: '🎯',
      status: 'active',
    },
    {
      playerId: player.id,
      title: 'L5 automatikk pa wedge-slag',
      description: 'Oppna L5 nivå med automatikk på wedge-slag',
      goalType: 'technique',
      timeframe: 'long',
      progressPercent: 45,
      startDate: new Date(now.getFullYear(), 0, 1),
      targetDate: new Date(now.getFullYear() + 1, 3, 1),
      icon: '⛳',
      status: 'active',
    },
    {
      playerId: player.id,
      title: '1200 treningstimer i sesongen',
      description: 'Total treningstid for sesongen',
      goalType: 'physical',
      timeframe: 'long',
      targetValue: 1200,
      currentValue: 456,
      startValue: 0,
      unit: 'timer',
      progressPercent: 38,
      startDate: new Date(now.getFullYear(), 0, 1),
      targetDate: new Date(now.getFullYear(), 9, 31),
      icon: '💪',
      status: 'active',
    },
    {
      playerId: player.id,
      title: 'Topp 10 i NM Junior',
      description: 'Oppna topp 10 plassering i NM Junior',
      goalType: 'competition',
      timeframe: 'medium',
      progressPercent: 55,
      startDate: new Date(now.getFullYear(), 0, 1),
      targetDate: new Date(now.getFullYear(), 6, 15),
      icon: '🏆',
      status: 'active',
    },
  ];

  for (const goal of goals) {
    await prisma.playerGoal.create({
      data: goal,
    });
  }
  console.log(`Created ${goals.length} player goals`);

  // ============================================================================
  // 4. Weekly Training Stats
  // ============================================================================
  console.log('Creating weekly training stats...');

  const weekNumber = getWeekNumber(now);
  const weekStart = getWeekStart(now);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  await prisma.weeklyTrainingStats.upsert({
    where: {
      playerId_year_weekNumber: {
        playerId: player.id,
        year: now.getFullYear(),
        weekNumber,
      },
    },
    update: {
      completedSessions: 12,
      actualMinutes: 870, // 14.5 hours
      completionRate: 92,
      sessionsChange: 2,
      minutesChange: 90, // +1.5 hours
      completionRateChange: 5,
      currentStreak: 7,
      period: 'G',
      sessionTypeBreakdown: {
        langspill: 240,
        kortspill: 180,
        putting: 150,
        fysisk: 180,
        spill: 120,
      },
      learningPhaseMinutes: {
        L1: 30,
        L2: 60,
        L3: 120,
        L4: 360,
        L5: 300,
      },
      avgQuality: 4.2,
      avgFocus: 4.0,
    },
    create: {
      playerId: player.id,
      year: now.getFullYear(),
      weekNumber,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      plannedSessions: 13,
      completedSessions: 12,
      skippedSessions: 1,
      completionRate: 92,
      plannedMinutes: 945,
      actualMinutes: 870,
      sessionsChange: 2,
      minutesChange: 90,
      completionRateChange: 5,
      currentStreak: 7,
      longestStreakInWeek: 7,
      period: 'G',
      sessionTypeBreakdown: {
        langspill: 240,
        kortspill: 180,
        putting: 150,
        fysisk: 180,
        spill: 120,
      },
      learningPhaseMinutes: {
        L1: 30,
        L2: 60,
        L3: 120,
        L4: 360,
        L5: 300,
      },
      avgQuality: 4.2,
      avgFocus: 4.0,
      avgIntensity: 3.8,
    },
  });
  console.log('Created weekly training stats');

  // ============================================================================
  // 5. Chat Groups and Messages
  // ============================================================================
  console.log('Creating chat groups and messages...');

  // Get a coach
  const coach = await prisma.coach.findFirst({
    where: { tenantId: tenant.id },
  });

  if (coach) {
    // Coach-player chat
    const coachPlayerChat = await prisma.chatGroup.create({
      data: {
        tenantId: tenant.id,
        name: `${coach.firstName} ${coach.lastName}`,
        groupType: 'coach_player',
        avatarInitials: coach.firstName.charAt(0) + coach.lastName.charAt(0),
        avatarColor: '#1A3D2E',
        createdBy: coach.id,
      },
    });

    // Add members
    await prisma.chatGroupMember.createMany({
      data: [
        {
          groupId: coachPlayerChat.id,
          memberType: 'coach',
          memberId: coach.id,
          role: 'admin',
        },
        {
          groupId: coachPlayerChat.id,
          memberType: 'player',
          memberId: player.id,
          role: 'member',
          unreadCount: 1,
        },
      ],
    });

    // Add messages
    await prisma.chatMessage.create({
      data: {
        groupId: coachPlayerChat.id,
        senderType: 'coach',
        senderId: coach.id,
        content: 'Husk a ta med video fra treningsokten i dag!',
      },
    });

    await prisma.chatGroup.update({
      where: { id: coachPlayerChat.id },
      data: { lastMessageAt: new Date() },
    });

    // Team chat
    const teamChat = await prisma.chatGroup.create({
      data: {
        tenantId: tenant.id,
        name: 'Team Norway',
        groupType: 'team',
        avatarInitials: 'TN',
        avatarColor: '#C9A227',
        createdBy: coach.id,
      },
    });

    await prisma.chatGroupMember.create({
      data: {
        groupId: teamChat.id,
        memberType: 'player',
        memberId: player.id,
        role: 'member',
        unreadCount: 1,
      },
    });

    await prisma.chatMessage.create({
      data: {
        groupId: teamChat.id,
        senderType: 'player',
        senderId: player.id,
        content: 'Noen som skal trene i morgen formiddag?',
      },
    });

    await prisma.chatGroup.update({
      where: { id: teamChat.id },
      data: { lastMessageAt: new Date(now.getTime() - 60 * 60 * 1000) },
    });

    // Academy chat
    const academyChat = await prisma.chatGroup.create({
      data: {
        tenantId: tenant.id,
        name: 'AK Golf Academy',
        groupType: 'academy',
        avatarInitials: 'AK',
        avatarColor: '#1A3D2E',
        createdBy: coach.id,
      },
    });

    await prisma.chatGroupMember.create({
      data: {
        groupId: academyChat.id,
        memberType: 'player',
        memberId: player.id,
        role: 'member',
        unreadCount: 0,
      },
    });

    await prisma.chatMessage.create({
      data: {
        groupId: academyChat.id,
        senderType: 'system',
        content: 'Ukentlig oppsummering er klar for gjennomgang',
      },
    });

    await prisma.chatGroup.update({
      where: { id: academyChat.id },
      data: { lastMessageAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    });

    console.log('Created 3 chat groups with messages');
  }

  console.log('Dashboard seed completed!');
}

// Helper functions
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

seedDashboardData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
