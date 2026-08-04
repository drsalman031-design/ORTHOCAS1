import React, { useState, useEffect, useMemo } from 'react';
import {
  SagittalVerticalInteractionAnalysisData,
  SagittalVerticalTable1Data,
  UpperIncisorExposureTable2Data,
  SagittalVerticalStageValues,
  Gender,
} from '../../types';
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  FileText,
  ChevronDown,
  ChevronUp,
  Sliders,
  Layers,
  Activity,
  Zap,
  Info,
} from 'lucide-react';

export interface SagittalVerticalInteractionAnalysisProps {
  data?: SagittalVerticalInteractionAnalysisData;
  onChange?: (data: SagittalVerticalInteractionAnalysisData) => void;
  activeStage?: 'pre' | 'mid' | 'post';
  isOpen?: boolean;
  onToggle?: () => void;
  patientGender?: Gender;
  patientAge?: number | string;
}

export const STAGE_COLUMNS = [
  { key: 'preRx', label: 'Pre Rx' },
  { key: 'pGrMod', label: 'P.Gr. Mod' },
  { key: 'preIII', label: 'Pre III' },
  { key: 'postRx', label: 'Post Rx' },
  { key: 'retention', label: 'Retention' },
  { key: 'change', label: 'Change' },
] as const;

export type StageColKey = typeof STAGE_COLUMNS[number]['key'];

export const DEFAULT_TABLE_1: SagittalVerticalTable1Data = {
  sagittalUnaffectedByVertical: { preRx: '', pGrMod: '', preIII: '', postRx: '', retention: '', change: '' },
  sagittalCausedByVertical: { preRx: '', pGrMod: '', preIII: '', postRx: '', retention: '', change: '' },
  sagittalWorsenedByVertical: { preRx: '', pGrMod: '', preIII: '', postRx: '', retention: '', change: '' },
  sagittalCompensatedByVertical: { preRx: '', pGrMod: '', preIII: '', postRx: '', retention: '', change: '' },
};

export const DEFAULT_TABLE_2: UpperIncisorExposureTable2Data = {
  uiExposureRest: { preRx: '', pGrMod: '', preIII: '', postRx: '', retention: '', change: '' },
  uiExposureSmile: { preRx: '', pGrMod: '', preIII: '', postRx: '', retention: '', change: '' },
  ansToIncisor: { preRx: '', pGrMod: '', preIII: '', postRx: '', retention: '', change: '' },
  uLipLength: { preRx: '', pGrMod: '', preIII: '', postRx: '', retention: '', change: '' },
};

export const SAMPLE_TABLE_1: SagittalVerticalTable1Data = {
  sagittalUnaffectedByVertical: { preRx: 'Class I Skeletal Base', pGrMod: 'Class I', preIII: 'Class I', postRx: 'Class I', retention: 'Stable', change: '0' },
  sagittalCausedByVertical: { preRx: 'Clockwise Mandibular Rotation', pGrMod: 'Controlled', preIII: 'Normal', postRx: 'Improved', retention: 'Stable', change: '-2°' },
  sagittalWorsenedByVertical: { preRx: 'High Angle Divergence', pGrMod: 'Reduced', preIII: 'Normal', postRx: 'Harmonious', retention: 'Stable', change: '-3°' },
  sagittalCompensatedByVertical: { preRx: 'Lower Incisor Proclination', pGrMod: 'Unchanged', preIII: 'Uprighted', postRx: 'Normal', retention: 'Stable', change: '-4°' },
};

export const SAMPLE_TABLE_2: UpperIncisorExposureTable2Data = {
  uiExposureRest: { preRx: 5.5, pGrMod: 4.0, preIII: 3.5, postRx: 3.0, retention: 3.0, change: -2.5 },
  uiExposureSmile: { preRx: 11.0, pGrMod: 9.5, preIII: 9.0, postRx: 8.5, retention: 8.5, change: -2.5 },
  ansToIncisor: { preRx: 38.0, pGrMod: 36.5, preIII: 34.0, postRx: 33.0, retention: 33.0, change: -5.0 },
  uLipLength: { preRx: 21.0, pGrMod: 21.5, preIII: 22.0, postRx: 22.0, retention: 22.0, change: +1.0 },
};

/**
 * Rule-Based Auto-Inference Engine for Upper Incisor Exposure
 */
export function computeUpperIncisorInference(
  table2: UpperIncisorExposureTable2Data,
  colKey: StageColKey = 'preRx',
  gender: 'Male' | 'Female' = 'Male'
): {
  primaryInference: string;
  triggers: string[];
  isSkeletalExcess: boolean;
  isDentalExcess: boolean;
  isShortLip: boolean;
  severity: 'normal' | 'abnormal' | 'warning';
} {
  const restVal = Number(table2.uiExposureRest?.[colKey]);
  const smileVal = Number(table2.uiExposureSmile?.[colKey]);
  const ansVal = Number(table2.ansToIncisor?.[colKey]);
  const lipVal = Number(table2.uLipLength?.[colKey]);

  const hasRest = !isNaN(restVal) && table2.uiExposureRest?.[colKey] !== '';
  const hasSmile = !isNaN(smileVal) && table2.uiExposureSmile?.[colKey] !== '';
  const hasAns = !isNaN(ansVal) && table2.ansToIncisor?.[colKey] !== '';
  const hasLip = !isNaN(lipVal) && table2.uLipLength?.[colKey] !== '';

  if (!hasRest && !hasSmile && !hasAns && !hasLip) {
    return {
      primaryInference: 'Awaiting Upper Incisor Exposure Measurements',
      triggers: [],
      isSkeletalExcess: false,
      isDentalExcess: false,
      isShortLip: false,
      severity: 'normal',
    };
  }

  const ansUpperThreshold = gender === 'Male' ? 36 : 33; // 33±3 M -> max 36, 30±3 F -> max 33
  const lipLowerThreshold = gender === 'Male' ? 20 : 18; // 22±2 M -> min 20, 20±2 F -> min 18

  const isSkeletalExcess = hasAns && ansVal > ansUpperThreshold;
  const isShortLip = hasLip && lipVal < lipLowerThreshold;
  const isExcessiveExposure = (hasRest && restVal > 4) || (hasSmile && smileVal > 10);
  const isDentalExcess = isExcessiveExposure && !isSkeletalExcess && !isShortLip;

  const triggers: string[] = [];

  if (isSkeletalExcess) {
    triggers.push(`Vertical Skeletal Excess (ANS-Incisor: ${ansVal}mm > ${ansUpperThreshold}mm norm)`);
  }
  if (isShortLip) {
    triggers.push(`Short Upper Lip (Lip length: ${lipVal}mm < ${lipLowerThreshold}mm norm)`);
  }
  if (isDentalExcess) {
    triggers.push(`Vertical Dental Excess (High rest/smile exposure with normal skeletal height & lip length)`);
  }

  let primaryInference = 'Normal Upper Incisor Exposure & Lip Relations';
  let severity: 'normal' | 'abnormal' | 'warning' = 'normal';

  if (isSkeletalExcess && isShortLip) {
    primaryInference = 'Excess Exposure due to Combined Vertical Skeletal Excess & Short Upper Lip';
    severity = 'abnormal';
  } else if (isSkeletalExcess) {
    primaryInference = 'Excess Exposure due to Vertical Skeletal Excess (Maxillary Vertical Overgrowth)';
    severity = 'abnormal';
  } else if (isShortLip) {
    primaryInference = 'Excess Exposure due to Short Upper Lip Anatomical Deficiency';
    severity = 'warning';
  } else if (isDentalExcess) {
    primaryInference = 'Excess Exposure due to Vertical Dental Excess (Dentoalveolar Extrusion)';
    severity = 'warning';
  } else if (isExcessiveExposure) {
    primaryInference = 'Excess Upper Incisor Exposure (Multifactorial Dento-Skeletal Contribution)';
    severity = 'abnormal';
  }

  return {
    primaryInference,
    triggers,
    isSkeletalExcess,
    isDentalExcess,
    isShortLip,
    severity,
  };
}

export const SagittalVerticalInteractionAnalysis: React.FC<SagittalVerticalInteractionAnalysisProps> = ({
  data,
  onChange,
  activeStage = 'pre',
  isOpen = true,
  onToggle,
  patientGender = 'Male',
  patientAge = 12,
}) => {
  const [table1, setTable1] = useState<SagittalVerticalTable1Data>(() => ({
    ...DEFAULT_TABLE_1,
    ...(data?.table1Interaction || {}),
  }));

  const [table2, setTable2] = useState<UpperIncisorExposureTable2Data>(() => ({
    ...DEFAULT_TABLE_2,
    ...(data?.table2UpperIncisorExposure || {}),
  }));

  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female'>(
    patientGender === 'Female' ? 'Female' : 'Male'
  );

  const [palatalCortex, setPalatalCortex] = useState<string>(data?.palatalCortexSupport || 'Intact');
  const [symphysealCortex, setSymphysealCortex] = useState<string>(data?.symphysealCortexSupport || 'Adequate');

  const [skeletalAlteration, setSkeletalAlteration] = useState<'Needed' | 'Not Needed' | ''>(
    data?.skeletalAlterationNeeded || 'Needed'
  );

  const ageNum = typeof patientAge === 'number' ? patientAge : parseFloat(patientAge) || 12;
  const isGrowingAge = ageNum <= 15;

  const [alterationNeededOption, setAlterationNeededOption] = useState<'Growth Modulation' | 'Surgical Orthodontics' | ''>(
    data?.alterationNeededOption || (isGrowingAge ? 'Growth Modulation' : 'Surgical Orthodontics')
  );

  const [alterationNotNeededOption, setAlterationNotNeededOption] = useState<'Normal Skeletal Relation' | 'Orthodontic Camouflage' | ''>(
    data?.alterationNotNeededOption || 'Normal Skeletal Relation'
  );

  const [justification, setJustification] = useState<string>(data?.justification || '');
  const [summarySagittal, setSummarySagittal] = useState<string>(data?.summarySagittal || '');
  const [summaryVertical, setSummaryVertical] = useState<string>(data?.summaryVertical || '');

  const [userEditedJustification, setUserEditedJustification] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync prop changes
  useEffect(() => {
    if (patientGender) {
      setSelectedGender(patientGender === 'Female' ? 'Female' : 'Male');
    }
  }, [patientGender]);

  useEffect(() => {
    if (data) {
      if (data.table1Interaction) setTable1((prev) => ({ ...prev, ...data.table1Interaction }));
      if (data.table2UpperIncisorExposure) setTable2((prev) => ({ ...prev, ...data.table2UpperIncisorExposure }));
      if (data.palatalCortexSupport !== undefined) setPalatalCortex(data.palatalCortexSupport);
      if (data.symphysealCortexSupport !== undefined) setSymphysealCortex(data.symphysealCortexSupport);
      if (data.skeletalAlterationNeeded !== undefined) setSkeletalAlteration(data.skeletalAlterationNeeded);
      if (data.alterationNeededOption !== undefined) setAlterationNeededOption(data.alterationNeededOption);
      if (data.alterationNotNeededOption !== undefined) setAlterationNotNeededOption(data.alterationNotNeededOption);
      if (data.justification !== undefined) setJustification(data.justification);
      if (data.summarySagittal !== undefined) setSummarySagittal(data.summarySagittal);
      if (data.summaryVertical !== undefined) setSummaryVertical(data.summaryVertical);
    }
  }, [data]);

  // Stage column map from top activeStage
  const currentStageCol: StageColKey = activeStage === 'pre' ? 'preRx' : activeStage === 'mid' ? 'pGrMod' : 'postRx';

  // Compute Inference
  const inferenceResult = useMemo(
    () => computeUpperIncisorInference(table2, currentStageCol, selectedGender),
    [table2, currentStageCol, selectedGender]
  );

  // Auto-generate justification text
  const autoGeneratedJustification = useMemo(() => {
    let text = `INTERACTION BETWEEN SAGITTAL & VERTICAL READINGS ANALYSIS:\n`;
    text += `• Inferred Upper Incisor Exposure Etiology: ${inferenceResult.primaryInference}.\n`;

    if (inferenceResult.triggers.length > 0) {
      text += `• Clinical Diagnostic Triggers: ${inferenceResult.triggers.join('; ')}.\n`;
    }

    text += `• Alveolar Support to Incisors: Palatal Cortex is [${palatalCortex}], Symphyseal Cortex is [${symphysealCortex}].\n`;

    if (skeletalAlteration === 'Needed') {
      text += `• Skeletal Alteration Required: YES (${alterationNeededOption}${isGrowingAge ? ' - Growth Modulation indicated for growing patient' : ' - Surgical correction indicated for mature patient'}).\n`;
    } else if (skeletalAlteration === 'Not Needed') {
      text += `• Skeletal Alteration Required: NO (${alterationNotNeededOption}).\n`;
    }

    const sagittalUnaffected = table1.sagittalUnaffectedByVertical?.[currentStageCol];
    const sagittalCaused = table1.sagittalCausedByVertical?.[currentStageCol];
    if (sagittalUnaffected) text += `• Sagittal Unaffected by Vertical: ${sagittalUnaffected}.\n`;
    if (sagittalCaused) text += `• Sagittal Caused by Vertical: ${sagittalCaused}.\n`;

    return text.trim();
  }, [
    inferenceResult,
    palatalCortex,
    symphysealCortex,
    skeletalAlteration,
    alterationNeededOption,
    alterationNotNeededOption,
    table1,
    currentStageCol,
    isGrowingAge,
  ]);

  useEffect(() => {
    if (!userEditedJustification) {
      setJustification(autoGeneratedJustification);
    }
  }, [autoGeneratedJustification, userEditedJustification]);

  const notifyChange = (updatedState: Partial<SagittalVerticalInteractionAnalysisData>) => {
    const payload: SagittalVerticalInteractionAnalysisData = {
      table1Interaction: table1,
      table2UpperIncisorExposure: table2,
      excessExposureInference: inferenceResult.primaryInference,
      palatalCortexSupport: palatalCortex,
      symphysealCortexSupport: symphysealCortex,
      skeletalAlterationNeeded: skeletalAlteration,
      alterationNeededOption,
      alterationNotNeededOption,
      justification,
      summarySagittal,
      summaryVertical,
      ...updatedState,
    };
    onChange?.(payload);
  };

  const handleTable1Change = (
    rowKey: keyof SagittalVerticalTable1Data,
    colKey: StageColKey,
    val: string
  ) => {
    const updatedTable1 = {
      ...table1,
      [rowKey]: {
        ...table1[rowKey],
        [colKey]: val,
      },
    };
    setTable1(updatedTable1);
    notifyChange({ table1Interaction: updatedTable1 });
  };

  const handleTable2Change = (
    rowKey: keyof UpperIncisorExposureTable2Data,
    colKey: StageColKey,
    valStr: string
  ) => {
    const num = valStr === '' ? '' : parseFloat(valStr);
    const updatedTable2 = {
      ...table2,
      [rowKey]: {
        ...table2[rowKey],
        [colKey]: isNaN(num as number) ? valStr : num,
      },
    };
    setTable2(updatedTable2);
    notifyChange({ table2UpperIncisorExposure: updatedTable2 });
  };

  const handleGenderChange = (gender: 'Male' | 'Female') => {
    setSelectedGender(gender);
    const newInference = computeUpperIncisorInference(table2, currentStageCol, gender);
    notifyChange({ excessExposureInference: newInference.primaryInference });
  };

  const handleLoadSample = () => {
    setTable1(SAMPLE_TABLE_1);
    setTable2(SAMPLE_TABLE_2);
    setPalatalCortex('Intact / Adequate');
    setSymphysealCortex('Adequate');
    setSkeletalAlteration('Needed');
    setAlterationNeededOption('Growth Modulation');
    setSummarySagittal('Class II Division 1 skeletal malocclusion secondary to mandibular retrognathism');
    setSummaryVertical('Hyperdivergent growth vector with vertical maxillary excess');
    setUserEditedJustification(false);

    notifyChange({
      table1Interaction: SAMPLE_TABLE_1,
      table2UpperIncisorExposure: SAMPLE_TABLE_2,
      palatalCortexSupport: 'Intact / Adequate',
      symphysealCortexSupport: 'Adequate',
      skeletalAlterationNeeded: 'Needed',
      alterationNeededOption: 'Growth Modulation',
      summarySagittal: 'Class II Division 1 skeletal malocclusion secondary to mandibular retrognathism',
      summaryVertical: 'Hyperdivergent growth vector with vertical maxillary excess',
    });
  };

  const handleReset = () => {
    setTable1(DEFAULT_TABLE_1);
    setTable2(DEFAULT_TABLE_2);
    setPalatalCortex('Intact');
    setSymphysealCortex('Adequate');
    setSkeletalAlteration('Needed');
    setAlterationNeededOption(isGrowingAge ? 'Growth Modulation' : 'Surgical Orthodontics');
    setSummarySagittal('');
    setSummaryVertical('');
    setUserEditedJustification(false);

    notifyChange({
      table1Interaction: DEFAULT_TABLE_1,
      table2UpperIncisorExposure: DEFAULT_TABLE_2,
      palatalCortexSupport: 'Intact',
      symphysealCortexSupport: 'Adequate',
      skeletalAlterationNeeded: 'Needed',
      alterationNeededOption: isGrowingAge ? 'Growth Modulation' : 'Surgical Orthodontics',
      summarySagittal: '',
      summaryVertical: '',
    });
  };

  const handleCopyJustification = () => {
    navigator.clipboard.writeText(justification);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const measuredCount = useMemo(() => {
    let count = 0;
    STAGE_COLUMNS.forEach((col) => {
      if (table2.uiExposureRest?.[col.key] !== '') count++;
      if (table2.uiExposureSmile?.[col.key] !== '') count++;
      if (table2.ansToIncisor?.[col.key] !== '') count++;
      if (table2.uLipLength?.[col.key] !== '') count++;
    });
    return count;
  }, [table2]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all duration-200">
      {/* Collapsible Card Header */}
      <div
        onClick={onToggle}
        className="w-full px-3 py-3 sm:px-4 sm:py-3.5 bg-slate-50/90 hover:bg-slate-100/80 flex items-center justify-between cursor-pointer border-b border-slate-200/80 select-none transition-colors"
      >
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 shrink-0 shadow-2xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                Interaction Between Sagittal and Vertical Readings
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200 shrink-0">
                Page 26 Worksheet
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium truncate">
              Sagittal-vertical coupling, upper incisor exposure & rule-based auto-inference engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-semibold text-slate-700">
            <Calculator className="w-3.5 h-3.5 text-teal-600" />
            <span>{measuredCount}/24 Recorded</span>
          </div>
          <button
            type="button"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Body */}
      {isOpen && (
        <div className="p-3 sm:p-5 space-y-5">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Evaluation Stage:
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-teal-600 text-white shadow-2xs">
                <Zap className="w-3 h-3" />
                {activeStage === 'pre' ? 'Pre Rx' : activeStage === 'mid' ? 'P.Gr. Mod' : 'Post Rx'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Gender Norm Switcher */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-600">Norm Gender:</span>
                <div className="inline-flex rounded-lg bg-white p-0.5 border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => handleGenderChange('Male')}
                    className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${
                      selectedGender === 'Male'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Male
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderChange('Female')}
                    className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${
                      selectedGender === 'Female'
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Female
                  </button>
                </div>
              </div>

              {/* Sample / Reset */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 text-xs font-semibold transition-colors shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Sample Data</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold transition-colors shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* TABLE 1: Interaction Between Sagittal and Vertical Readings */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <Layers className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                1. Interaction Between Sagittal and Vertical Readings
              </h4>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-2xs">
              <table className="w-full text-left text-xs border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="py-2 px-3 w-4/12">Parameters</th>
                    {STAGE_COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className={`py-2 px-2 text-center w-1/12 ${
                          currentStageCol === col.key ? 'bg-teal-100 text-teal-900 font-black' : ''
                        }`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      a) Sagittal unaffected by Vertical
                    </td>
                    {STAGE_COLUMNS.map((col) => (
                      <td key={col.key} className="py-1.5 px-1 text-center">
                        <input
                          type="text"
                          value={table1.sagittalUnaffectedByVertical?.[col.key] ?? ''}
                          onChange={(e) => handleTable1Change('sagittalUnaffectedByVertical', col.key, e.target.value)}
                          placeholder="Class I"
                          className={`w-full text-center py-1 px-1 rounded-md border text-xs font-medium transition-colors focus:outline-hidden ${
                            currentStageCol === col.key ? 'border-teal-400 bg-teal-50/50' : 'border-slate-300 bg-white'
                          }`}
                        />
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      b) Sagittal caused by
                    </td>
                    {STAGE_COLUMNS.map((col) => (
                      <td key={col.key} className="py-1.5 px-1 text-center">
                        <input
                          type="text"
                          value={table1.sagittalCausedByVertical?.[col.key] ?? ''}
                          onChange={(e) => handleTable1Change('sagittalCausedByVertical', col.key, e.target.value)}
                          placeholder="Rotation"
                          className={`w-full text-center py-1 px-1 rounded-md border text-xs font-medium transition-colors focus:outline-hidden ${
                            currentStageCol === col.key ? 'border-teal-400 bg-teal-50/50' : 'border-slate-300 bg-white'
                          }`}
                        />
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      c) Sagittal worsened by
                    </td>
                    {STAGE_COLUMNS.map((col) => (
                      <td key={col.key} className="py-1.5 px-1 text-center">
                        <input
                          type="text"
                          value={table1.sagittalWorsenedByVertical?.[col.key] ?? ''}
                          onChange={(e) => handleTable1Change('sagittalWorsenedByVertical', col.key, e.target.value)}
                          placeholder="High angle"
                          className={`w-full text-center py-1 px-1 rounded-md border text-xs font-medium transition-colors focus:outline-hidden ${
                            currentStageCol === col.key ? 'border-teal-400 bg-teal-50/50' : 'border-slate-300 bg-white'
                          }`}
                        />
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      e) Sagittal compensated
                    </td>
                    {STAGE_COLUMNS.map((col) => (
                      <td key={col.key} className="py-1.5 px-1 text-center">
                        <input
                          type="text"
                          value={table1.sagittalCompensatedByVertical?.[col.key] ?? ''}
                          onChange={(e) => handleTable1Change('sagittalCompensatedByVertical', col.key, e.target.value)}
                          placeholder="Incisor tilt"
                          className={`w-full text-center py-1 px-1 rounded-md border text-xs font-medium transition-colors focus:outline-hidden ${
                            currentStageCol === col.key ? 'border-teal-400 bg-teal-50/50' : 'border-slate-300 bg-white'
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLE 2: Upper Incisor Exposure & Auto-Inference */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200">
              <Activity className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                2. Upper Incisor Exposure
              </h4>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-2xs">
              <table className="w-full text-left text-xs border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <th className="py-2 px-3 w-4/12">Parameters & Reference Norms</th>
                    {STAGE_COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className={`py-2 px-2 text-center w-1/12 ${
                          currentStageCol === col.key ? 'bg-teal-100 text-teal-900 font-black' : ''
                        }`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Row a: Rest */}
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      a) UI exposure at rest <span className="text-slate-400 font-normal">(Norm: 2 - 4 mm)</span>
                    </td>
                    {STAGE_COLUMNS.map((col) => {
                      const val = table2.uiExposureRest?.[col.key];
                      const num = Number(val);
                      const isHigh = val !== '' && !isNaN(num) && num > 4;
                      return (
                        <td key={col.key} className="py-1.5 px-1 text-center">
                          <input
                            type="number"
                            step="any"
                            value={val ?? ''}
                            onChange={(e) => handleTable2Change('uiExposureRest', col.key, e.target.value)}
                            placeholder="mm"
                            className={`w-full text-center py-1 px-1 rounded-md border text-xs font-bold transition-colors focus:outline-hidden ${
                              isHigh
                                ? 'bg-rose-50 border-rose-400 text-rose-950'
                                : currentStageCol === col.key
                                ? 'border-teal-400 bg-teal-50/50'
                                : 'border-slate-300 bg-white'
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row b: Smile */}
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      b) UI exposure in smile <span className="text-slate-400 font-normal">(Norm: 8 - 10 mm / Full crown)</span>
                    </td>
                    {STAGE_COLUMNS.map((col) => {
                      const val = table2.uiExposureSmile?.[col.key];
                      const num = Number(val);
                      const isHigh = val !== '' && !isNaN(num) && num > 10;
                      return (
                        <td key={col.key} className="py-1.5 px-1 text-center">
                          <input
                            type="number"
                            step="any"
                            value={val ?? ''}
                            onChange={(e) => handleTable2Change('uiExposureSmile', col.key, e.target.value)}
                            placeholder="mm"
                            className={`w-full text-center py-1 px-1 rounded-md border text-xs font-bold transition-colors focus:outline-hidden ${
                              isHigh
                                ? 'bg-rose-50 border-rose-400 text-rose-950'
                                : currentStageCol === col.key
                                ? 'border-teal-400 bg-teal-50/50'
                                : 'border-slate-300 bg-white'
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row c: ANS to Incisor */}
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      c) ANS to Incisor <span className="text-slate-400 font-normal">({selectedGender === 'Male' ? '33 ± 3 mm' : '30 ± 3 mm'})</span>
                    </td>
                    {STAGE_COLUMNS.map((col) => {
                      const val = table2.ansToIncisor?.[col.key];
                      const num = Number(val);
                      const threshold = selectedGender === 'Male' ? 36 : 33;
                      const isExcess = val !== '' && !isNaN(num) && num > threshold;
                      return (
                        <td key={col.key} className="py-1.5 px-1 text-center">
                          <input
                            type="number"
                            step="any"
                            value={val ?? ''}
                            onChange={(e) => handleTable2Change('ansToIncisor', col.key, e.target.value)}
                            placeholder="mm"
                            className={`w-full text-center py-1 px-1 rounded-md border text-xs font-bold transition-colors focus:outline-hidden ${
                              isExcess
                                ? 'bg-rose-50 border-rose-400 text-rose-950'
                                : currentStageCol === col.key
                                ? 'border-teal-400 bg-teal-50/50'
                                : 'border-slate-300 bg-white'
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row d: U lip length */}
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      d) U lip length <span className="text-slate-400 font-normal">({selectedGender === 'Male' ? '22 ± 2 mm' : '20 ± 2 mm'})</span>
                    </td>
                    {STAGE_COLUMNS.map((col) => {
                      const val = table2.uLipLength?.[col.key];
                      const num = Number(val);
                      const threshold = selectedGender === 'Male' ? 20 : 18;
                      const isShort = val !== '' && !isNaN(num) && num < threshold;
                      return (
                        <td key={col.key} className="py-1.5 px-1 text-center">
                          <input
                            type="number"
                            step="any"
                            value={val ?? ''}
                            onChange={(e) => handleTable2Change('uLipLength', col.key, e.target.value)}
                            placeholder="mm"
                            className={`w-full text-center py-1 px-1 rounded-md border text-xs font-bold transition-colors focus:outline-hidden ${
                              isShort
                                ? 'bg-amber-50 border-amber-400 text-amber-950'
                                : currentStageCol === col.key
                                ? 'border-teal-400 bg-teal-50/50'
                                : 'border-slate-300 bg-white'
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* AUTO-INFERENCE ENGINE RULE BOX */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2.5 shadow-md border border-slate-800">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Rule-Based Auto-Inference: Excess Exposure Etiology
                </h4>
              </div>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Stage: {STAGE_COLUMNS.find((c) => c.key === currentStageCol)?.label}
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
                INFERENCE: Excess exposure due to
              </span>
              <p className="font-extrabold text-teal-300 text-xs sm:text-sm">
                {inferenceResult.primaryInference}
              </p>
              {inferenceResult.triggers.length > 0 && (
                <div className="pt-1 text-[11px] text-slate-300 space-y-0.5">
                  <span className="font-semibold text-slate-400">Diagnostic Rule Triggers:</span>
                  <ul className="list-disc list-inside text-teal-200 pl-1 space-y-0.5">
                    {inferenceResult.triggers.map((trig, idx) => (
                      <li key={idx}>{trig}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* DECISION & SELECTION FIELDS */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-teal-600" />
              3. Alveolar Support & Skeletal Alteration Decision
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Alveolar Support to Incisors */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                <span className="font-extrabold text-slate-800 block text-xs border-b pb-1">
                  Alveolar support to incisors:
                </span>

                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      a) Palatal cortex:
                    </label>
                    <select
                      value={palatalCortex}
                      onChange={(e) => {
                        setPalatalCortex(e.target.value);
                        notifyChange({ palatalCortexSupport: e.target.value });
                      }}
                      className="w-full p-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                    >
                      <option value="Intact / Adequate">a) Palatal cortex: Intact / Adequate</option>
                      <option value="Thin Palatal Cortex">a) Palatal cortex: Thin Cortex</option>
                      <option value="Perforated / Dehiscence">a) Palatal cortex: Perforated / Dehiscence</option>
                      <option value="At Risk during Retraction">a) Palatal cortex: At Risk during Retraction</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      b) Symphyseal cortex:
                    </label>
                    <select
                      value={symphysealCortex}
                      onChange={(e) => {
                        setSymphysealCortex(e.target.value);
                        notifyChange({ symphysealCortexSupport: e.target.value });
                      }}
                      className="w-full p-1.5 rounded border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                    >
                      <option value="Mandible">b) Symphyseal cortex: Mandible</option>
                      <option value="Maxilla">b) Symphyseal cortex: Maxilla</option>
                      <option value="Both">b) Symphyseal cortex: Both Maxilla & Mandible</option>
                      <option value="Adequate">b) Symphyseal cortex: Adequate Support</option>
                      <option value="At Risk">b) Symphyseal cortex: At Risk</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Skeletal Alteration Needed */}
              <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between border-b pb-1">
                  <span className="font-extrabold text-slate-800 text-xs">
                    Skeletal alteration needed (Sagittal / Vertical):
                  </span>
                  <div className="inline-flex rounded bg-slate-100 p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setSkeletalAlteration('Needed');
                        notifyChange({ skeletalAlterationNeeded: 'Needed' });
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                        skeletalAlteration === 'Needed'
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Needed
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSkeletalAlteration('Not Needed');
                        notifyChange({ skeletalAlterationNeeded: 'Not Needed' });
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                        skeletalAlteration === 'Not Needed'
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      Not Needed
                    </button>
                  </div>
                </div>

                {skeletalAlteration === 'Needed' ? (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-teal-800 font-bold bg-teal-50 p-1.5 rounded border border-teal-200">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span>
                        Age Suggestion ({ageNum} yrs): {isGrowingAge ? 'Growth Modulation (Growing)' : 'Surgical Orthodontics (Mature)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="alterationNeededOption"
                          value="Growth Modulation"
                          checked={alterationNeededOption === 'Growth Modulation'}
                          onChange={() => {
                            setAlterationNeededOption('Growth Modulation');
                            notifyChange({ alterationNeededOption: 'Growth Modulation' });
                          }}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        Growth Modulation
                      </label>

                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="alterationNeededOption"
                          value="Surgical Orthodontics"
                          checked={alterationNeededOption === 'Surgical Orthodontics'}
                          onChange={() => {
                            setAlterationNeededOption('Surgical Orthodontics');
                            notifyChange({ alterationNeededOption: 'Surgical Orthodontics' });
                          }}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        Surgical Orthodontics
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] text-slate-500 font-medium block">
                      Branch: Not Needed Options
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="alterationNotNeededOption"
                          value="Normal Skeletal Relation"
                          checked={alterationNotNeededOption === 'Normal Skeletal Relation'}
                          onChange={() => {
                            setAlterationNotNeededOption('Normal Skeletal Relation');
                            notifyChange({ alterationNotNeededOption: 'Normal Skeletal Relation' });
                          }}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        Normal Skeletal Relation
                      </label>

                      <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="alterationNotNeededOption"
                          value="Orthodontic Camouflage"
                          checked={alterationNotNeededOption === 'Orthodontic Camouflage'}
                          onChange={() => {
                            setAlterationNotNeededOption('Orthodontic Camouflage');
                            notifyChange({ alterationNotNeededOption: 'Orthodontic Camouflage' });
                          }}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        Orthodontic Camouflage
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TEXT & SUMMARY SECTIONS */}
          <div className="space-y-3">
            {/* Justification Field */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-700" />
                  <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    Justification
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  {userEditedJustification && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserEditedJustification(false);
                        setJustification(autoGeneratedJustification);
                        notifyChange({ justification: autoGeneratedJustification });
                      }}
                      className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset Auto
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyJustification}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <textarea
                value={justification}
                onChange={(e) => {
                  setUserEditedJustification(true);
                  setJustification(e.target.value);
                  notifyChange({ justification: e.target.value });
                }}
                rows={3}
                placeholder="Multi-line justification auto-populates here based on inferences and selected parameters..."
                className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 font-medium leading-relaxed bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-hidden transition-all shadow-2xs"
              />
            </div>

            {/* Final Diagnostic Summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Summary - Sagittal
                </label>
                <textarea
                  value={summarySagittal}
                  onChange={(e) => {
                    setSummarySagittal(e.target.value);
                    notifyChange({ summarySagittal: e.target.value });
                  }}
                  rows={2}
                  placeholder="Enter final sagittal diagnosis (e.g., Class II Division 1 skeletal malocclusion)..."
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-800 font-medium bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-hidden"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">
                  Summary - Vertical
                </label>
                <textarea
                  value={summaryVertical}
                  onChange={(e) => {
                    setSummaryVertical(e.target.value);
                    notifyChange({ summaryVertical: e.target.value });
                  }}
                  rows={2}
                  placeholder="Enter final vertical diagnosis (e.g., Hyperdivergent growth vector with vertical maxillary excess)..."
                  className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-800 font-medium bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
