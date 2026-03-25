import React, { useState } from 'react';
import Modal from '../../../ui/composites/Modal.composite';
import Button from '../../../ui/primitives/Button';
import { Select } from '../../../ui/primitives/Input';
import { coachesAPI, Player } from '../../../services/api';
import { useToast } from '../../../components/shadcn/use-toast';
import { Users, UserCheck, UserX, Coffee } from 'lucide-react';

interface BatchStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlayers: Player[];
  onSuccess?: () => void;
}

const statusOptions = [
  { value: 'active', label: 'Aktiv', icon: UserCheck, color: 'text-tier-success' },
  { value: 'inactive', label: 'Inaktiv', icon: UserX, color: 'text-tier-error' },
  { value: 'on_break', label: 'Pa pause', icon: Coffee, color: 'text-tier-warning' },
];

export const BatchStatusModal: React.FC<BatchStatusModalProps> = ({
  isOpen,
  onClose,
  selectedPlayers,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | 'on_break'>('active');

  const handleSubmit = async () => {
    if (selectedPlayers.length === 0) {
      toast({ title: 'Velg spillere', description: 'Du ma velge minst en spiller', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await coachesAPI.batchUpdateStatus({
        playerIds: selectedPlayers.map(p => p.id),
        status: selectedStatus,
      });

      const result = response.data.data;
      toast({
        title: 'Status oppdatert',
        description: `${result.success.length} spillere ble oppdatert${result.failed.length > 0 ? `, ${result.failed.length} feilet` : ''}`,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      toast({ title: 'Feil', description: 'Kunne ikke oppdatere status', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const currentOption = statusOptions.find(o => o.value === selectedStatus);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Oppdater spillerstatus"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Avbryt
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Oppdater {selectedPlayers.length} spillere
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

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-tier-navy">Velg ny status</label>
          <div className="flex flex-col gap-2">
            {statusOptions.map(option => {
              const Icon = option.icon;
              const isSelected = selectedStatus === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedStatus(option.value as typeof selectedStatus)}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-tier-navy bg-tier-navy/5'
                      : 'border-tier-border-default bg-tier-white hover:border-tier-navy/50'
                  }`}
                >
                  <Icon size={20} className={option.color} />
                  <span className={`font-medium ${isSelected ? 'text-tier-navy' : 'text-tier-navy'}`}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BatchStatusModal;
