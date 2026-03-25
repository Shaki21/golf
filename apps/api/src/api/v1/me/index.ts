import { FastifyPluginAsync } from 'fastify';
import { authenticationError } from '../../../core/errors';
import prisma from '../../../core/db/prisma';

const meRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', {
    onRequest: [fastify.authenticate],
    handler: async (req, _reply) => {
      if (!req.user) {
        throw authenticationError();
      }

      // For players, return full profile data
      if (req.user.role === 'player' && req.user.playerId) {
        const player = await prisma.player.findUnique({
          where: { id: req.user.playerId },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            dateOfBirth: true,
            gender: true,
            category: true,
            averageScore: true,
            handicap: true,
            wagrRank: true,
            club: true,
            currentPeriod: true,
            weeklyTrainingHours: true,
            seasonStartDate: true,
            status: true,
            profileImageUrl: true,
            emergencyContact: true,
            medicalNotes: true,
            goals: true,
          },
        });

        // Check if player has completed onboarding (has intake form)
        const intake = await prisma.playerIntake.findFirst({
          where: {
            playerId: req.user.playerId,
            isComplete: true,
          },
          select: { isComplete: true },
        });

        return {
          id: req.user.id,
          playerId: req.user.playerId,
          email: req.user.email,
          role: req.user.role,
          firstName: player?.firstName || '',
          lastName: player?.lastName || '',
          phone: player?.phone,
          dateOfBirth: player?.dateOfBirth,
          gender: player?.gender,
          category: player?.category,
          averageScore: player?.averageScore ? Number(player.averageScore) : null,
          handicap: player?.handicap ? Number(player.handicap) : null,
          wagrRank: player?.wagrRank,
          club: player?.club,
          currentPeriod: player?.currentPeriod,
          weeklyTrainingHours: player?.weeklyTrainingHours,
          seasonStartDate: player?.seasonStartDate,
          status: player?.status,
          profileImageUrl: player?.profileImageUrl,
          emergencyContact: player?.emergencyContact,
          medicalNotes: player?.medicalNotes,
          goals: player?.goals,
          // Onboarding status
          onboardingComplete: intake?.isComplete || false,
          intakeComplete: intake?.isComplete || false,
        };
      }

      // For coaches
      if (req.user.role === 'coach') {
        const coach = await prisma.coach.findFirst({
          where: { userId: req.user.id },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            title: true,
            bio: true,
            profileImageUrl: true,
          },
        });

        return {
          id: req.user.id,
          coachId: coach?.id,
          email: req.user.email,
          role: req.user.role,
          firstName: coach?.firstName || '',
          lastName: coach?.lastName || '',
          phone: coach?.phone,
          title: coach?.title,
          bio: coach?.bio,
          profileImageUrl: coach?.profileImageUrl,
          onboardingComplete: true, // Coaches don't need onboarding
        };
      }

      // For admins and other roles
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          firstName: true,
          lastName: true,
        },
      });

      return {
        id: req.user.id,
        email: req.user.email,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        role: req.user.role,
        onboardingComplete: true, // Admins don't need onboarding
      };
    },
  });
};

export default meRoutes;
