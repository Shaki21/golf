// @ts-nocheck
/**
 * Dashboard Example using shadcn/ui components
 *
 * This shows how to combine shadcn/ui components with your existing
 * TIER Golf design system to create polished, v0-style interfaces.
 */

import React from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '../card'
import { Button } from '../button'
import { Badge } from '../badge'
import { Avatar, AvatarImage, AvatarFallback } from '../avatar'
import { Input } from '../input'
import { Separator } from '../separator'
import { Skeleton } from '../skeleton'
import { Play, TrendingUp, Calendar, Trophy } from 'lucide-react'
import { PageTitle, SubSectionTitle } from '../../typography'

// Example: Player Profile Card (v0-style)
interface PlayerProfileCardProps {
  name?: string
  club?: string
  category?: string
  avatarUrl?: string
  stats?: { sessions: number; hours: number; streak: number }
}

export const PlayerProfileCard = ({
  name = "Anders Kristiansen",
  club = "Holtsmark Golf",
  category = "B",
  avatarUrl,
  stats = { sessions: 47, hours: 128, streak: 12 }
}: PlayerProfileCardProps) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <Card className="overflow-hidden">
      {/* Hero Banner (v0-style gradient) */}
      <div className="h-24 bg-gradient-to-r from-ak-primary to-ak-primary-light" />

      <CardHeader className="-mt-12">
        <div className="flex items-end gap-4">
          <Avatar size="xl" className="border-4 border-white shadow-lg">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={name} />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
          <div className="pb-2">
            <CardTitle className="text-xl">{name}</CardTitle>
            <CardDescription>{club}</CardDescription>
          </div>
          <Badge variant="categoryB" className="ml-auto mb-2">
            Kategori {category}
          </Badge>
        </div>
      </CardHeader>

      <Separator />

      {/* Stats Row */}
      <CardContent className="pt-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-text-primary">{stats.sessions}</p>
            <p className="text-sm text-text-secondary">Økter</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-text-primary">{stats.hours}t</p>
            <p className="text-sm text-text-secondary">Timer</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-ak-primary">{stats.streak}</p>
            <p className="text-sm text-text-secondary">Streak</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button variant="default" className="flex-1">
          <Play className="h-4 w-4" />
          Start økt
        </Button>
        <Button variant="outline" className="flex-1">
          <Calendar className="h-4 w-4" />
          Kalender
        </Button>
      </CardFooter>
    </Card>
  )
}

// Example: Stats Card Grid (v0-style)
export const StatsCardGrid = () => {
  const stats = [
    { label: "Økter denne uke", value: "5", change: "+2", trend: "up", icon: Calendar },
    { label: "Timer trent", value: "12.5", change: "+3.5", trend: "up", icon: TrendingUp },
    { label: "Neste turnering", value: "14", suffix: "dager", icon: Trophy },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              {stat.label}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-text-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stat.value}
              {stat.suffix && <span className="text-sm font-normal text-text-secondary ml-1">{stat.suffix}</span>}
            </div>
            {stat.change && (
              <p className="text-xs text-ak-success mt-1">
                {stat.change} fra forrige uke
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Example: Loading State
export const LoadingCard = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-3 w-[150px]" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </CardContent>
  </Card>
)

// Example: Quick Actions Card
export const QuickActionsCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Hurtighandlinger</CardTitle>
      <CardDescription>Kom raskt i gang med treningen</CardDescription>
    </CardHeader>
    <CardContent className="grid gap-2">
      <Button variant="default" className="justify-start">
        <Play className="h-4 w-4" />
        Start treningsøkt
      </Button>
      <Button variant="secondary" className="justify-start">
        <Calendar className="h-4 w-4" />
        Se ukesplan
      </Button>
      <Button variant="ghost" className="justify-start">
        <TrendingUp className="h-4 w-4" />
        Vis fremgang
      </Button>
    </CardContent>
  </Card>
)

// Example: Form Card
export const ContactFormCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Kontakt trener</CardTitle>
      <CardDescription>Send en melding til treneren din</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">Emne</label>
        <Input placeholder="Hva gjelder det?" />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-primary">Melding</label>
        <textarea
          className="flex min-h-[100px] w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ak-primary"
          placeholder="Skriv meldingen din her..."
        />
      </div>
    </CardContent>
    <CardFooter>
      <Button className="w-full">Send melding</Button>
    </CardFooter>
  </Card>
)

// Main Example Component
const DashboardExample = () => {
  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <PageTitle className="text-2xl font-bold text-text-primary" subtitle="Disse komponentene bruker TIER Golf design tokens og kan brukes direkte i appen.">
        shadcn/ui Integrasjonseksempler
      </PageTitle>

      <div className="grid gap-6 lg:grid-cols-2">
        <PlayerProfileCard />
        <QuickActionsCard />
      </div>

      <StatsCardGrid />

      <div className="grid gap-6 lg:grid-cols-2">
        <ContactFormCard />
        <div className="space-y-4">
          <SubSectionTitle className="font-semibold text-text-primary">Loading States</SubSectionTitle>
          <LoadingCard />
        </div>
      </div>
    </div>
  )
}

export default DashboardExample
