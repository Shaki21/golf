/**
 * Tests Feature Module
 *
 * Exports all test-related components and utilities.
 */

// Components
export { default as TestRegistrationForm } from './TestRegistrationForm';
export { default as RegistrerTestContainer } from './RegistrerTestContainer';
export { default as StartTestModal } from './StartTestModal';
export { default as Testprotokoll } from './Testprotokoll';
export { default as Testresultater } from './Testresultater';
export { default as TestresultaterContainer } from './TestresultaterContainer';
export { default as TestprotokollContainer } from './TestprotokollContainer';
export { default as KategoriKravContainer } from './KategoriKravContainer';
export { default as PEIBaneTestForm } from './PEIBaneTestForm';
export { default as PEIBaneTestPage } from './PEIBaneTestPage';

// Config
export { testDefinitions, getTestById, getTestByNumber, getTestsByCategory } from './config/testDefinitions';
export type { TestDefinition, FormType, CalculationType, ScoringThresholds, ColumnDef } from './config/testDefinitions';
