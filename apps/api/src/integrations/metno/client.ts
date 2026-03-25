/**
 * MET Norway Weather API Client
 * https://api.met.no/ - Free weather data from Norwegian Meteorological Institute
 *
 * Provides weather forecasts for any location, with best accuracy for Nordic regions.
 * Locationforecast gives 9-10 day forecasts with hourly resolution for first 2-3 days.
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../../utils/logger';

const METNO_API_BASE = 'https://api.met.no/weatherapi';

// User-Agent is required by MET Norway API
const USER_AGENT = 'IUP-Golf-Academy/1.0 github.com/iup-golf';

export interface WeatherTimeseries {
  time: string;
  data: {
    instant: {
      details: {
        air_temperature: number;
        wind_from_direction: number;
        wind_speed: number;
        wind_speed_of_gust?: number;
        relative_humidity: number;
        air_pressure_at_sea_level?: number;
        cloud_area_fraction?: number;
        dew_point_temperature?: number;
        fog_area_fraction?: number;
        ultraviolet_index_clear_sky?: number;
      };
    };
    next_1_hours?: {
      summary: { symbol_code: string };
      details: {
        precipitation_amount: number;
        precipitation_amount_max?: number;
        precipitation_amount_min?: number;
        probability_of_precipitation?: number;
      };
    };
    next_6_hours?: {
      summary: { symbol_code: string };
      details: {
        precipitation_amount: number;
        air_temperature_max?: number;
        air_temperature_min?: number;
      };
    };
    next_12_hours?: {
      summary: { symbol_code: string };
      details: {
        probability_of_precipitation?: number;
      };
    };
  };
}

export interface LocationForecastResponse {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number, number]; // [lon, lat, altitude]
  };
  properties: {
    meta: {
      updated_at: string;
      units: {
        air_pressure_at_sea_level: string;
        air_temperature: string;
        cloud_area_fraction: string;
        precipitation_amount: string;
        relative_humidity: string;
        wind_from_direction: string;
        wind_speed: string;
      };
    };
    timeseries: WeatherTimeseries[];
  };
}

export interface GolfWeatherData {
  location: {
    lat: number;
    lng: number;
    altitude?: number;
  };
  updatedAt: string;
  current: {
    time: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windGust: number | null;
    windDirection: number;
    windDirectionText: string;
    precipitation: number;
    precipitationProbability: number | null;
    cloudCover: number | null;
    uvIndex: number | null;
    symbol: string;
    description: string;
  };
  hourly: Array<{
    time: string;
    temperature: number;
    windSpeed: number;
    windGust: number | null;
    windDirection: number;
    windDirectionText: string;
    precipitation: number;
    precipitationProbability: number | null;
    symbol: string;
  }>;
  daily: Array<{
    date: string;
    temperatureMax: number;
    temperatureMin: number;
    precipitation: number;
    symbol: string;
  }>;
  golfConditions: {
    playability: 'excellent' | 'good' | 'fair' | 'poor' | 'unplayable';
    score: number; // 0-100
    factors: {
      wind: { score: number; description: string };
      rain: { score: number; description: string };
      temperature: { score: number; description: string };
    };
    recommendation: string;
  };
}

export class MetNoClient {
  private client: AxiosInstance;
  private cache: Map<string, { data: LocationForecastResponse; expires: number }> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes (MET Norway updates hourly)

  constructor() {
    this.client = axios.create({
      baseURL: METNO_API_BASE,
      timeout: 10000,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    });

    this.client.interceptors.response.use(
      (response) => {
        logger.debug({
          url: response.config.url,
          status: response.status,
        }, 'MET Norway API response');
        return response;
      },
      (error) => {
        logger.error({
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
        }, 'MET Norway API error');
        throw error;
      }
    );
  }

  /**
   * Get weather forecast for a location
   */
  async getForecast(lat: number, lng: number): Promise<LocationForecastResponse> {
    // Round to 4 decimals as recommended by MET Norway
    const roundedLat = Math.round(lat * 10000) / 10000;
    const roundedLng = Math.round(lng * 10000) / 10000;
    const cacheKey = `${roundedLat},${roundedLng}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      logger.debug({ lat: roundedLat, lng: roundedLng }, 'Using cached weather data');
      return cached.data;
    }

    try {
      const response = await this.client.get<LocationForecastResponse>(
        `/locationforecast/2.0/compact`,
        {
          params: {
            lat: roundedLat,
            lon: roundedLng,
          },
        }
      );

      // Cache the response
      this.cache.set(cacheKey, {
        data: response.data,
        expires: Date.now() + this.CACHE_TTL,
      });

      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { status?: number }; message?: string };
      if (err.response?.status === 429) {
        throw new Error('Weather API rate limit exceeded. Please try again later.');
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch weather data: ${message}`);
    }
  }

  /**
   * Get golf-optimized weather data for a location
   */
  async getGolfWeather(lat: number, lng: number): Promise<GolfWeatherData> {
    const forecast = await this.getForecast(lat, lng);
    return this.transformToGolfWeather(forecast);
  }

  /**
   * Transform MET Norway response to golf-friendly format
   */
  private transformToGolfWeather(forecast: LocationForecastResponse): GolfWeatherData {
    const { properties, geometry } = forecast;
    const timeseries = properties.timeseries;

    // Find current/closest timeseries entry
    const currentEntry = timeseries[0];
    const current = currentEntry.data.instant.details;
    const next1h = currentEntry.data.next_1_hours;
    const next6h = currentEntry.data.next_6_hours;

    // Get hourly forecast (next 24 hours)
    const hourly = timeseries
      .slice(0, 24)
      .map((ts) => ({
        time: ts.time,
        temperature: ts.data.instant.details.air_temperature,
        windSpeed: ts.data.instant.details.wind_speed,
        windGust: ts.data.instant.details.wind_speed_of_gust || null,
        windDirection: ts.data.instant.details.wind_from_direction,
        windDirectionText: this.degreesToCardinal(ts.data.instant.details.wind_from_direction),
        precipitation: ts.data.next_1_hours?.details.precipitation_amount || 0,
        precipitationProbability: ts.data.next_1_hours?.details.probability_of_precipitation || null,
        symbol: ts.data.next_1_hours?.summary.symbol_code || ts.data.next_6_hours?.summary.symbol_code || 'unknown',
      }));

    // Aggregate daily forecasts
    const dailyMap = new Map<string, { temps: number[]; precip: number; symbol: string }>();
    timeseries.forEach((ts) => {
      const date = ts.time.split('T')[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { temps: [], precip: 0, symbol: '' });
      }
      const day = dailyMap.get(date)!;
      day.temps.push(ts.data.instant.details.air_temperature);
      day.precip += ts.data.next_1_hours?.details.precipitation_amount || 0;
      if (!day.symbol && ts.data.next_6_hours?.summary.symbol_code) {
        day.symbol = ts.data.next_6_hours.summary.symbol_code;
      }
    });

    const daily = Array.from(dailyMap.entries())
      .slice(0, 7)
      .map(([date, data]) => ({
        date,
        temperatureMax: Math.max(...data.temps),
        temperatureMin: Math.min(...data.temps),
        precipitation: Math.round(data.precip * 10) / 10,
        symbol: data.symbol || 'unknown',
      }));

    // Calculate golf playability
    const golfConditions = this.calculateGolfConditions(current, next1h, next6h);

    return {
      location: {
        lat: geometry.coordinates[1],
        lng: geometry.coordinates[0],
        altitude: geometry.coordinates[2],
      },
      updatedAt: properties.meta.updated_at,
      current: {
        time: currentEntry.time,
        temperature: current.air_temperature,
        feelsLike: this.calculateFeelsLike(current.air_temperature, current.wind_speed, current.relative_humidity),
        humidity: current.relative_humidity,
        windSpeed: current.wind_speed,
        windGust: current.wind_speed_of_gust || null,
        windDirection: current.wind_from_direction,
        windDirectionText: this.degreesToCardinal(current.wind_from_direction),
        precipitation: next1h?.details.precipitation_amount || 0,
        precipitationProbability: next1h?.details.probability_of_precipitation || null,
        cloudCover: current.cloud_area_fraction || null,
        uvIndex: current.ultraviolet_index_clear_sky || null,
        symbol: next1h?.summary.symbol_code || next6h?.summary.symbol_code || 'unknown',
        description: this.symbolToDescription(next1h?.summary.symbol_code || next6h?.summary.symbol_code || ''),
      },
      hourly,
      daily,
      golfConditions,
    };
  }

  /**
   * Calculate golf playability conditions
   */
  private calculateGolfConditions(
    current: WeatherTimeseries['data']['instant']['details'],
    next1h?: WeatherTimeseries['data']['next_1_hours'],
    _next6h?: WeatherTimeseries['data']['next_6_hours']
  ): GolfWeatherData['golfConditions'] {
    const windSpeed = current.wind_speed;
    const temp = current.air_temperature;
    const precip = next1h?.details.precipitation_amount || 0;
    const precipProb = next1h?.details.probability_of_precipitation || 0;

    // Wind score (0-100, lower wind is better)
    let windScore = 100;
    let windDesc = 'Stille forhold';
    if (windSpeed > 15) {
      windScore = 0;
      windDesc = 'For mye vind for golf';
    } else if (windSpeed > 12) {
      windScore = 20;
      windDesc = 'Svært vindfullt';
    } else if (windSpeed > 8) {
      windScore = 50;
      windDesc = 'Merkbar vind';
    } else if (windSpeed > 5) {
      windScore = 75;
      windDesc = 'Lett bris';
    } else if (windSpeed > 2) {
      windScore = 90;
      windDesc = 'Svak vind';
    }

    // Rain score (0-100, less rain is better)
    let rainScore = 100;
    let rainDesc = 'Ingen nedbør';
    if (precip > 5 || precipProb > 80) {
      rainScore = 0;
      rainDesc = 'Kraftig regn forventet';
    } else if (precip > 2 || precipProb > 60) {
      rainScore = 30;
      rainDesc = 'Regn sannsynlig';
    } else if (precip > 0.5 || precipProb > 40) {
      rainScore = 60;
      rainDesc = 'Lett regn mulig';
    } else if (precip > 0 || precipProb > 20) {
      rainScore = 80;
      rainDesc = 'Liten sjanse for regn';
    }

    // Temperature score (0-100, 15-22°C is ideal)
    let tempScore = 100;
    let tempDesc = 'Ideell temperatur';
    if (temp < 5) {
      tempScore = 20;
      tempDesc = 'For kaldt';
    } else if (temp < 10) {
      tempScore = 50;
      tempDesc = 'Kjølig';
    } else if (temp < 15) {
      tempScore = 80;
      tempDesc = 'Litt kjølig';
    } else if (temp > 30) {
      tempScore = 40;
      tempDesc = 'Svært varmt';
    } else if (temp > 25) {
      tempScore = 70;
      tempDesc = 'Varmt';
    } else if (temp > 22) {
      tempScore = 90;
      tempDesc = 'Behagelig varmt';
    }

    // Overall score (weighted average)
    const overallScore = Math.round(windScore * 0.4 + rainScore * 0.4 + tempScore * 0.2);

    // Determine playability
    let playability: GolfWeatherData['golfConditions']['playability'];
    let recommendation: string;

    if (overallScore >= 85) {
      playability = 'excellent';
      recommendation = 'Perfekte forhold for golf!';
    } else if (overallScore >= 70) {
      playability = 'good';
      recommendation = 'Gode spilleforhold';
    } else if (overallScore >= 50) {
      playability = 'fair';
      recommendation = 'Akseptable forhold, vurder utstyr';
    } else if (overallScore >= 30) {
      playability = 'poor';
      recommendation = 'Vanskelige forhold, ta med regntøy';
    } else {
      playability = 'unplayable';
      recommendation = 'Anbefales ikke å spille';
    }

    return {
      playability,
      score: overallScore,
      factors: {
        wind: { score: windScore, description: windDesc },
        rain: { score: rainScore, description: rainDesc },
        temperature: { score: tempScore, description: tempDesc },
      },
      recommendation,
    };
  }

  /**
   * Convert wind degrees to cardinal direction
   */
  private degreesToCardinal(degrees: number): string {
    const directions = ['N', 'NNØ', 'NØ', 'ØNØ', 'Ø', 'ØSØ', 'SØ', 'SSØ', 'S', 'SSV', 'SV', 'VSV', 'V', 'VNV', 'NV', 'NNV'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }

  /**
   * Calculate feels-like temperature (wind chill / heat index)
   */
  private calculateFeelsLike(temp: number, windSpeed: number, humidity: number): number {
    // Wind chill for cold temperatures
    if (temp <= 10 && windSpeed > 1.3) {
      const windKmh = windSpeed * 3.6;
      const feelsLike = 13.12 + 0.6215 * temp - 11.37 * Math.pow(windKmh, 0.16) + 0.3965 * temp * Math.pow(windKmh, 0.16);
      return Math.round(feelsLike * 10) / 10;
    }
    // Heat index for warm temperatures
    if (temp >= 27) {
      const c1 = -8.78469475556;
      const c2 = 1.61139411;
      const c3 = 2.33854883889;
      const c4 = -0.14611605;
      const c5 = -0.012308094;
      const c6 = -0.0164248277778;
      const c7 = 0.002211732;
      const c8 = 0.00072546;
      const c9 = -0.000003582;
      const feelsLike = c1 + c2 * temp + c3 * humidity + c4 * temp * humidity +
        c5 * temp * temp + c6 * humidity * humidity + c7 * temp * temp * humidity +
        c8 * temp * humidity * humidity + c9 * temp * temp * humidity * humidity;
      return Math.round(feelsLike * 10) / 10;
    }
    return temp;
  }

  /**
   * Convert weather symbol to Norwegian description
   */
  private symbolToDescription(symbol: string): string {
    const descriptions: Record<string, string> = {
      clearsky_day: 'Klarvær',
      clearsky_night: 'Klart',
      clearsky_polartwilight: 'Klart',
      fair_day: 'Lettskyet',
      fair_night: 'Lettskyet',
      fair_polartwilight: 'Lettskyet',
      partlycloudy_day: 'Delvis skyet',
      partlycloudy_night: 'Delvis skyet',
      partlycloudy_polartwilight: 'Delvis skyet',
      cloudy: 'Skyet',
      rainshowers_day: 'Regnbyger',
      rainshowers_night: 'Regnbyger',
      rainshowers_polartwilight: 'Regnbyger',
      rainshowersandthunder_day: 'Regnbyger og torden',
      rainshowersandthunder_night: 'Regnbyger og torden',
      rainshowersandthunder_polartwilight: 'Regnbyger og torden',
      sleetshowers_day: 'Sluddbyger',
      sleetshowers_night: 'Sluddbyger',
      sleetshowers_polartwilight: 'Sluddbyger',
      snowshowers_day: 'Snøbyger',
      snowshowers_night: 'Snøbyger',
      snowshowers_polartwilight: 'Snøbyger',
      rain: 'Regn',
      heavyrain: 'Kraftig regn',
      heavyrainandthunder: 'Kraftig regn og torden',
      sleet: 'Sludd',
      snow: 'Snø',
      snowandthunder: 'Snø og torden',
      fog: 'Tåke',
      sleetshowersandthunder_day: 'Sluddbyger og torden',
      sleetshowersandthunder_night: 'Sluddbyger og torden',
      sleetshowersandthunder_polartwilight: 'Sluddbyger og torden',
      snowshowersandthunder_day: 'Snøbyger og torden',
      snowshowersandthunder_night: 'Snøbyger og torden',
      snowshowersandthunder_polartwilight: 'Snøbyger og torden',
      rainandthunder: 'Regn og torden',
      sleetandthunder: 'Sludd og torden',
      lightrainshowersandthunder_day: 'Lette regnbyger og torden',
      lightrainshowersandthunder_night: 'Lette regnbyger og torden',
      lightrainshowersandthunder_polartwilight: 'Lette regnbyger og torden',
      heavyrainshowersandthunder_day: 'Kraftige regnbyger og torden',
      heavyrainshowersandthunder_night: 'Kraftige regnbyger og torden',
      heavyrainshowersandthunder_polartwilight: 'Kraftige regnbyger og torden',
      lightrainshowers_day: 'Lette regnbyger',
      lightrainshowers_night: 'Lette regnbyger',
      lightrainshowers_polartwilight: 'Lette regnbyger',
      heavyrainshowers_day: 'Kraftige regnbyger',
      heavyrainshowers_night: 'Kraftige regnbyger',
      heavyrainshowers_polartwilight: 'Kraftige regnbyger',
      lightrain: 'Lett regn',
      lightrainandthunder: 'Lett regn og torden',
      heavysleet: 'Kraftig sludd',
      lightsleet: 'Lett sludd',
      heavysnow: 'Kraftig snø',
      lightsnow: 'Lett snø',
      heavysleetshowers_day: 'Kraftige sluddbyger',
      heavysleetshowers_night: 'Kraftige sluddbyger',
      heavysleetshowers_polartwilight: 'Kraftige sluddbyger',
      lightsleetshowers_day: 'Lette sluddbyger',
      lightsleetshowers_night: 'Lette sluddbyger',
      lightsleetshowers_polartwilight: 'Lette sluddbyger',
      heavysnowshowers_day: 'Kraftige snøbyger',
      heavysnowshowers_night: 'Kraftige snøbyger',
      heavysnowshowers_polartwilight: 'Kraftige snøbyger',
      lightsnowshowers_day: 'Lette snøbyger',
      lightsnowshowers_night: 'Lette snøbyger',
      lightsnowshowers_polartwilight: 'Lette snøbyger',
    };
    return descriptions[symbol] || 'Ukjent';
  }

  /**
   * Clear the cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
let clientInstance: MetNoClient | null = null;

export function getMetNoClient(): MetNoClient {
  if (!clientInstance) {
    clientInstance = new MetNoClient();
  }
  return clientInstance;
}
