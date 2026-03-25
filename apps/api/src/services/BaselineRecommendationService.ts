import { getPrismaClient } from '../core/db/prisma';

const prisma = getPrismaClient();

interface RecommendationResult {
  recommended: 'season_average' | 'last_8_rounds';
  confidence: number; // 0-100%
  reasoning: string[];
  metrics: {
    last8StdDev: number;
    seasonStdDev: number;
    trendDirection: 'improving' | 'declining' | 'stable';
    trendStrength: number;
    consistencyScore: number;
  };
}

export class BaselineRecommendationService {
  /**
   * Analyser spillerens data og anbefal baseline
   */
  async getRecommendation(playerId: string, season: number): Promise<RecommendationResult> {
    // Hent alle runder fra forrige sesong
    const previousSeason = season - 1;
    const allRounds = await this.getSeasonRounds(playerId, previousSeason);

    if (allRounds.length < 8) {
      return this.defaultRecommendation('Not enough data');
    }

    // Hent siste 8 runder
    const last8Rounds = allRounds.slice(-8);

    // Beregn nøkkelmetrikker
    const metrics = this.calculateMetrics(allRounds, last8Rounds);

    // Generer anbefaling basert på analyse
    return this.generateRecommendation(metrics);
  }

  private async getSeasonRounds(playerId: string, season: number) {
    // Simulert - hent fra faktisk database
    const rounds = await prisma.$queryRaw`
      SELECT score, date
      FROM rounds
      WHERE player_id = ${playerId}
        AND EXTRACT(YEAR FROM date) = ${season}
      ORDER BY date ASC
    `;

    return rounds as Array<{ score: number; date: Date }>;
  }

  private calculateMetrics(allRounds: Array<{ score: number; date: Date }>, last8Rounds: Array<{ score: number; date: Date }>) {
    // Standardavvik for siste 8
    const last8Scores = last8Rounds.map(r => r.score);
    const last8Avg = this.average(last8Scores);
    const last8StdDev = this.standardDeviation(last8Scores);

    // Standardavvik for hele sesongen
    const allScores = allRounds.map(r => r.score);
    const seasonAvg = this.average(allScores);
    const seasonStdDev = this.standardDeviation(allScores);

    // Trend-analyse (lineær regresjon på siste 8)
    const trend = this.calculateTrend(last8Scores);

    // Konsistens-score (jo lavere std.dev, jo høyere score)
    const consistencyScore = Math.max(0, 100 - (last8StdDev * 10));

    return {
      last8StdDev,
      seasonStdDev,
      last8Avg,
      seasonAvg,
      trendDirection: trend.direction,
      trendStrength: trend.strength,
      consistencyScore
    };
  }

  private generateRecommendation(metrics: {
    last8StdDev: number;
    seasonStdDev: number;
    last8Avg: number;
    seasonAvg: number;
    trendDirection: 'improving' | 'declining' | 'stable';
    trendStrength: number;
    consistencyScore: number;
  }): RecommendationResult {
    const reasoning: string[] = [];
    let score = 0; // Poeng-system: positiv = last_8_rounds, negativ = season_average

    // Kriterium 1: Konsistens (viktigst)
    if (metrics.last8StdDev < 2.0) {
      score += 3;
      reasoning.push(`Meget høy konsistens i siste 8 runder (±${metrics.last8StdDev.toFixed(1)} slag)`);
    } else if (metrics.last8StdDev < 3.0) {
      score += 2;
      reasoning.push(`God konsistens i siste 8 runder (±${metrics.last8StdDev.toFixed(1)} slag)`);
    } else if (metrics.last8StdDev > 4.0) {
      score -= 2;
      reasoning.push(`Lav konsistens i siste 8 runder (±${metrics.last8StdDev.toFixed(1)} slag)`);
    }

    // Kriterium 2: Trend (viktig)
    if (metrics.trendDirection === 'improving' && metrics.trendStrength > 0.5) {
      score += 3;
      reasoning.push(`Tydelig forbedringstrend de siste rundene (-${metrics.trendStrength.toFixed(1)} slag/runde)`);
    } else if (metrics.trendDirection === 'declining') {
      score -= 2;
      reasoning.push(`Nedadgående trend de siste rundene (+${Math.abs(metrics.trendStrength).toFixed(1)} slag/runde)`);
    }

    // Kriterium 3: Forskjell mellom siste 8 og sesongsnitt
    const scoreDiff = metrics.seasonAvg - metrics.last8Avg;
    if (scoreDiff > 2.0) {
      score += 2;
      reasoning.push(`Siste 8 runder betydelig bedre enn sesongsnitt (-${scoreDiff.toFixed(1)} slag)`);
    } else if (scoreDiff < -1.0) {
      score -= 2;
      reasoning.push(`Siste 8 runder svakere enn sesongsnitt (+${Math.abs(scoreDiff).toFixed(1)} slag)`);
    }

    // Kriterium 4: Konsistens-score
    if (metrics.consistencyScore > 80) {
      score += 1;
      reasoning.push(`Høy konsistens-score: ${metrics.consistencyScore.toFixed(0)}%`);
    }

    // Generer anbefaling
    const recommended = score > 0 ? 'last_8_rounds' : 'season_average';
    const confidence = Math.min(100, Math.abs(score) * 15 + 50);

    // Legg til konklusjon
    if (recommended === 'last_8_rounds') {
      reasoning.push(`✅ Anbefaling: Bruk siste 8 runder som baseline (${confidence}% sikkerhet)`);
    } else {
      reasoning.push(`✅ Anbefaling: Bruk sesongsnitt som baseline (${confidence}% sikkerhet)`);
    }

    return {
      recommended,
      confidence,
      reasoning,
      metrics: {
        last8StdDev: metrics.last8StdDev,
        seasonStdDev: metrics.seasonStdDev,
        trendDirection: metrics.trendDirection,
        trendStrength: metrics.trendStrength,
        consistencyScore: metrics.consistencyScore
      }
    };
  }

  private defaultRecommendation(reason: string): RecommendationResult {
    return {
      recommended: 'season_average',
      confidence: 50,
      reasoning: [
        reason,
        'Standard anbefaling: Bruk sesongsnitt'
      ],
      metrics: {
        last8StdDev: 0,
        seasonStdDev: 0,
        trendDirection: 'stable',
        trendStrength: 0,
        consistencyScore: 0
      }
    };
  }

  // Hjelpemetoder
  private average(numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private standardDeviation(numbers: number[]): number {
    const avg = this.average(numbers);
    const squareDiffs = numbers.map(n => Math.pow(n - avg, 2));
    return Math.sqrt(this.average(squareDiffs));
  }

  private calculateTrend(scores: number[]): { direction: 'improving' | 'declining' | 'stable', strength: number } {
    // Enkel lineær regresjon
    const n = scores.length;
    const xSum = (n * (n + 1)) / 2; // Sum av 1+2+3+...+n
    const ySum = scores.reduce((a, b) => a + b, 0);
    const xySum = scores.reduce((sum, y, i) => sum + y * (i + 1), 0);
    const xSquareSum = (n * (n + 1) * (2 * n + 1)) / 6;

    const slope = (n * xySum - xSum * ySum) / (n * xSquareSum - xSum * xSum);

    let direction: 'improving' | 'declining' | 'stable';
    if (slope < -0.3) direction = 'improving'; // Negativ slope = lavere score = bedre
    else if (slope > 0.3) direction = 'declining';
    else direction = 'stable';

    return {
      direction,
      strength: Math.abs(slope)
    };
  }
}
