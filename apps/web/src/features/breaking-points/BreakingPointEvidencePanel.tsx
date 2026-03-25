import React, { useState, useEffect } from 'react';
import { breakingPointsAPI, BreakingPoint } from '../../services/api';
import { useToast } from '../../components/shadcn/use-toast';
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';
import { TextInput, Select } from '../../ui/primitives/Input';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import { Target, Activity, TrendingUp, Settings, CheckCircle, AlertCircle } from 'lucide-react';

interface EvidenceData {
  effortPercent: number;
  progressPercent: number;
  sessionsCompleted: number;
  benchmarkResults: Array<{
    testId: string;
    testName: string;
    value: number;
    date: string;
    improved: boolean;
  }>;
}

interface BreakingPointEvidencePanelProps {
  breakingPointId: string;
  breakingPoint: BreakingPoint;
  onUpdate?: () => void;
}

const domainOptions = [
  { value: 'putting', label: 'Putting' },
  { value: 'short_game', label: 'Short Game' },
  { value: 'approach', label: 'Approach' },
  { value: 'driving', label: 'Driving' },
  { value: 'course_management', label: 'Course Management' },
  { value: 'mental', label: 'Mental' },
];

export const BreakingPointEvidencePanel: React.FC<BreakingPointEvidencePanelProps> = ({
  breakingPointId,
  breakingPoint,
  onUpdate,
}) => {
  const { toast } = useToast();
  const [evidence, setEvidence] = useState<EvidenceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfig, setShowConfig] = useState(false);
  const [configData, setConfigData] = useState({
    domain: breakingPoint.domain || '',
    proofMetric: breakingPoint.proofMetric || '',
    baselineValue: breakingPoint.baselineValue?.toString() || '',
    targetValue: breakingPoint.targetValue?.toString() || '',
  });

  useEffect(() => {
    fetchEvidence();
  }, [breakingPointId]);

  const fetchEvidence = async () => {
    try {
      const response = await breakingPointsAPI.getEvidence(breakingPointId);
      setEvidence(response.data.data as EvidenceData);
    } catch (error) {
      console.error('Could not fetch evidence:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordEffort = async () => {
    try {
      const response = await breakingPointsAPI.recordEffort(breakingPointId);
      toast({
        title: 'Effort recorded',
        description: `New effort: ${response.data.data.effortPercent}%`,
      });
      fetchEvidence();
      onUpdate?.();
    } catch (error) {
      toast({ title: 'Error', description: 'Could not record effort', variant: 'destructive' });
    }
  };

  const handleApplyTransition = async () => {
    try {
      const response = await breakingPointsAPI.applyTransition(breakingPointId);
      if (response.data.data.transitionApplied) {
        toast({
          title: 'Status updated',
          description: `New status: ${response.data.data.newStatus}`,
        });
        onUpdate?.();
      } else {
        toast({
          title: 'No change',
          description: 'Criteria for status change are not met',
          variant: 'default',
        });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Could not update status', variant: 'destructive' });
    }
  };

  const handleSaveConfig = async () => {
    try {
      await breakingPointsAPI.configureEvidence(breakingPointId, {
        domain: configData.domain || undefined,
        proofMetric: configData.proofMetric || undefined,
        baselineValue: configData.baselineValue ? parseFloat(configData.baselineValue) : undefined,
        targetValue: configData.targetValue ? parseFloat(configData.targetValue) : undefined,
      });
      toast({ title: 'Configuration saved' });
      setShowConfig(false);
      onUpdate?.();
    } catch (error) {
      toast({ title: 'Error', description: 'Could not save configuration', variant: 'destructive' });
    }
  };

  const effortProgress = evidence?.effortPercent || breakingPoint.effortPercent || 0;
  const progressProgress = evidence?.progressPercent || breakingPoint.progressPercent || 0;

  return (
    <Card variant="default" padding="lg">
      <div className="flex items-center justify-between mb-4">
        <SectionTitle>Evidence Tracking</SectionTitle>
        <Button variant="ghost" size="sm" onClick={() => setShowConfig(!showConfig)}>
          <Settings size={16} />
          Configure
        </Button>
      </div>

      {/* Config Panel */}
      {showConfig && (
        <div className="mb-6 p-4 bg-tier-surface-base rounded-lg">
          <SubSectionTitle className="mb-3">Configuration</SubSectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Domain"
              options={domainOptions}
              value={configData.domain}
              onChange={(value) => setConfigData(prev => ({ ...prev, domain: value }))}
            />
            <TextInput
              label="Proof metric"
              value={configData.proofMetric}
              onChange={(e) => setConfigData(prev => ({ ...prev, proofMetric: e.target.value }))}
              placeholder="E.g. putts_per_round"
            />
            <TextInput
              label="Baseline value"
              type="number"
              value={configData.baselineValue}
              onChange={(e) => setConfigData(prev => ({ ...prev, baselineValue: e.target.value }))}
            />
            <TextInput
              label="Target value"
              type="number"
              value={configData.targetValue}
              onChange={(e) => setConfigData(prev => ({ ...prev, targetValue: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" size="sm" onClick={() => setShowConfig(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveConfig}>
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Progress Bars */}
      <div className="space-y-4 mb-6">
        {/* Effort Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-tier-navy" />
              <span className="font-medium text-tier-navy">Training effort</span>
            </div>
            <span className="text-sm font-semibold text-tier-navy">{effortProgress}%</span>
          </div>
          <div className="h-3 bg-tier-surface-base rounded-full overflow-hidden">
            <div
              className="h-full bg-tier-navy rounded-full transition-all"
              style={{ width: `${Math.min(effortProgress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-tier-text-secondary mt-1">
            {evidence?.sessionsCompleted || 0} sessions completed
          </p>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-tier-success" />
              <span className="font-medium text-tier-navy">Actual progress</span>
            </div>
            <span className="text-sm font-semibold text-tier-success">{progressProgress}%</span>
          </div>
          <div className="h-3 bg-tier-surface-base rounded-full overflow-hidden">
            <div
              className="h-full bg-tier-success rounded-full transition-all"
              style={{ width: `${Math.min(progressProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Benchmark Results */}
      {evidence?.benchmarkResults && evidence.benchmarkResults.length > 0 && (
        <div className="mb-6">
          <SubSectionTitle className="mb-3">Benchmark results</SubSectionTitle>
          <div className="space-y-2">
            {evidence.benchmarkResults.slice(0, 5).map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-tier-surface-base rounded-lg">
                <div className="flex items-center gap-2">
                  {result.improved ? (
                    <CheckCircle size={16} className="text-tier-success" />
                  ) : (
                    <AlertCircle size={16} className="text-tier-warning" />
                  )}
                  <span className="font-medium text-tier-navy">{result.testName}</span>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${result.improved ? 'text-tier-success' : 'text-tier-text-secondary'}`}>
                    {result.value}
                  </span>
                  <p className="text-xs text-tier-text-secondary">
                    {new Date(result.date).toLocaleDateString('en-US')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={handleRecordEffort} className="flex-1">
          <Activity size={16} />
          Record effort
        </Button>
        <Button variant="primary" onClick={handleApplyTransition} className="flex-1">
          <TrendingUp size={16} />
          Evaluate progress
        </Button>
      </div>
    </Card>
  );
};

export default BreakingPointEvidencePanel;
