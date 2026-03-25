import React, { useState, useEffect } from 'react';
import { Cloud, Sun, Wind, Droplets, MapPin, CloudRain, CloudSnow } from 'lucide-react';
import { weatherAPI } from '../../services/api';

// Weather icon mapping using semantic tokens
const getWeatherIcon = (symbol, size = 20) => {
  if (!symbol) return <Cloud size={size} />;

  if (symbol.includes('clearsky') || symbol.includes('fair')) {
    return <Sun size={size} style={{ color: 'var(--warning)' }} />;
  }
  if (symbol.includes('rain')) {
    return <CloudRain size={size} style={{ color: 'var(--info)' }} />;
  }
  if (symbol.includes('snow') || symbol.includes('sleet')) {
    return <CloudSnow size={size} style={{ color: 'var(--info)' }} />;
  }
  return <Cloud size={size} style={{ color: 'var(--text-muted)' }} />;
};

// Playability badge color using semantic tokens
const getPlayabilityStyle = (playability) => {
  const styles = {
    excellent: { bg: 'var(--bg-success-subtle)', color: 'var(--success)', text: 'Perfekt' },
    good: { bg: 'var(--bg-success-subtle)', color: 'var(--success)', text: 'Bra' },
    fair: { bg: 'var(--bg-warning-subtle)', color: 'var(--warning)', text: 'OK' },
    poor: { bg: 'var(--bg-warning-subtle)', color: 'var(--warning)', text: 'Dårlig' },
    unplayable: { bg: 'var(--bg-error-subtle)', color: 'var(--error)', text: 'Ikke spillbart' },
  };
  return styles[playability] || styles.fair;
};

const WeatherWidgetCompact = ({ lat, lng, courseName }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await weatherAPI.getByLocation(lat || 59.91, lng || 10.75);
        if (response.data?.success) {
          setWeather(response.data.data.weather);
        }
      } catch (err) {
        console.error('Weather fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lng]);

  if (loading) {
    return (
      <div style={{
        padding: '16px',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80px',
      }}>
        <Cloud size={24} style={{ color: 'var(--text-tertiary)', opacity: 0.5 }} />
      </div>
    );
  }

  if (!weather) return null;

  const current = weather.current;
  const conditions = weather.golfConditions;
  const playStyle = getPlayabilityStyle(conditions?.playability);

  return (
    <div style={{
      padding: '16px',
      borderRadius: 'var(--radius-lg)',
      backgroundColor: 'var(--bg-primary)',
      border: '1px solid var(--border-default)',
    }}>
      {/* Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getWeatherIcon(current?.symbol, 24)}
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}>
              {current?.temperature?.toFixed(0) || '--'}°C
            </div>
            <div style={{
              fontSize: '11px',
              color: 'var(--text-secondary)',
            }}>
              {current?.description || 'Ukjent'}
            </div>
          </div>
        </div>

        {/* Playability Badge */}
        <div style={{
          padding: '6px 10px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: playStyle.bg,
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 700,
            color: playStyle.color,
          }}>
            {conditions?.score || '--'}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'flex',
        gap: '16px',
        paddingTop: '12px',
        borderTop: '1px solid var(--border-default)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Wind size={14} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
            {current?.windSpeed?.toFixed(1) || '--'} m/s
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Droplets size={14} style={{ color: 'var(--text-secondary)' }} />
          <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
            {current?.humidity?.toFixed(0) || '--'}%
          </span>
        </div>
        <div style={{
          marginLeft: 'auto',
          fontSize: '11px',
          color: playStyle.color,
          fontWeight: 500,
        }}>
          {playStyle.text}
        </div>
      </div>

      {/* Location */}
      {courseName && (
        <div style={{
          marginTop: '8px',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          color: 'var(--text-tertiary)',
        }}>
          <MapPin size={10} />
          {courseName}
        </div>
      )}
    </div>
  );
};

export default WeatherWidgetCompact;
