import * as React from "react"
import { Calendar, MapPin, Users, Trophy, Clock, ChevronRight } from "lucide-react"
import { cn } from "lib/utils"
import { Card, CardContent } from "../card"
import { Badge } from "../badge"
import { Button } from "../button"
import { SubSectionTitle } from "../../typography"

type TournamentStatus = "upcoming" | "ongoing" | "completed" | "registered"

interface TournamentCardProps {
  name: string
  date: string
  location: string
  participants?: number
  maxParticipants?: number
  status?: TournamentStatus
  position?: number
  score?: string
  format?: string
  imageUrl?: string
  onRegister?: () => void
  onViewDetails?: () => void
  className?: string
}

const statusConfig: Record<TournamentStatus, { label: string; variant: "default" | "success" | "warning" | "secondary" }> = {
  upcoming: { label: "Kommende", variant: "secondary" },
  ongoing: { label: "Pågår", variant: "warning" },
  completed: { label: "Avsluttet", variant: "default" },
  registered: { label: "Påmeldt", variant: "success" },
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  name,
  date,
  location,
  participants,
  maxParticipants,
  status = "upcoming",
  position,
  score,
  format,
  imageUrl,
  onRegister,
  onViewDetails,
  className,
}) => {
  const statusInfo = statusConfig[status]
  const isCompleted = status === "completed"
  const canRegister = status === "upcoming" && !position

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header with image or gradient */}
      <div
        className={cn(
          "relative h-24 bg-gradient-to-r from-ak-primary to-ak-primary-light",
          imageUrl && "bg-cover bg-center"
        )}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-3 right-3">
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
        {isCompleted && position && (
          <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
            <Trophy className="h-5 w-5 text-medal-gold" />
            <span className="font-bold">#{position}</span>
            {score && <span className="text-sm opacity-80">({score})</span>}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Title */}
          <div>
            <SubSectionTitle className="font-semibold text-text-primary text-lg">{name}</SubSectionTitle>
            {format && (
              <p className="text-sm text-text-secondary">{format}</p>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar className="h-4 w-4 text-text-tertiary" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <MapPin className="h-4 w-4 text-text-tertiary" />
              <span>{location}</span>
            </div>
            {participants !== undefined && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <Users className="h-4 w-4 text-text-tertiary" />
                <span>
                  {participants}
                  {maxParticipants && ` / ${maxParticipants}`} deltakere
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {canRegister && onRegister && (
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={onRegister}
              >
                Meld på
              </Button>
            )}
            {onViewDetails && (
              <Button
                variant={canRegister ? "outline" : "default"}
                size="sm"
                className={cn(!canRegister && "flex-1")}
                onClick={onViewDetails}
              >
                {canRegister ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <>
                    Se detaljer
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TournamentCard
