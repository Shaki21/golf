import React, { useState, useEffect } from 'react';
import {
  Cloud, Sun, CloudRain, Wind,
  Droplets, ArrowUp, MapPin, RefreshCw,
  CloudSnow, CloudLightning, CloudFog
} from 'lucide-react';
import { weatherAPI, golfCoursesAPI } from '../../services/api';

/**
 * WeatherWidget - Golf Weather Card
 *
 * Card Shell Contract applied:
 * - Consistent surface, borders, shadows (rounded-2xl)
 * - Unified header row pattern
 * - Standard KPI typography
 * - Single vertical rhythm (space-y-4)
 * - Semantic tokens only
 */

// Card Shell base styles
const cardShell = {
  base: {
    backgroundColor: 'var(--card)',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
    border: '1px solid var(--border-subtle)',
    overflow: 'hidden',
  },
};

// Weather icon mapping
const getWeatherIcon = (symbol, size = 24) => {
  if (!symbol) return <Cloud size={size} />;

  const iconMap = {
    clearsky: Sun,
    fair: Sun,
    partlycloudy: Cloud,
    cloudy: Cloud,
    rain: CloudRain,
    lightrain: CloudRain,
    heavyrain: CloudRain,
    sleet: CloudSnow,
    snow: CloudSnow,
    fog: CloudFog,
    thunder: CloudLightning,
  };

  const key = Object.keys(iconMap).find(k => symbol.toLowerCase().includes(k));
  const Icon = key ? iconMap[key] : Cloud;
  return <Icon size={size} />;
};

// Playability color mapping using semantic tokens
const getPlayabilityColor = (playability) => {
  switch (playability) {
    case 'excellent': return 'var(--tier-success)';
    case 'good': return 'var(--tier-success)';
    case 'fair': return 'var(--tier-warning)';
    case 'poor': return 'var(--tier-warning)';
    case 'unplayable': return 'var(--tier-error)';
    default: return 'var(--text-secondary)';
  }
};

// Wind direction arrow component
const WindArrow = ({ direction, size = 16 }) => (
  <div style={{
    transform: `rotate(${direction + 180}deg)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <ArrowUp size={size} />
  </div>
);

const WeatherWidget = ({ courseId, showForecast = true }) => {
  const [weather, setWeather] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(courseId || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch courses on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps -- Intentionally runs once on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await golfCoursesAPI.getNorwegian();
        if (response.data?.clubs) {
          const allCourses = response.data.clubs.flatMap(club =>
            club.courses.map(course => ({
              id: course.id,
              name: course.name,
              clubName: club.name,
              city: club.city,
            }))
          );
          setCourses(allCourses);
          if (!selectedCourse && allCourses.length > 0) {
            setSelectedCourse(allCourses[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, []);

  // Fetch weather when course changes
  useEffect(() => {
    if (!selectedCourse) return;

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await weatherAPI.getCourseWeather(selectedCourse);
        if (response.data?.success) {
          setWeather(response.data.data);
        } else {
          setError('Could not fetch weather data');
        }
      } catch (err) {
        setError('Error fetching weather data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [selectedCourse]);

  const handleRefresh = () => {
    if (selectedCourse) {
      setLoading(true);
      weatherAPI.getCourseWeather(selectedCourse)
        .then(response => {
          if (response.data?.success) {
            setWeather(response.data.data);
          }
        })
        .finally(() => setLoading(false));
    }
  };

  // Loading state
  if (loading && !weather) {
    return (
      <div style={cardShell.base}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Cloud size={18} style={{ color: 'var(--text-secondary)' }} />
            <span style={styles.title}>Golf Weather</span>
          </div>
        </div>
        <div style={styles.loadingContent}>
          <RefreshCw size={20} style={{ color: 'var(--text-tertiary)', animation: 'spin 1s linear infinite' }} />
          <span style={styles.loadingText}>Loading weather data...</span>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={cardShell.base}>
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Cloud size={18} style={{ color: 'var(--text-secondary)' }} />
            <span style={styles.title}>Golf Weather</span>
          </div>
        </div>
        <div style={styles.content}>
          <div style={styles.errorState}>
            <span style={styles.errorText}>{error}</span>
            <button style={styles.retryButton} onClick={handleRefresh}>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const current = weather?.weather?.current;
  const conditions = weather?.weather?.golfConditions;

  return (
    <div style={cardShell.base}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <Cloud size={18} style={{ color: 'var(--text-secondary)' }} />
          <span style={styles.title}>Golf Weather</span>
        </div>
        <button onClick={handleRefresh} style={styles.refreshButton} title="Refresh">
          <RefreshCw size={16} style={{ opacity: loading ? 0.5 : 1 }} />
        </button>
      </div>

      {/* Course Selector */}
      {courses.length > 1 && (
        <div style={styles.selectorSection}>
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={styles.select}
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.clubName} - {course.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Main Weather Display */}
      <div style={styles.content}>
        {/* Current Weather */}
        <div style={styles.currentWeather}>
          {/* Temperature & Icon */}
          <div style={styles.tempSection}>
            <div style={styles.weatherIconBg}>
              {getWeatherIcon(current?.symbol, 28)}
            </div>
            <div>
              <div style={styles.tempValue}>
                {current?.temperature?.toFixed(0) || '--'}°
              </div>
              <div style={styles.tempMeta}>
                Feels like {current?.feelsLike?.toFixed(0) || '--'}°
              </div>
            </div>
          </div>

          {/* Golf Conditions Score */}
          <div style={{
            ...styles.conditionsScore,
            backgroundColor: `color-mix(in srgb, ${getPlayabilityColor(conditions?.playability)} 10%, transparent)`,
          }}>
            <div style={{
              ...styles.scoreValue,
              color: getPlayabilityColor(conditions?.playability),
            }}>
              {conditions?.score || '--'}
            </div>
            <div style={{
              ...styles.scoreLabel,
              color: getPlayabilityColor(conditions?.playability),
            }}>
              {conditions?.playability || 'N/A'}
            </div>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div style={styles.detailsGrid}>
          {/* Wind */}
          <div style={styles.detailCard}>
            <div style={styles.detailIconRow}>
              <Wind size={14} style={{ color: 'var(--text-tertiary)' }} />
              {current?.windDirection && (
                <WindArrow direction={current.windDirection} size={12} />
              )}
            </div>
            <div style={styles.detailValue}>
              {current?.windSpeed?.toFixed(1) || '--'} m/s
            </div>
            <div style={styles.detailLabel}>
              {current?.windDirectionText || '--'}
            </div>
          </div>

          {/* Humidity */}
          <div style={styles.detailCard}>
            <Droplets size={14} style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }} />
            <div style={styles.detailValue}>
              {current?.humidity?.toFixed(0) || '--'}%
            </div>
            <div style={styles.detailLabel}>Humidity</div>
          </div>

          {/* Precipitation */}
          <div style={styles.detailCard}>
            <CloudRain size={14} style={{ color: 'var(--text-tertiary)', marginBottom: '4px' }} />
            <div style={styles.detailValue}>
              {current?.precipitation?.toFixed(1) || '0'} mm
            </div>
            <div style={styles.detailLabel}>Precipitation</div>
          </div>
        </div>

        {/* Condition Factors */}
        {conditions?.factors && (
          <div style={styles.factorsSection}>
            <div style={styles.factorsLabel}>Playing Conditions</div>
            <div style={styles.factorsList}>
              {Object.entries(conditions.factors).map(([key, factor]) => (
                <div key={key} style={styles.factorRow}>
                  <div style={styles.factorBar}>
                    <div style={{
                      ...styles.factorFill,
                      width: `${factor.score}%`,
                      backgroundColor: factor.score >= 70 ? 'var(--tier-success)' : factor.score >= 40 ? 'var(--tier-warning)' : 'var(--tier-error)',
                    }} />
                  </div>
                  <span style={styles.factorDescription}>{factor.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendation */}
        {conditions?.recommendation && (
          <div style={{
            ...styles.recommendation,
            borderLeftColor: getPlayabilityColor(conditions.playability),
          }}>
            <p style={styles.recommendationText}>{conditions.recommendation}</p>
          </div>
        )}

        {/* Hourly Forecast Preview */}
        {showForecast && weather?.weather?.hourly && (
          <div style={styles.forecastSection}>
            <div style={styles.forecastLabel}>Next Hours</div>
            <div style={styles.forecastGrid}>
              {weather.weather.hourly.slice(1, 7).map((hour, idx) => (
                <div key={idx} style={styles.forecastItem}>
                  <div style={styles.forecastTime}>
                    {new Date(hour.time).getHours()}:00
                  </div>
                  {getWeatherIcon(hour.symbol, 18)}
                  <div style={styles.forecastTemp}>
                    {hour.temperature?.toFixed(0)}°
                  </div>
                  <div style={styles.forecastWind}>
                    {hour.windSpeed?.toFixed(0)} m/s
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location & Update Time */}
        <div style={styles.footer}>
          <span style={styles.footerLocation}>
            <MapPin size={12} />
            {weather?.clubName || 'Unknown course'}
          </span>
          <span style={styles.footerTime}>
            Updated: {weather?.weather?.updatedAt
              ? new Date(weather.weather.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
              : '--:--'}
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px 16px 24px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    fontSize: '14px',
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  refreshButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
  },

  // Content
  content: {
    padding: '20px 24px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  // Loading
  loadingContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '48px 24px',
  },
  loadingText: {
    fontSize: '13px',
    color: 'var(--text-tertiary)',
  },

  // Error
  errorState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 16px',
    textAlign: 'center',
  },
  errorText: {
    fontSize: '14px',
    color: 'var(--text-tertiary)',
  },
  retryButton: {
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-brand)',
    backgroundColor: 'transparent',
    border: 'none',
    padding: '6px 12px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },

  // Course Selector
  selectorSection: {
    padding: '12px 24px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: '13px',
    cursor: 'pointer',
  },

  // Current Weather
  currentWeather: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
  },
  tempSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  },
  weatherIconBg: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: 'var(--accent-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-brand)',
  },
  tempValue: {
    fontSize: '30px',
    fontWeight: 600,
    fontFeatureSettings: '"tnum"',
    color: 'var(--text-primary)',
    lineHeight: 1,
  },
  tempMeta: {
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    marginTop: '4px',
  },
  conditionsScore: {
    textAlign: 'center',
    padding: '12px 16px',
    borderRadius: '12px',
  },
  scoreValue: {
    fontSize: '24px',
    fontWeight: 600,
    fontFeatureSettings: '"tnum"',
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginTop: '4px',
  },

  // Details Grid
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  detailCard: {
    padding: '12px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-tertiary)',
    textAlign: 'center',
  },
  detailIconRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    marginBottom: '4px',
  },
  detailValue: {
    fontSize: '16px',
    fontWeight: 600,
    fontFeatureSettings: '"tnum"',
    color: 'var(--text-primary)',
  },
  detailLabel: {
    fontSize: '10px',
    color: 'var(--text-tertiary)',
    marginTop: '2px',
  },

  // Factors
  factorsSection: {
    padding: '12px 16px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-tertiary)',
  },
  factorsLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    marginBottom: '10px',
  },
  factorsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  factorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  factorBar: {
    flex: 1,
    height: '4px',
    borderRadius: '2px',
    backgroundColor: 'var(--border-subtle)',
    overflow: 'hidden',
  },
  factorFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.3s ease',
  },
  factorDescription: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    minWidth: '80px',
  },

  // Recommendation
  recommendation: {
    padding: '10px 14px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-tertiary)',
    borderLeft: '3px solid',
  },
  recommendationText: {
    margin: 0,
    fontSize: '13px',
    color: 'var(--text-primary)',
    fontWeight: 500,
  },

  // Forecast
  forecastSection: {
    marginTop: '4px',
  },
  forecastLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    marginBottom: '10px',
  },
  forecastGrid: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  forecastItem: {
    flex: '0 0 auto',
    width: '60px',
    padding: '10px 8px',
    borderRadius: '10px',
    backgroundColor: 'var(--bg-tertiary)',
    textAlign: 'center',
  },
  forecastTime: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    marginBottom: '4px',
  },
  forecastTemp: {
    fontSize: '13px',
    fontWeight: 600,
    fontFeatureSettings: '"tnum"',
    color: 'var(--text-primary)',
    marginTop: '4px',
  },
  forecastWind: {
    fontSize: '10px',
    color: 'var(--text-tertiary)',
  },

  // Footer
  footer: {
    marginTop: '4px',
    paddingTop: '12px',
    borderTop: '1px solid var(--border-subtle)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: 'var(--text-tertiary)',
  },
  footerLocation: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  footerTime: {},
};

export default WeatherWidget;
