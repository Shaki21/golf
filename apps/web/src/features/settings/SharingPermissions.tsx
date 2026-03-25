/**
 * SharingPermissions - Data sharing settings
 *
 * Allows users to control what data they share with coaches and team members
 */

import React, { useState } from 'react';
import { Share2, Users, UserCheck, Save } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import {
  Card,
  CardContent,
  Button,
  Checkbox,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/shadcn';

// Data types that can be shared
const DATA_TYPES = [
  { id: 'sessions', label: 'Training sessions', description: 'Planned and completed sessions' },
  { id: 'tests', label: 'Tests', description: 'Test results and history' },
  { id: 'goals', label: 'Goals', description: 'Personal goals and progress' },
  { id: 'tournaments', label: 'Tournaments', description: 'Tournament participation and results' },
  { id: 'videos', label: 'Video', description: 'Training videos and analyses' },
];

// Who can access shared data
type ShareTarget = 'coach' | 'members' | 'none';

const SHARE_TARGETS = [
  { value: 'none', label: 'None', icon: Users },
  { value: 'coach', label: 'Coach only', icon: UserCheck },
  { value: 'members', label: 'Coach and members', icon: Share2 },
];

export default function SharingPermissions() {
  // Track which data types are enabled for sharing
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    sessions: false,
    tests: false,
    goals: false,
    tournaments: false,
    videos: false,
  });

  // Track who can see the shared data
  const [shareTarget, setShareTarget] = useState<ShareTarget>('coach');

  const handleToggle = (dataType: string) => {
    setPermissions((prev) => ({
      ...prev,
      [dataType]: !prev[dataType],
    }));
  };

  const handleSave = () => {
    // TODO: Save to API
    alert('Sharing settings saved!');
  };

  const anyEnabled = Object.values(permissions).some((enabled) => enabled);

  return (
    <div className="min-h-screen bg-background-default">
      <PageHeader
        title="Sharing"
        subtitle="Control what data you share with coach and members"
        helpText="Manage which data and activities are visible to your coach, training partners and other members. Decide what you want to share."
        actions={null}
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Info Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-tier-navy/10 flex items-center justify-center flex-shrink-0">
                <Share2 className="w-6 h-6 text-tier-navy" />
              </div>
              <div className="flex-1">
                <SubSectionTitle className="mb-2">About data sharing</SubSectionTitle>
                <p className="text-sm text-text-secondary leading-relaxed">
                  Choose which data you want to share with your coach and other members.
                  You have full control and can change the settings at any time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Target Selection */}
        <Card>
          <CardContent className="p-6">
            <SubSectionTitle className="mb-4">Who should have access?</SubSectionTitle>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-text-primary">Sharing type</Label>
              <Select value={shareTarget} onValueChange={(v) => setShareTarget(v as ShareTarget)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SHARE_TARGETS.map((target) => {
                    const Icon = target.icon;
                    return (
                      <SelectItem key={target.value} value={target.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {target.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {shareTarget === 'none' && (
                <p className="text-xs text-text-tertiary mt-2">
                  No one has access to your data
                </p>
              )}
              {shareTarget === 'coach' && (
                <p className="text-xs text-text-tertiary mt-2">
                  Only your coach can see the data you choose to share
                </p>
              )}
              {shareTarget === 'members' && (
                <p className="text-xs text-text-tertiary mt-2">
                  Your coach and other members can see the data you choose to share
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Data Types Selection */}
        <Card>
          <CardContent className="p-6">
            <SubSectionTitle className="mb-4">Choose what to share</SubSectionTitle>
            <div className="space-y-4">
              {DATA_TYPES.map((dataType) => (
                <div
                  key={dataType.id}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border-subtle hover:bg-background-default transition-colors"
                >
                  <Checkbox
                    id={dataType.id}
                    checked={permissions[dataType.id] || false}
                    onCheckedChange={() => handleToggle(dataType.id)}
                    disabled={shareTarget === 'none'}
                  />
                  <div className="flex-1 min-w-0">
                    <Label
                      htmlFor={dataType.id}
                      className={`text-sm font-medium cursor-pointer ${
                        shareTarget === 'none' ? 'text-text-tertiary' : 'text-text-primary'
                      }`}
                    >
                      {dataType.label}
                    </Label>
                    <p className="text-xs text-text-secondary mt-1">{dataType.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {shareTarget === 'none' && (
              <div className="mt-4 p-3 bg-tier-surface-subtle rounded-lg">
                <p className="text-sm text-text-secondary">
                  Select a sharing type above to enable data sharing options
                </p>
              </div>
            )}

            {!anyEnabled && shareTarget !== 'none' && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  You have not selected any data to share. Select at least one category.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setPermissions({
                sessions: false,
                tests: false,
                goals: false,
                tournaments: false,
                videos: false,
              });
              setShareTarget('coach');
            }}
          >
            Reset
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save settings
          </Button>
        </div>
      </div>
    </div>
  );
}
