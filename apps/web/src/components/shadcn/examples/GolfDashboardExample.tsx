// @ts-nocheck
/**
 * Golf Dashboard Example
 *
 * Demonstrates how to use shadcn/ui components to build
 * a premium golf coaching dashboard.
 */
import * as React from "react"
import {
  Target,
  TrendingUp,
  Calendar,
  Trophy,
  Flame,
  BarChart3,
  Clock
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Progress,
  Button,
  ScrollArea,
} from "../"
import {
  PlayerStatCard,
  SkillRadar,
  StreakBadge,
  GoalProgress,
  LeaderboardRow,
  TournamentCard,
  CategoryProgressRing,
  TrainingCategoryBadge,
} from "../golf"
import { PageTitle } from "../../typography"

// Mock data
const skillData = [
  { skill: "Drive", value: 75 },
  { skill: "Jern", value: 68 },
  { skill: "Wedge", value: 82 },
  { skill: "Putt", value: 71 },
  { skill: "Bunker", value: 55 },
  { skill: "Kurs", value: 78 },
]

const leaderboardData = [
  { rank: 1, name: "Emma Hansen", value: 2450, subtitle: "Klubb: Oslo GK" },
  { rank: 2, name: "Lars Nilsen", value: 2380, subtitle: "Klubb: Bergen GK" },
  { rank: 3, name: "Sofia Berg", value: 2290, subtitle: "Klubb: Trondheim GK" },
  { rank: 4, name: "Anders Kristiansen", value: 2150, subtitle: "Klubb: Holtsmark GK", isCurrentUser: true },
  { rank: 5, name: "Mia Olsen", value: 2080, subtitle: "Klubb: Stavanger GK" },
]

export const GolfDashboardExample: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header with streak */}
      <div className="flex items-center justify-between">
        <div>
          <PageTitle className="text-2xl font-bold text-text-primary" subtitle="Here is your training overview">Good morning, Anders!</PageTitle>
        </div>
        <StreakBadge count={14} size="lg" />
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PlayerStatCard
          label="Handicap"
          value="12.4"
          trend="down"
          trendLabel="-0.3"
          icon={<Target className="h-5 w-5" />}
          accentColor="success"
        />
        <PlayerStatCard
          label="Treningsøkter"
          value="23"
          suffix="denne måneden"
          trend="up"
          trendLabel="+15%"
          icon={<BarChart3 className="h-5 w-5" />}
          accentColor="primary"
        />
        <PlayerStatCard
          label="Neste turnering"
          value="3"
          suffix="dager igjen"
          icon={<Calendar className="h-5 w-5" />}
          accentColor="warning"
        />
        <PlayerStatCard
          label="Poeng"
          value="2,150"
          trend="up"
          trendLabel="+120"
          icon={<Trophy className="h-5 w-5" />}
          accentColor="success"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Skills & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Skill Radar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-ak-primary" />
                Ferdighetsoversikt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <SkillRadar
                  data={skillData}
                  size="lg"
                  showValues
                />
              </div>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Aktive mål</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <GoalProgress
                title="Reduser handicap til 10"
                current={12.4}
                target={10}
                unit="hcp"
                deadline="31. desember 2025"
                status="on_track"
                showCard={false}
              />
              <GoalProgress
                title="50 treningsøkter"
                current={23}
                target={50}
                unit="økter"
                deadline="30. juni 2025"
                status="behind"
                showCard={false}
              />
              <GoalProgress
                title="Putt under 32"
                current={34}
                target={32}
                unit="per runde"
                status="at_risk"
                showCard={false}
              />
            </CardContent>
          </Card>

          {/* Category Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Kategorifremgang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-6">
                <CategoryProgressRing category="fysisk" value={65} size="md" />
                <CategoryProgressRing category="teknikk" value={78} size="md" />
                <CategoryProgressRing category="slag" value={45} size="md" />
                <CategoryProgressRing category="spill" value={82} size="md" />
                <CategoryProgressRing category="turnering" value={55} size="md" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Leaderboard & Tournaments */}
        <div className="space-y-6">
          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-medal-gold" />
                Rangliste
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="monthly">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="monthly">Månedlig</TabsTrigger>
                  <TabsTrigger value="alltime">Totalt</TabsTrigger>
                </TabsList>
                <TabsContent value="monthly">
                  <ScrollArea className="h-[320px]">
                    <div className="space-y-2">
                      {leaderboardData.map((player) => (
                        <LeaderboardRow
                          key={player.rank}
                          rank={player.rank}
                          name={player.name}
                          value={player.value}
                          valueLabel="poeng"
                          subtitle={player.subtitle}
                          isCurrentUser={player.isCurrentUser}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="alltime">
                  <div className="text-center text-text-secondary py-8">
                    Laster totale resultater...
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Upcoming Tournament */}
          <TournamentCard
            name="Holtsmark Open 2025"
            date="15. januar 2025"
            location="Holtsmark Golfklubb"
            participants={42}
            maxParticipants={60}
            status="registered"
            format="Slagspill, 36 hull"
            onViewDetails={() => console.log("View details")}
          />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Hurtighandlinger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Logg treningsøkt
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Target className="h-4 w-4 mr-2" />
                Registrer testresultat
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Trophy className="h-4 w-4 mr-2" />
                Meld på turnering
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default GolfDashboardExample
