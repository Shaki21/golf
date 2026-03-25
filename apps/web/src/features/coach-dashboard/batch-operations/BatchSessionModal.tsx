import React, { useState } from 'react';
import Modal from '../../../ui/composites/Modal.composite';
import Button from '../../../ui/primitives/Button';
import { TextInput, Select } from '../../../ui/primitives/Input';
import { coachesAPI, Player } from '../../../services/api';
import { useToast } from '../../../components/shadcn/use-toast';
import { Calendar, Users, Clock, FileText } from 'lucide-react';

interface BatchSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlayers: Player[];
  onSuccess?: () => void;
}

const sessionTypes = [
  { value: 'technique', label: 'Teknikktrening' },
  { value: 'putting', label: 'Putting' },
  { value: 'short_game', label: 'Kortspill' },
  { value: 'long_game', label: 'Langspill' },
  { value: 'course_play', label: 'Banespill' },
  { value: 'mental', label: 'Mental trening' },
  { value: 'physical', label: 'Fysisk trening' },
];

export const BatchSessionModal: React.FC<BatchSessionModalProps> = ({
  isOpen,
  onClose,
  selectedPlayers,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sessionType: 'technique',
    scheduledDate: new Date().toISOString().split('T')[0],
    durationMinutes: 60,
    notes: '',
  });

  const handleSubmit = async () => {
    if (selectedPlayers.length === 0) {
      toast({ title: 'Velg spillere', description: 'Du ma velge minst en spiller', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await coachesAPI.batchAssignSession({
        playerIds: selectedPlayers.map(p => p.id),
        sessionType: formData.sessionType,
        scheduledDate: formData.scheduledDate,
        durationMinutes: formData.durationMinutes,
        notes: formData.notes || undefined,
      });

      const result = response.data.data;
      toast({
        title: 'Okter tildelt',
        description: `${result.success.length} spillere fikk tildelt okt${result.failed.length > 0 ? `, ${result.failed.length} feilet` : ''}`,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      toast({ title: 'Feil', description: 'Kunne ikke tildele okter', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tildel okt til flere spillere"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Avbryt
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Tildel til {selectedPlayers.length} spillere
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

        <Select
          label="Type okt"
          options={sessionTypes}
          value={formData.sessionType}
          onChange={(value) => setFormData(prev => ({ ...prev, sessionType: value }))}
          fullWidth
        />

        <TextInput
          label="Dato"
          type="date"
          value={formData.scheduledDate}
          onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
          fullWidth
        />

        <TextInput
          label="Varighet (minutter)"
          type="number"
          value={formData.durationMinutes.toString()}
          onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 60 }))}
          fullWidth
        />

        <TextInput
          label="Notater (valgfritt)"
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Legg til notater for okten..."
          fullWidth
        />
      </div>
    </Modal>
  );
};

export default BatchSessionModal;
