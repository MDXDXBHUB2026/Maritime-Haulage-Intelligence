/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HaulageDirection } from '../types';
import { ImportWorkbench } from '../features/workbench/ImportWorkbench';
import { ExportWorkbench } from '../features/workbench/ExportWorkbench';
import { useApp } from '../context/AppContext';

interface ContractEditorProps {
  forcedDirection?: HaulageDirection;
}

export const ContractEditor: React.FC<ContractEditorProps> = ({ forcedDirection }) => {
  const { selectedContract } = useApp();

  const activeDirection = forcedDirection || selectedContract?.direction || 'IMPORT';

  if (activeDirection === 'EXPORT') {
    return <ExportWorkbench />;
  }

  return <ImportWorkbench />;
};
