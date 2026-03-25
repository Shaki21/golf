/**
 * TIER Golf - Notification Settings Component
 * Design System v3.0 - Blue Palette 01
 *
 * Allows users to configure push notifications and real-time updates.
 */

import React, { useState } from 'react';
import { Bell, BellOff, Smartphone, MessageCircle, Trophy, Calendar, Target, CheckCircle } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { SectionTitle } from '../typography';

const NotificationSettings = () => {
  const {
    isPushSupported,
    isPushEnabled,
    requestPushPermission,
    pushPermission,
    isOnline,
    realtimeConnected,
  } = useNotification();

  const [settings, setSettings] = useState({
    sessionReminders: true,
    messages: true,
    achievements: true,
    goalProgress: true,
    coachNotes: true,
    tournamentUpdates: true,
  });

  const [isRequesting, setIsRequesting] = useState(false);

  const handleEnablePush = async () => {
    setIsRequesting(true);
    await requestPushPermission();
    setIsRequesting(false);
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    // In a real app, save to API here
  };

  const notificationTypes = [
    {
      key: 'sessionReminders',
      icon: Calendar,
      title: 'Treningspaminnelser',
      description: 'Bli varslet for kommende treningsokter',
    },
    {
      key: 'messages',
      icon: MessageCircle,
      title: 'Meldinger',
      description: 'Varsler for nye meldinger fra trener',
    },
    {
      key: 'achievements',
      icon: Trophy,
      title: 'Prestasjoner',
      description: 'Varsler nar du laser opp nye prestasjoner',
    },
    {
      key: 'goalProgress',
      icon: Target,
      title: 'Malframgang',
      description: 'Oppdateringer om fremgang mot malene dine',
    },
    {
      key: 'coachNotes',
      icon: CheckCircle,
      title: 'Trenernotater',
      description: 'Varsler nar treneren legger til notater',
    },
    {
      key: 'tournamentUpdates',
      icon: Trophy,
      title: 'Turneringsoppdateringer',
      description: 'Varsler om turneringer og resultater',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-ak-mist" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div className="p-5 border-b border-ak-mist">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-ak-primary/10 flex items-center justify-center">
            <Bell size={20} className="text-ak-primary" />
          </div>
          <div>
            <SectionTitle className="text-[17px] font-semibold text-ak-charcoal">Varsler</SectionTitle>
            <p className="text-[13px] text-ak-steel">Administrer varslings-innstillinger</p>
          </div>
        </div>
      </div>

      {/* Push Notification Status */}
      <div className="p-5 border-b border-ak-mist">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Smartphone size={20} className="text-ak-steel" />
            <div>
              <p className="text-[15px] font-medium text-ak-charcoal">Push-varsler</p>
              <p className="text-[12px] text-ak-steel">
                {!isPushSupported
                  ? 'Ikke stottet i denne nettleseren'
                  : isPushEnabled
                    ? 'Aktivert'
                    : pushPermission === 'denied'
                      ? 'Blokkert i nettleseren'
                      : 'Ikke aktivert'}
              </p>
            </div>
          </div>

          {isPushSupported && !isPushEnabled && pushPermission !== 'denied' && (
            <button
              onClick={handleEnablePush}
              disabled={isRequesting}
              className="px-4 py-2 bg-ak-primary text-white rounded-lg text-[13px] font-medium hover:bg-ak-primary-light transition-colors disabled:opacity-50"
            >
              {isRequesting ? 'Aktiverer...' : 'Aktiver'}
            </button>
          )}

          {isPushEnabled && (
            <div className="flex items-center gap-2 text-ak-success">
              <CheckCircle size={18} />
              <span className="text-[13px] font-medium">Aktiv</span>
            </div>
          )}

          {pushPermission === 'denied' && (
            <div className="flex items-center gap-2 text-ak-error">
              <BellOff size={18} />
              <span className="text-[13px] font-medium">Blokkert</span>
            </div>
          )}
        </div>

        {pushPermission === 'denied' && (
          <div className="mt-3 p-3 bg-ak-error/5 rounded-lg border border-ak-error/20">
            <p className="text-[12px] text-ak-error">
              Push-varsler er blokkert. For a aktivere dem, ga til nettleserens innstillinger og tillat varsler for denne siden.
            </p>
          </div>
        )}
      </div>

      {/* Connection Status */}
      <div className="p-5 border-b border-ak-mist">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${isOnline && realtimeConnected ? 'bg-ak-success' : isOnline ? 'bg-ak-warning' : 'bg-ak-error'}`} />
            <div>
              <p className="text-[15px] font-medium text-ak-charcoal">Sanntidstilkobling</p>
              <p className="text-[12px] text-ak-steel">
                {!isOnline
                  ? 'Frakoblet - ingen internettforbindelse'
                  : realtimeConnected
                    ? 'Tilkoblet - mottar oppdateringer'
                    : 'Kobler til...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Types */}
      <div className="p-5">
        <p className="text-[13px] font-medium text-ak-steel uppercase tracking-wide mb-4">
          Varseltyper
        </p>

        <div className="space-y-3">
          {notificationTypes.map((type) => (
            <div
              key={type.key}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-ak-snow transition-colors cursor-pointer"
              onClick={() => toggleSetting(type.key)}
            >
              <div className="flex items-center gap-3">
                <type.icon size={18} className="text-ak-steel" />
                <div>
                  <p className="text-[14px] font-medium text-ak-charcoal">{type.title}</p>
                  <p className="text-[12px] text-ak-steel">{type.description}</p>
                </div>
              </div>

              {/* Toggle switch */}
              <button
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  settings[type.key] ? 'bg-ak-primary' : 'bg-ak-mist'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSetting(type.key);
                }}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    settings[type.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
