/**
 * TestDetailPage Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (layout/error states)
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { SectionTitle } from '../../../components/typography';
import { PageHeader } from '../../../components/layout/PageHeader';
import Button from '../../../ui/primitives/Button';
import { TestDefinition } from '../config/testDefinitions';
import { useTestProtocols } from '../../../hooks/useTrainingConfig';
import TestOverviewPage from '../templates/TestOverviewPage';
import { testsAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

// ============================================================================
// TEST DETAIL PAGE
// ============================================================================

/**
 * Dynamic test detail page that renders the appropriate test
 * based on the testId URL parameter.
 *
 * Route: /testing/:testId
 * Example: /testing/driver-clubhead-speed
 */
const TestDetailPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Get test protocols from sport context
  const { getProtocol } = useTestProtocols();

  // Find the test definition from sport config
  const test = testId ? getProtocol(testId) as TestDefinition | undefined : undefined;

  // Handle test not found
  if (!test) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          backgroundColor: `rgba(239, 68, 68, 0.09)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px',
        }}>
          <AlertCircle size={40} color="rgb(var(--status-error))" />
        </div>
        <SectionTitle style={{ margin: '0 0 8px 0' }}>
          Test ikke funnet
        </SectionTitle>
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '15px',
          color: 'var(--text-secondary)',
          maxWidth: '400px',
        }}>
          Vi kunne ikke finne testen "{testId}". Sjekk at du har riktig URL eller velg en test fra listen.
        </p>
        <Button
          variant="primary"
          onClick={() => navigate('/testprotokoll')}
          leftIcon={<ArrowLeft size={18} />}
        >
          Tilbake til testprotokoll
        </Button>
      </div>
    );
  }

  // Handle form submission
  const handleSubmit = async (data: any) => {
    if (!user?.playerId) {
      setSubmitError('Kunne ikke finne spiller-ID. Vennligst logg inn på nytt.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Build the API payload
      const payload = {
        playerId: user.playerId,
        testNumber: test.testNumber,
        testDate: data.testDate || new Date(),
        testTime: data.testTime,
        location: data.location || 'Ukjent',
        facility: data.facility || 'Ukjent',
        environment: data.environment || 'outdoor',
        conditions: data.conditions,
        testData: data.testData || data,
      };

      await testsAPI.createResult(payload);

      // Show success message or navigate
      navigate('/testprotokoll', {
        state: { message: `${test.name} resultat lagret!` }
      });
    } catch (error: any) {
      console.error('Failed to submit test result:', error);
      setSubmitError(
        error.response?.data?.message ||
        'Kunne ikke lagre testresultatet. Vennligst prøv igjen.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle close/back
  const handleClose = () => {
    navigate('/testprotokoll');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'rgb(var(--gray-100))',
    }}>
      <PageHeader
        title={test.name}
        subtitle={`Test #${test.testNumber} - ${test.category}`}
        helpText="Detaljer om denne testen inkludert beskrivelse, instruks joner og registreringsskjema. Fullfør testen ved å fylle inn dine resultater og submit for å lagre i testprotokollen. Se tidligere resultater for å spore fremgang."
        actions={
          <Button
            variant="secondary"
            onClick={handleClose}
            leftIcon={<ArrowLeft size={18} />}
          >
            Tilbake
          </Button>
        }
      />
      <div style={{ padding: '24px' }}>
        <TestOverviewPage
          test={test}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      </div>
    </div>
  );
};

export default TestDetailPage;
