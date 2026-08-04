import React, { useState } from 'react';
import {
  DownsAnalysisData,
  SteinersAnalysisData,
  RickettsAnalysisData,
  McnamaraAnalysisData,
  SchwarzTweedAnalysisData,
  HoldawayAnalysisData,
  CogsAnalysisData,
  CogsSoftTissueAnalysisData,
  CephDiscrepancyAnalysisData,
  VerticalJawDivergenceAnalysisData,
  SagittalVerticalInteractionAnalysisData,
  Gender,
} from '../../types';
import { DownsAnalysis } from './DownsAnalysis';
import { SteinersAnalysis } from './SteinersAnalysis';
import { RickettsAnalysis } from './RickettsAnalysis';
import { McnamaraAnalysis } from './McnamaraAnalysis';
import { SchwarzTweedAnalysis } from './SchwarzTweedAnalysis';
import { HoldawayAnalysis } from './HoldawayAnalysis';
import { CogsAnalysis } from './CogsAnalysis';
import { CephDiscrepancyAnalysis } from './CephDiscrepancyAnalysis';
import { ComprehensiveCephAnalysis } from './ComprehensiveCephAnalysis';
import { Layers } from 'lucide-react';

interface TabCephalometricAnalysisProps {
  downsAnalysis?: DownsAnalysisData;
  onUpdateDownsAnalysis?: (data: DownsAnalysisData) => void;
  steinersAnalysis?: SteinersAnalysisData;
  onUpdateSteinersAnalysis?: (data: SteinersAnalysisData) => void;
  rickettsAnalysis?: RickettsAnalysisData;
  onUpdateRickettsAnalysis?: (data: RickettsAnalysisData) => void;
  mcnamaraAnalysis?: McnamaraAnalysisData;
  onUpdateMcnamaraAnalysis?: (data: McnamaraAnalysisData) => void;
  schwarzTweedAnalysis?: SchwarzTweedAnalysisData;
  onUpdateSchwarzTweedAnalysis?: (data: SchwarzTweedAnalysisData) => void;
  holdawayAnalysis?: HoldawayAnalysisData;
  onUpdateHoldawayAnalysis?: (data: HoldawayAnalysisData) => void;
  cogsAnalysis?: CogsAnalysisData;
  onUpdateCogsAnalysis?: (data: CogsAnalysisData) => void;
  cogsSoftTissueAnalysis?: CogsSoftTissueAnalysisData;
  onUpdateCogsSoftTissueAnalysis?: (data: CogsSoftTissueAnalysisData) => void;
  cephDiscrepancyAnalysis?: CephDiscrepancyAnalysisData;
  onUpdateCephDiscrepancyAnalysis?: (data: CephDiscrepancyAnalysisData) => void;
  verticalJawDivergenceAnalysis?: VerticalJawDivergenceAnalysisData;
  onUpdateVerticalJawDivergenceAnalysis?: (data: VerticalJawDivergenceAnalysisData) => void;
  sagittalVerticalInteractionAnalysis?: SagittalVerticalInteractionAnalysisData;
  onUpdateSagittalVerticalInteractionAnalysis?: (data: SagittalVerticalInteractionAnalysisData) => void;
  patientAge?: number | string;
  patientGender?: Gender;
}

const STAGES = [
  { id: 'pre' as const, short: 'Pre', long: 'Pre (Baseline)' },
  { id: 'mid' as const, short: 'Mid', long: 'Mid Stage' },
  { id: 'post' as const, short: 'Post', long: 'Post Treatment' },
];

export const TabCephalometricAnalysis: React.FC<TabCephalometricAnalysisProps> = ({
  downsAnalysis,
  onUpdateDownsAnalysis,
  steinersAnalysis,
  onUpdateSteinersAnalysis,
  rickettsAnalysis,
  onUpdateRickettsAnalysis,
  mcnamaraAnalysis,
  onUpdateMcnamaraAnalysis,
  schwarzTweedAnalysis,
  onUpdateSchwarzTweedAnalysis,
  holdawayAnalysis,
  onUpdateHoldawayAnalysis,
  cogsAnalysis,
  onUpdateCogsAnalysis,
  cogsSoftTissueAnalysis,
  onUpdateCogsSoftTissueAnalysis,
  cephDiscrepancyAnalysis,
  onUpdateCephDiscrepancyAnalysis,
  verticalJawDivergenceAnalysis,
  onUpdateVerticalJawDivergenceAnalysis,
  sagittalVerticalInteractionAnalysis,
  onUpdateSagittalVerticalInteractionAnalysis,
  patientAge = 12,
  patientGender = 'Male',
}) => {
  const [activeStage, setActiveStage] = useState<'pre' | 'mid' | 'post'>('pre');
  const [openAccordion, setOpenAccordion] = useState<string | null>('downs');

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="w-full max-w-full box-border overflow-x-hidden space-y-3">
      {/* Accordion List */}
      <div className="space-y-3">
        <DownsAnalysis
          data={downsAnalysis}
          onChange={onUpdateDownsAnalysis}
          activeStage={activeStage}
          isOpen={openAccordion === 'downs'}
          onToggle={() => toggleAccordion('downs')}
        />

        <SteinersAnalysis
          data={steinersAnalysis}
          onChange={onUpdateSteinersAnalysis}
          activeStage={activeStage}
          isOpen={openAccordion === 'steiners'}
          onToggle={() => toggleAccordion('steiners')}
        />

        <RickettsAnalysis
          data={rickettsAnalysis}
          onChange={onUpdateRickettsAnalysis}
          activeStage={activeStage}
          patientAge={patientAge}
          isOpen={openAccordion === 'ricketts'}
          onToggle={() => toggleAccordion('ricketts')}
        />

        <McnamaraAnalysis
          data={mcnamaraAnalysis}
          onChange={onUpdateMcnamaraAnalysis}
          activeStage={activeStage}
          isOpen={openAccordion === 'mcnamara'}
          onToggle={() => toggleAccordion('mcnamara')}
        />

        <SchwarzTweedAnalysis
          data={schwarzTweedAnalysis}
          onChange={onUpdateSchwarzTweedAnalysis}
          activeStage={activeStage}
          isOpen={openAccordion === 'schwarzTweed'}
          onToggle={() => toggleAccordion('schwarzTweed')}
        />

        <HoldawayAnalysis
          data={holdawayAnalysis}
          onChange={onUpdateHoldawayAnalysis}
          activeStage={activeStage}
          isOpen={openAccordion === 'holdaway'}
          onToggle={() => toggleAccordion('holdaway')}
          steinersAnalysis={steinersAnalysis}
        />

        <CogsAnalysis
          data={cogsAnalysis}
          onChange={onUpdateCogsAnalysis}
          softTissueData={cogsSoftTissueAnalysis}
          onSoftTissueChange={onUpdateCogsSoftTissueAnalysis}
          activeStage={activeStage}
          isOpen={openAccordion === 'cogs'}
          onToggle={() => toggleAccordion('cogs')}
          patientGender={patientGender}
        />

        <CephDiscrepancyAnalysis
          data={cephDiscrepancyAnalysis}
          onChange={onUpdateCephDiscrepancyAnalysis}
          activeStage={activeStage}
          isOpen={openAccordion === 'cephDiscrepancy'}
          onToggle={() => toggleAccordion('cephDiscrepancy')}
          patientGender={patientGender}
        />

        <ComprehensiveCephAnalysis
          activeStage={activeStage}
          patientAge={patientAge}
          patientGender={patientGender}
          isOpen={openAccordion === 'comprehensiveCeph'}
          onToggle={() => toggleAccordion('comprehensiveCeph')}
          downsAnalysis={downsAnalysis}
          steinersAnalysis={steinersAnalysis}
          rickettsAnalysis={rickettsAnalysis}
          mcnamaraAnalysis={mcnamaraAnalysis}
          schwarzTweedAnalysis={schwarzTweedAnalysis}
          holdawayAnalysis={holdawayAnalysis}
          cogsAnalysis={cogsAnalysis}
          cogsSoftTissueAnalysis={cogsSoftTissueAnalysis}
          cephDiscrepancyAnalysis={cephDiscrepancyAnalysis}
        />
      </div>
    </div>
  );
};

export default TabCephalometricAnalysis;
