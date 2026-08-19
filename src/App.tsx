/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { ExplainRecordDrawer } from './components/ExplainRecordDrawer';
import { ImportWorkbench } from './features/workbench/ImportWorkbench';
import { ExportWorkbench } from './features/workbench/ExportWorkbench';
import { PortfolioOverview } from './pages/PortfolioOverview';
import { Dashboard } from './pages/Dashboard';
import { ContractList } from './pages/ContractList';
import { GeneratedTrustRecords } from './pages/GeneratedTrustRecords';
import { WeightSlabDataView } from './pages/WeightSlabDataView';
import { MasterDataAdmin } from './pages/MasterDataAdmin';
import { DataMigration } from './pages/DataMigration';
import { AiAssistantView } from './pages/AiAssistantView';
import { AuditTrailView } from './pages/AuditTrailView';
import { RegressionTestsView } from './pages/RegressionTestsView';
import { SettingsView } from './pages/SettingsView';
import { ProcessingEngineView } from './pages/ProcessingEngineView';
import { HelpView } from './pages/HelpView';

const MainContent: React.FC = () => {
  const { activeView, inspectedRecord, setInspectedRecord } = useApp();

  const renderCurrentView = () => {
    switch (activeView) {
      case 'processing-engine':
      case 'engine':
      case 'processing':
        return <ProcessingEngineView key="processing-engine" />;

      case 'import-workbench':
      case 'import-contract':
      case 'import':
        return <ImportWorkbench key="import-workbench" />;

      case 'export-workbench':
      case 'export-contract':
      case 'export':
        return <ExportWorkbench key="export-workbench" />;

      case 'generated-trust':
      case 'generated-haulage':
      case 'records':
        return <GeneratedTrustRecords key="generated-haulage" />;

      case 'weight-slabs':
      case 'weight-slab-data':
      case 'analytics':
        return <WeightSlabDataView key="weight-slabs" />;

      case 'contracts':
        return <ContractList key="contracts" />;

      case 'dashboard':
        return <Dashboard key="dashboard" />;

      case 'regression-tests':
        return <RegressionTestsView key="regression-tests" />;

      case 'traceability':
      case 'audit-trail':
        return <AuditTrailView key="audit-trail" />;

      case 'vendors':
        return <MasterDataAdmin key="vendors" initialTab="vendors" />;

      case 'master-data':
        return <MasterDataAdmin key="master-data" />;

      case 'migration':
        return <DataMigration key="migration" />;

      case 'ai-assistant':
        return <AiAssistantView key="ai-assistant" />;

      case 'settings':
        return <SettingsView key="settings" />;

      case 'help-docs':
      case 'help':
      case 'docs':
        return <HelpView key="help-docs" />;

      case 'portfolio-overview':
      case 'portfolio':
      case 'overview':
        return <PortfolioOverview key="portfolio-overview" />;

      default:
        return <PortfolioOverview key="default-view" />;
    }
  };

  return (
    <div className="h-screen w-screen bg-[#F4F6F9] text-[#0F172A] flex flex-col font-sans overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-y-auto bg-[#F4F6F9] pb-16 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full min-h-full"
            >
              {renderCurrentView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Deep Record Traceability & Operational Explanation Drawer */}
      <ExplainRecordDrawer
        record={inspectedRecord}
        onClose={() => setInspectedRecord(null)}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
