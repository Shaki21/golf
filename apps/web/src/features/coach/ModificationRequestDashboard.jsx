/**
 * ModificationRequestDashboard Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState } from 'react';
import apiClient from '../../services/apiClient';
import Button from '../../ui/primitives/Button';
import { PageTitle, SubSectionTitle, CardTitle } from '../../components/typography';

export default function ModificationRequestDashboard({ requests = [] }) {
  const [filter, setFilter] = useState('pending');
  const [respondingTo, setRespondingTo] = useState(null);
  const [response, setResponse] = useState('');
  const [responseStatus, setResponseStatus] = useState('resolved');

  const handleRespond = async (requestId) => {
    try {
      await apiClient.put(
        `/training-plan/modification-requests/${requestId}/respond`,
        { response, status: responseStatus }
      );
      setRespondingTo(null);
      setResponse('');
      // Note: Parent container will need to refetch to update the list
      alert('Svar sendt! Siden vil oppdateres.');
      window.location.reload();
    } catch (err) {
      alert('Kunne ikke sende svar: ' + (err.message || 'Ukjent feil'));
    }
  };

  // Filter requests locally
  const filteredRequests = requests.filter(req => req.status === filter);

  const urgencyColor = {
    low: 'var(--text-secondary)',
    medium: 'rgb(var(--status-warning))',
    high: 'rgb(var(--status-error))',
  };

  const statusBadge = {
    pending: { bg: 'var(--status-warning-light)', text: 'rgb(var(--status-warning))', label: 'Venter' },
    under_review: { bg: 'var(--tier-navy-light)', text: 'var(--tier-navy)', label: 'Under behandling' },
    resolved: { bg: 'var(--tier-success/20)', text: 'rgb(var(--status-success))', label: 'Løst' },
    rejected: { bg: 'var(--tier-error-light)', text: 'rgb(var(--status-error))', label: 'Avvist' },
  };

  return (
    <div className="p-8">
      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['pending', 'under_review', 'resolved', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${
              filter === status
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          Ingen {filter.replace('_', ' ')} forespørsler funnet
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(req => (
            <div key={req.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <SubSectionTitle>{req.playerName}</SubSectionTitle>
                  <p className="text-gray-600">{req.planName}</p>
                  <p className="text-sm text-gray-500">{req.playerEmail}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <span
                    style={{
                      backgroundColor: statusBadge[req.status].bg,
                      color: statusBadge[req.status].text,
                    }}
                    className="px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {statusBadge[req.status].label}
                  </span>
                  <span
                    style={{ color: urgencyColor[req.urgency] }}
                    className="text-sm font-bold uppercase"
                  >
                    {req.urgency}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-4">
                <CardTitle className="text-amber-900 mb-2">Bekymringer:</CardTitle>
                <ul className="list-disc list-inside space-y-1">
                  {req.concerns.map((concern, i) => (
                    <li key={i} className="text-amber-800">{concern}</li>
                  ))}
                </ul>
                {req.notes && (
                  <div className="mt-3">
                    <p className="font-bold text-amber-900">Tilleggsnotater:</p>
                    <p className="text-amber-800">{req.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Opprettet: {new Date(req.createdAt).toLocaleString('nb-NO')}</span>
                {req.reviewedAt && (
                  <span>Gjennomgått: {new Date(req.reviewedAt).toLocaleString('nb-NO')}</span>
                )}
              </div>

              {req.status === 'pending' && (
                <div className="mt-4">
                  {respondingTo === req.id ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Ditt svar til spilleren..."
                        className="w-full p-3 border rounded-lg mb-3"
                        rows="4"
                      />
                      <div className="flex gap-2 items-center mb-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="status"
                            value="resolved"
                            checked={responseStatus === 'resolved'}
                            onChange={(e) => setResponseStatus(e.target.value)}
                          />
                          <span className="text-green-700 font-medium">Løst</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="status"
                            value="rejected"
                            checked={responseStatus === 'rejected'}
                            onChange={(e) => setResponseStatus(e.target.value)}
                          />
                          <span className="text-red-700 font-medium">Avvist</span>
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          onClick={() => handleRespond(req.id)}
                          disabled={response.length < 10}
                        >
                          Send svar
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setRespondingTo(null);
                            setResponse('');
                          }}
                        >
                          Avbryt
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => setRespondingTo(req.id)}
                    >
                      Svar
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
