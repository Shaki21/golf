/**
 * DataGolf Pro Players Seed
 * Demo data for pro player comparison feature
 */

import prisma from '../client';


// Top 30 pro golfers with realistic SG data
const proPlayers = [
  { dataGolfId: 'scottie-scheffler', playerName: 'Scottie Scheffler', tour: 'pga', sgTotal: 2.45, sgOffTee: 0.65, sgApproach: 1.10, sgAroundGreen: 0.35, sgPutting: 0.35 },
  { dataGolfId: 'rory-mcilroy', playerName: 'Rory McIlroy', tour: 'pga', sgTotal: 2.10, sgOffTee: 0.95, sgApproach: 0.75, sgAroundGreen: 0.20, sgPutting: 0.20 },
  { dataGolfId: 'jon-rahm', playerName: 'Jon Rahm', tour: 'pga', sgTotal: 2.05, sgOffTee: 0.55, sgApproach: 0.85, sgAroundGreen: 0.30, sgPutting: 0.35 },
  { dataGolfId: 'xander-schauffele', playerName: 'Xander Schauffele', tour: 'pga', sgTotal: 1.95, sgOffTee: 0.45, sgApproach: 0.80, sgAroundGreen: 0.35, sgPutting: 0.35 },
  { dataGolfId: 'viktor-hovland', playerName: 'Viktor Hovland', tour: 'pga', sgTotal: 1.85, sgOffTee: 0.50, sgApproach: 0.90, sgAroundGreen: 0.25, sgPutting: 0.20 },
  { dataGolfId: 'collin-morikawa', playerName: 'Collin Morikawa', tour: 'pga', sgTotal: 1.80, sgOffTee: 0.25, sgApproach: 1.05, sgAroundGreen: 0.30, sgPutting: 0.20 },
  { dataGolfId: 'patrick-cantlay', playerName: 'Patrick Cantlay', tour: 'pga', sgTotal: 1.75, sgOffTee: 0.30, sgApproach: 0.70, sgAroundGreen: 0.35, sgPutting: 0.40 },
  { dataGolfId: 'ludvig-aberg', playerName: 'Ludvig Aberg', tour: 'pga', sgTotal: 1.70, sgOffTee: 0.60, sgApproach: 0.65, sgAroundGreen: 0.25, sgPutting: 0.20 },
  { dataGolfId: 'wyndham-clark', playerName: 'Wyndham Clark', tour: 'pga', sgTotal: 1.65, sgOffTee: 0.55, sgApproach: 0.60, sgAroundGreen: 0.25, sgPutting: 0.25 },
  { dataGolfId: 'matt-fitzpatrick', playerName: 'Matt Fitzpatrick', tour: 'pga', sgTotal: 1.60, sgOffTee: 0.20, sgApproach: 0.75, sgAroundGreen: 0.35, sgPutting: 0.30 },
  { dataGolfId: 'tiger-woods', playerName: 'Tiger Woods', tour: 'pga', sgTotal: 1.55, sgOffTee: 0.40, sgApproach: 0.55, sgAroundGreen: 0.30, sgPutting: 0.30 },
  { dataGolfId: 'jordan-spieth', playerName: 'Jordan Spieth', tour: 'pga', sgTotal: 1.50, sgOffTee: 0.25, sgApproach: 0.50, sgAroundGreen: 0.35, sgPutting: 0.40 },
  { dataGolfId: 'brooks-koepka', playerName: 'Brooks Koepka', tour: 'pga', sgTotal: 1.45, sgOffTee: 0.50, sgApproach: 0.55, sgAroundGreen: 0.20, sgPutting: 0.20 },
  { dataGolfId: 'dustin-johnson', playerName: 'Dustin Johnson', tour: 'pga', sgTotal: 1.40, sgOffTee: 0.70, sgApproach: 0.45, sgAroundGreen: 0.15, sgPutting: 0.10 },
  { dataGolfId: 'justin-thomas', playerName: 'Justin Thomas', tour: 'pga', sgTotal: 1.35, sgOffTee: 0.35, sgApproach: 0.55, sgAroundGreen: 0.25, sgPutting: 0.20 },
  { dataGolfId: 'tommy-fleetwood', playerName: 'Tommy Fleetwood', tour: 'euro', sgTotal: 1.30, sgOffTee: 0.45, sgApproach: 0.50, sgAroundGreen: 0.20, sgPutting: 0.15 },
  { dataGolfId: 'hideki-matsuyama', playerName: 'Hideki Matsuyama', tour: 'pga', sgTotal: 1.25, sgOffTee: 0.30, sgApproach: 0.60, sgAroundGreen: 0.20, sgPutting: 0.15 },
  { dataGolfId: 'cameron-smith', playerName: 'Cameron Smith', tour: 'pga', sgTotal: 1.20, sgOffTee: 0.20, sgApproach: 0.40, sgAroundGreen: 0.25, sgPutting: 0.35 },
  { dataGolfId: 'shane-lowry', playerName: 'Shane Lowry', tour: 'euro', sgTotal: 1.15, sgOffTee: 0.25, sgApproach: 0.45, sgAroundGreen: 0.25, sgPutting: 0.20 },
  { dataGolfId: 'tyrrell-hatton', playerName: 'Tyrrell Hatton', tour: 'euro', sgTotal: 1.10, sgOffTee: 0.30, sgApproach: 0.50, sgAroundGreen: 0.15, sgPutting: 0.15 },
  { dataGolfId: 'bryson-dechambeau', playerName: 'Bryson DeChambeau', tour: 'pga', sgTotal: 1.05, sgOffTee: 0.75, sgApproach: 0.35, sgAroundGreen: -0.05, sgPutting: 0.00 },
  { dataGolfId: 'tony-finau', playerName: 'Tony Finau', tour: 'pga', sgTotal: 1.00, sgOffTee: 0.45, sgApproach: 0.40, sgAroundGreen: 0.10, sgPutting: 0.05 },
  { dataGolfId: 'max-homa', playerName: 'Max Homa', tour: 'pga', sgTotal: 0.95, sgOffTee: 0.40, sgApproach: 0.35, sgAroundGreen: 0.10, sgPutting: 0.10 },
  { dataGolfId: 'sam-burns', playerName: 'Sam Burns', tour: 'pga', sgTotal: 0.90, sgOffTee: 0.35, sgApproach: 0.30, sgAroundGreen: 0.15, sgPutting: 0.10 },
  { dataGolfId: 'keegan-bradley', playerName: 'Keegan Bradley', tour: 'pga', sgTotal: 0.85, sgOffTee: 0.30, sgApproach: 0.35, sgAroundGreen: 0.10, sgPutting: 0.10 },
  { dataGolfId: 'phil-mickelson', playerName: 'Phil Mickelson', tour: 'pga', sgTotal: 0.80, sgOffTee: 0.25, sgApproach: 0.30, sgAroundGreen: 0.15, sgPutting: 0.10 },
  { dataGolfId: 'rickie-fowler', playerName: 'Rickie Fowler', tour: 'pga', sgTotal: 0.75, sgOffTee: 0.30, sgApproach: 0.25, sgAroundGreen: 0.10, sgPutting: 0.10 },
  { dataGolfId: 'sungjae-im', playerName: 'Sungjae Im', tour: 'pga', sgTotal: 0.70, sgOffTee: 0.20, sgApproach: 0.30, sgAroundGreen: 0.10, sgPutting: 0.10 },
  { dataGolfId: 'robert-macintyre', playerName: 'Robert MacIntyre', tour: 'euro', sgTotal: 0.65, sgOffTee: 0.25, sgApproach: 0.25, sgAroundGreen: 0.10, sgPutting: 0.05 },
  { dataGolfId: 'sepp-straka', playerName: 'Sepp Straka', tour: 'pga', sgTotal: 0.60, sgOffTee: 0.20, sgApproach: 0.25, sgAroundGreen: 0.10, sgPutting: 0.05 },
];

export async function seedDataGolfPlayers(): Promise<void> {
  console.log('Seeding DataGolf pro players...');

  let created = 0;
  let updated = 0;

  for (const player of proPlayers) {
    const existing = await prisma.dataGolfPlayer.findUnique({
      where: { dataGolfId: player.dataGolfId },
    });

    if (existing) {
      await prisma.dataGolfPlayer.update({
        where: { dataGolfId: player.dataGolfId },
        data: {
          playerName: player.playerName,
          tour: player.tour,
          sgTotal: player.sgTotal,
          sgOffTee: player.sgOffTee,
          sgApproach: player.sgApproach,
          sgAroundGreen: player.sgAroundGreen,
          sgPutting: player.sgPutting,
          season: 2024,
          lastSynced: new Date(),
          updatedAt: new Date(),
        },
      });
      updated++;
    } else {
      await prisma.dataGolfPlayer.create({
        data: {
          dataGolfId: player.dataGolfId,
          playerName: player.playerName,
          tour: player.tour,
          sgTotal: player.sgTotal,
          sgOffTee: player.sgOffTee,
          sgApproach: player.sgApproach,
          sgAroundGreen: player.sgAroundGreen,
          sgPutting: player.sgPutting,
          season: 2024,
          lastSynced: new Date(),
        },
      });
      created++;
    }
  }

  console.log(`DataGolf players seeded: ${created} created, ${updated} updated`);
}

// Run directly if called as script
if (require.main === module) {
  seedDataGolfPlayers()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error seeding DataGolf players:', err);
      process.exit(1);
    });
}
