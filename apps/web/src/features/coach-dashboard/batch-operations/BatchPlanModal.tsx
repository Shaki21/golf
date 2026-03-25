import React, { useState } from 'react';
import Modal from '../../../ui/composites/Modal.composite';
import Button from '../../../ui/primitives/Button';
import { TextInput, Select } from '../../../ui/primitives/Input';
import { coachesAPI, Player } from '../../../services/api';
import { useToast } from '../../../components/shadcn/use-toast';
import { Users, ClipboardList, Calendar } from 'lucide-react';

interface BatchPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlayers: Player[];
  onSuccess?: () => void;
}

const durationOptions = [
  { value: '4', label: '4 uker' },
  { value: '8', label: '8 uker' },
  { value: '12', label: '12 uker' },
  { value: '16', label: '16 uker' },
  { value: '24', label: '24 uker (halvt ar)' },
];

const focusAreaOptions = [
  { value: 'technique', label: 'Teknikk' },
  { value: 'putting', label: 'Putting' },
  { value: 'short_game', label: 'Kortspill' },
  { value: 'long_game', label: 'Langspill' },
  { value: 'mental', label: 'Mental' },
  { value: 'physical', label: 'Fysisk' },
  { value: 'course_management', label: 'Baneledelse' },
];

export const BatchPlanModal: React.FC<BatchPlanModalProps> = ({
  isOpen,
  onClose,
  selectedPlayers,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    planName: '',
    startDate: new Date().toISOString().split('T')[0],
    durationWeeks: 8,
    focusAreas: [] as string[],
  });

  const toggleFocusArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.planName.trim()) {
      toast({ title: 'Fyll ut navn', description: 'Planens navn er pakreved', variant: 'destructive' });
      return;
    }

    if (selectedPlayers.length === 0) {
      toast({ title: 'Velg spillere', description: 'Du ma velge minst en spiller', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await coachesAPI.batchCreatePlan({
        playerIds: selectedPlayers.map(p => p.id),
        planName: formData.planName,
        startDate: formData.startDate,
        durationWeeks: formData.durationWeeks,
        focusAreas: formData.focusAreas.length > 0 ? formData.focusAreas : undefined,
      });

      const result = response.data.data;
      toast({
        title: 'Planer opprettet',
        description: `${result.success.length} spillere fikk treningsplan${result.failed.length > 0 ? `, ${result.failed.length} feilet` : ''}`,
      });

      onSuccess?.();
      onClose();
      setFormData({ planName: '', startDate: new Date().toISOString().split('T')[0], durationWeeks: 8, focusAreas: [] });
    } catch (error) {
      toast({ title: 'Feil', description: 'Kunne ikke opprette planer', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Opprett treningsplan for flere"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Avbryt
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Opprett for {selectedPlayers.length} spillere
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 p-3 bg-tier-navy/5 rounded-lg">
          <Users size={18} className="text-tier-navy" />
          <span className="text-sm text-tier-navy">
            {selectedPlayers.length} spillere valgt
          </span>
        </div>

        <TextInput
          label="Plannavn"
          value={formData.planName}
          onChange={(e) => setFormData(prev => ({ ...prev, planName: e.target.value }))}
          placeholder="F.eks. Var-sesong 2026"
          fullWidth
        />

        <TextInput
          label="Startdato"
          type="date"
          value={formData.startDate}
          onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
          fullWidth
        />

        <Select
          label="Varighet"
          options={durationOptions}
          value={formData.durationWeeks.toString()}
          onChange={(value) => setFormData(prev => ({ ...prev, durationWeeks: parseInt(value) }))}
          fullWidth
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-tier-navy">Fokusomrader (valgfritt)</label>
          <div className="flex flex-wrap gap-2">
            {focusAreaOptions.map(area => (
              <button
                key={area.value}
                type="button"
                onClick={() => toggleFocusArea(area.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  formData.focusAreas.includes(area.value)
                    ? 'bg-tier-navy text-white'
                    : 'bg-tier-surface-base text-tier-text-secondary hover:bg-tier-border-default'
                }`}
              >
                {area.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BatchPlanModal;
