import prisma from './src/core/db/prisma';

async function main() {
  // Find the demo coach
  const coach = await prisma.coach.findFirst({
    where: { email: 'coach@demo.com' }
  });

  if (!coach) {
    console.log('Demo coach not found');
    return;
  }

  console.log('Found coach:', coach.id, coach.firstName, coach.lastName);

  // Delete existing availability
  const deleted = await prisma.availability.deleteMany({
    where: { coachId: coach.id }
  });
  console.log('Deleted existing availability:', deleted.count);

  // Create availability for Monday-Saturday
  const today = new Date();
  const validFrom = new Date(today.getFullYear(), today.getMonth(), 1);

  const slots = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '12:00', slotDuration: 60 },
    { dayOfWeek: 1, startTime: '13:00', endTime: '17:00', slotDuration: 60 },
    { dayOfWeek: 2, startTime: '09:00', endTime: '12:00', slotDuration: 60 },
    { dayOfWeek: 2, startTime: '13:00', endTime: '17:00', slotDuration: 60 },
    { dayOfWeek: 3, startTime: '09:00', endTime: '12:00', slotDuration: 60 },
    { dayOfWeek: 3, startTime: '13:00', endTime: '17:00', slotDuration: 60 },
    { dayOfWeek: 4, startTime: '09:00', endTime: '12:00', slotDuration: 60 },
    { dayOfWeek: 4, startTime: '13:00', endTime: '17:00', slotDuration: 60 },
    { dayOfWeek: 5, startTime: '09:00', endTime: '12:00', slotDuration: 60 },
    { dayOfWeek: 5, startTime: '14:00', endTime: '16:00', slotDuration: 60 },
    { dayOfWeek: 6, startTime: '10:00', endTime: '14:00', slotDuration: 60 },
  ];

  for (const slot of slots) {
    await prisma.availability.create({
      data: {
        coachId: coach.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        slotDuration: slot.slotDuration,
        maxBookings: 1,
        validFrom: validFrom,
        isActive: true,
      }
    });
  }

  console.log('Created', slots.length, 'availability slots');

  // Verify
  const count = await prisma.availability.count({ where: { coachId: coach.id } });
  console.log('Total availability slots for coach:', count);
}

main().catch(console.error).finally(() => process.exit(0));
