import React, { useState } from 'react';
import Modal from '../../../ui/composites/Modal.composite';
import Button from '../../../ui/primitives/Button';
import { TextInput, Textarea, Select } from '../../../ui/primitives/Input';
import { coachesAPI, Player } from '../../../services/api';
import { useToast } from '../../../components/shadcn/use-toast';
import { Users, MessageSquare } from 'lucide-react';

interface BatchNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlayers: Player[];
  onSuccess?: () => void;
}

const noteCategories = [
  { value: 'general', label: 'Generelt' },
  { value: 'technique', label: 'Teknikk' },
  { value: 'mental', label: 'Mental' },
  { value: 'physical', label: 'Fysisk' },
  { value: 'progress', label: 'Fremgang' },
  { value: 'goal', label: 'Mal' },
];

export const BatchNoteModal: React.FC<BatchNoteModalProps> = ({
  isOpen,
  onClose,
  selectedPlayers,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
  });

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({ title: 'Fyll ut feltene', description: 'Tittel og innhold er pakreved', variant: 'destructive' });
      return;
    }

    if (selectedPlayers.length === 0) {
      toast({ title: 'Velg spillere', description: 'Du ma velge minst en spiller', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const response = await coachesAPI.batchSendNote({
        playerIds: selectedPlayers.map(p => p.id),
        title: formData.title,
        content: formData.content,
        category: formData.category,
      });

      const result = response.data.data;
      toast({
        title: 'Notater sendt',
        description: `${result.success.length} spillere mottok notat${result.failed.length > 0 ? `, ${result.failed.length} feilet` : ''}`,
      });

      onSuccess?.();
      onClose();
      setFormData({ title: '', content: '', category: 'general' });
    } catch (error) {
      toast({ title: 'Feil', description: 'Kunne ikke sende notater', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send notat til flere spillere"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Avbryt
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            Send til {selectedPlayers.length} spillere
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
          label="Tittel"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="F.eks. Viktig beskjed om trening"
          fullWidth
        />

        <Select
          label="Kategori"
          options={noteCategories}
          value={formData.category}
          onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
          fullWidth
        />

        <Textarea
          label="Innhold"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Skriv notatet her..."
          fullWidth
        />
      </div>
    </Modal>
  );
};

export default BatchNoteModal;
