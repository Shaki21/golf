// ============================================================================
// SKOLEPLAN SCHEMAS
// ============================================================================

// Base schemas
export const fagSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    userId: { type: 'string', format: 'uuid' },
    navn: { type: 'string' },
    larer: { type: 'string', nullable: true },
    rom: { type: 'string', nullable: true },
    farge: { type: 'string', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' }
  },
  required: ['id', 'userId', 'navn', 'createdAt', 'updatedAt']
};

export const skoletimeSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    fagId: { type: 'string', format: 'uuid' },
    ukedag: { type: 'string', enum: ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag'] },
    startTid: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
    sluttTid: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    fag: fagSchema
  },
  required: ['id', 'fagId', 'ukedag', 'startTid', 'sluttTid', 'createdAt', 'updatedAt']
};

export const oppgaveSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    fagId: { type: 'string', format: 'uuid' },
    tittel: { type: 'string' },
    beskrivelse: { type: 'string', nullable: true },
    frist: { type: 'string', format: 'date' },
    status: { type: 'string', enum: ['pending', 'completed'] },
    prioritet: { type: 'string', enum: ['low', 'medium', 'high'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
    fag: fagSchema
  },
  required: ['id', 'fagId', 'tittel', 'frist', 'status', 'prioritet', 'createdAt', 'updatedAt']
};

// Full skoleplan response
export const skoleplanSchema = {
  type: 'object',
  properties: {
    fag: { type: 'array', items: fagSchema },
    timer: { type: 'array', items: skoletimeSchema },
    oppgaver: { type: 'array', items: oppgaveSchema }
  }
};

// ============================================================================
// FAG SCHEMAS
// ============================================================================

export const createFagSchema = {
  body: {
    type: 'object',
    properties: {
      navn: { type: 'string', minLength: 1, maxLength: 100 },
      larer: { type: 'string', maxLength: 100 },
      rom: { type: 'string', maxLength: 50 },
      farge: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' }
    },
    required: ['navn']
  },
  response: {
    201: fagSchema
  }
};

export const updateFagSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    },
    required: ['id']
  },
  body: {
    type: 'object',
    properties: {
      navn: { type: 'string', minLength: 1, maxLength: 100 },
      larer: { type: 'string', maxLength: 100 },
      rom: { type: 'string', maxLength: 50 },
      farge: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' }
    }
  },
  response: {
    200: fagSchema
  }
};

export const listFagSchema = {
  response: {
    200: { type: 'array', items: fagSchema }
  }
};

export const getFagSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    },
    required: ['id']
  },
  response: {
    200: fagSchema
  }
};

export const deleteFagSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    },
    required: ['id']
  },
  response: {
    200: { type: 'object', properties: { success: { type: 'boolean' } } }
  }
};

// ============================================================================
// SKOLETIME SCHEMAS
// ============================================================================

export const createSkoletimeSchema = {
  body: {
    type: 'object',
    properties: {
      fagId: { type: 'string', format: 'uuid' },
      ukedag: { type: 'string', enum: ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag'] },
      startTid: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
      sluttTid: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' }
    },
    required: ['fagId', 'ukedag', 'startTid', 'sluttTid']
  },
  response: {
    201: skoletimeSchema
  }
};

export const updateSkoletimeSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    },
    required: ['id']
  },
  body: {
    type: 'object',
    properties: {
      fagId: { type: 'string', format: 'uuid' },
      ukedag: { type: 'string', enum: ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag'] },
      startTid: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' },
      sluttTid: { type: 'string', pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$' }
    }
  },
  response: {
    200: skoletimeSchema
  }
};

export const listTimerSchema = {
  response: {
    200: { type: 'array', items: skoletimeSchema }
  }
};

export const deleteSkoletimeSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    },
    required: ['id']
  },
  response: {
    200: { type: 'object', properties: { success: { type: 'boolean' } } }
  }
};

// ============================================================================
// OPPGAVE SCHEMAS
// ============================================================================

export const createOppgaveSchema = {
  body: {
    type: 'object',
    properties: {
      fagId: { type: 'string', format: 'uuid' },
      tittel: { type: 'string', minLength: 1, maxLength: 255 },
      beskrivelse: { type: 'string' },
      frist: { type: 'string', format: 'date' },
      prioritet: { type: 'string', enum: ['low', 'medium', 'high'] }
    },
    required: ['fagId', 'tittel', 'frist']
  },
  response: {
    201: oppgaveSchema
  }
};

export const updateOppgaveSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    },
    required: ['id']
  },
  body: {
    type: 'object',
    properties: {
      fagId: { type: 'string', format: 'uuid' },
      tittel: { type: 'string', minLength: 1, maxLength: 255 },
      beskrivelse: { type: 'string' },
      frist: { type: 'string', format: 'date' },
      prioritet: { type: 'string', enum: ['low', 'medium', 'high'] }
    }
  },
  response: {
    200: oppgaveSchema
  }
};

export const listOppgaverSchema = {
  querystring: {
    type: 'object',
    properties: {
      fagId: { type: 'string', format: 'uuid' },
      status: { type: 'string', enum: ['pending', 'completed'] }
    }
  },
  response: {
    200: { type: 'array', items: oppgaveSchema }
  }
};

export const updateOppgaveStatusSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    },
    required: ['id']
  },
  body: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['pending', 'completed'] }
    },
    required: ['status']
  },
  response: {
    200: oppgaveSchema
  }
};

export const deleteOppgaveSchema = {
  params: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' }
    },
    required: ['id']
  },
  response: {
    200: { type: 'object', properties: { success: { type: 'boolean' } } }
  }
};

// Full skoleplan endpoint
export const getSkoleplanSchema = {
  response: {
    200: skoleplanSchema
  }
};
