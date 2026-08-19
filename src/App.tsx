/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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

const MainContent: React.FC = () => {
  const { activeView, inspectedRecord, setInspectedRecord } = useApp();

  const renderCurrentView = () => {
    switch (activeView) {
      case 'import-workbench':
      case 'import-contract':
      case 'import':
        return <ImportWorkbench />;

      case 'export-workbench':
      case 'export-contract':
      case 'export':
        return <ExportWorkbench />;

      case 'generated-trust':
        return <GeneratedTrustRecords />;

      case 'weight-slabs':
        return <WeightSlabDataView />;

      case 'contracts':
        return <ContractList />;

      case 'dashboard':
        return <Dashboard />;

      case 'regression-tests':
        return <RegressionTestsView />;

      case 'traceability':
        return <AuditTrailView />;

      case 'vendors':
        return <MasterDataAdmin initialTab="vendors" />;

      case 'master-data':
        return <MasterDataAdmin />;

      case 'audit-trail':
        return <AuditTrailView />;

      case 'migration':
        return <DataMigration />;

      case 'ai-assistant':
        return <AiAssistantView />;

      case 'settings':
        return <SettingsView />;

      case 'portfolio-overview':
        return <PortfolioOverview />;

      default:
        return <ImportWorkbench />;
    }
  };

  return (
    <div className="h-screen w-screen bg-[#f1f5f9] text-slate-800 flex flex-col font-sans overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Navigation />
        <main className="flex-1 overflow-y-auto bg-[#f1f5f9] pb-16">
          {renderCurrentView()}
        </main>
      </div>

      {/* Deep Record Traceability & AI Explanation Drawer */}
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
