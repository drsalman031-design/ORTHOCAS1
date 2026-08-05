import React, { useState, useEffect, useMemo } from 'react';
import {
  DownsParameterKey,
  DownsParametersMap,
  DownsAnalysisData,
} from '../../types';
import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  FileText,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { StepperInput } from './StepperInput';

export interface ParameterMeta {
  key: DownsParameterKey;
  label: string;
  category: 'Skeletal' | 'Dental';
  normalText: string;
  unit: string;
  minNormal: number;
  maxNormal: number;
  evaluateInference: (val: number) => {
    inference: string;
    status: 'normal' | 'abnormal';
  };
}

export const DOWNS_PARAMETERS_META: ParameterMeta[] = [
  // Skeletal Parameters
  {
    key: 'facialAngle',
    label: 'Facial Angle',
    category: 'Skeletal',
    normalText: '82° to 95°',
    unit: '°',
    minNormal: 82,
    maxNormal: 95,
    evaluateInference: (val: number) => {
      if (val < 82) return { inference: 'Retrognathic Mandible', status: 'abnormal' };
      if (val > 95) return { inference: 'Prognathic Mandible', status: 'abnormal' };
      return { inference: 'Orthognathic Mandible (Normal)', status: 'normal' };
    },
  },
  {
    key: 'angleConvexity',
    label: 'Angle of Convexity',
    category: 'Skeletal',
    normalText: '-8.5° to 10°',
    unit: '°',
    minNormal: -8.5,
    maxNormal: 10,
    evaluateInference: (val: number) => {
      if (val > 10) return { inference: 'Convex Profile (Class II)', status: 'abnormal' };
      if (val < -8.5) return { inference: 'Concave Profile (Class III)', status: 'abnormal' };
      return { inference: 'Straight Profile (Class I Normal)', status: 'normal' };
    },
  },
  {
    key: 'abPlane',
    label: 'A-B Plane',
    category: 'Skeletal',
    normalText: '-9° to 0°',
    unit: '°',
    minNormal: -9,
    maxNormal: 0,
    evaluateInference: (val: number) => {
      if (val > 0) return { inference: 'Class III Skeletal Tendency', status: 'abnormal' };
      if (val < -9) return { inference: 'Class II Skeletal Tendency', status: 'abnormal' };
      return { inference: 'Normal Skeletal Relationship', status: 'normal' };
    },
  },
  {
    key: 'mandibularPlaneAngle',
    label: 'Mandibular Plane Angle',
    category: 'Skeletal',
    normalText: '17° to 28°',
    unit: '°',
    minNormal: 17,
    maxNormal: 28,
    evaluateInference: (val: number) => {
      if (val > 28) return { inference: 'Hyperdivergent Pattern (High Angle)', status: 'abnormal' };
      if (val < 17) return { inference: 'Hypodivergent Pattern (Low Angle)', status: 'abnormal' };
      return { inference: 'Normodivergent Pattern', status: 'normal' };
    },
  },
  {
    key: 'yAxis',
    label: 'Y-Axis (Growth Axis)',
    category: 'Skeletal',
    normalText: '53° to 66°',
    unit: '°',
    minNormal: 53,
    maxNormal: 66,
    evaluateInference: (val: number) => {
      if (val > 66) return { inference: 'Vertical Growth Vector', status: 'abnormal' };
      if (val < 53) return { inference: 'Horizontal Growth Vector', status: 'abnormal' };
      return { inference: 'Normal Growth Vector', status: 'normal' };
    },
  },

  // Dental Parameters
  {
    key: 'cantOfOcclusion',
    label: 'Cant of Occlusion',
    category: 'Dental',
    normalText: '1.5° to 14°',
    unit: '°',
    minNormal: 1.5,
    maxNormal: 14,
    evaluateInference: (val: number) => {
      if (val > 14) return { inference: 'Steep Occlusal Plane', status: 'abnormal' };
      if (val < 1.5) return { inference: 'Flat Occlusal Plane', status: 'abnormal' };
      return { inference: 'Normal Occlusal Plane Cant', status: 'normal' };
    },
  },
  {
    key: 'lowerIncisorToOcclusal',
    label: 'Lower Incisors to Occlusal Plane',
    category: 'Dental',
    normalText: '3.5° to 20°',
    unit: '°',
    minNormal: 3.5,
    maxNormal: 20,
    evaluateInference: (val: number) => {
      if (val > 20) return { inference: 'Proclined Lower Incisors', status: 'abnormal' };
      if (val < 3.5) return { inference: 'Retroclined Lower Incisors', status: 'abnormal' };
      return { inference: 'Normal Lower Incisor Inclination', status: 'normal' };
    },
  },
  {
    key: 'impa',
    label: 'Lower Incisors to Mandibular Plane (IMPA)',
    category: 'Dental',
    normalText: '-8.7° to 7°',
    unit: '°',
    minNormal: -8.7,
    maxNormal: 7,
    evaluateInference: (val: number) => {
      if (val > 7) return { inference: 'Lower Incisor Proclination', status: 'abnormal' };
      if (val < -8.7) return { inference: 'Lower Incisor Retroclination', status: 'abnormal' };
      return { inference: 'Normal IMPA', status: 'normal' };
    },
  },
  {
    key: 'interincisalAngle',
    label: 'Interincisal Angle',
    category: 'Dental',
    normalText: '130° to 150.5°',
    unit: '°',
    minNormal: 130,
    maxNormal: 150.5,
    evaluateInference: (val: number) => {
      if (val < 130) return { inference: 'Bimaxillary Protrusion / Proclined Incisors', status: 'abnormal' };
      if (val > 150.5) return { inference: 'Retroclined Incisors', status: 'abnormal' };
      return { inference: 'Normal Interincisal Angle', status: 'normal' };
    },
  },
  {
    key: 'upperIncisalAngle',
    label: 'Upper Incisal Angle (1 to A-Po)',
    category: 'Dental',
    normalText: '-1 to 5 mm',
    unit: 'mm',
    minNormal: -1,
    maxNormal: 5,
    evaluateInference: (val: number) => {
      if (val > 5) return { inference: 'Upper Incisor Protrusion', status: 'abnormal' };
      if (val < -1) return { inference: 'Upper Incisor Retrusion', status: 'abnormal' };
      return { inference: 'Normal Upper Incisor Position', status: 'normal' };
    },
  },
];

export const DEFAULT_DOWNS_PARAMS: DownsParametersMap = {
  facialAngle: { pre: '', mid: '', post: '' },
  angleConvexity: { pre: '', mid: '', post: '' },
  abPlane: { pre: '', mid: '', post: '' },
  mandibularPlaneAngle: { pre: '', mid: '', post: '' },
  yAxis: { pre: '', mid: '', post: '' },
  cantOfOcclusion: { pre: '', mid: '', post: '' },
  lowerIncisorToOcclusal: { pre: '', mid: '', post: '' },
  impa: { pre: '', mid: '', post: '' },
  interincisalAngle: { pre: '', mid: '', post: '' },
  upperIncisalAngle: { pre: '', mid: '', post: '' },
};

// Preset sample case data
const CLASS_II_SAMPLE: DownsParametersMap = {
  facialAngle: { pre: 78, mid: 81, post: 84 },
  angleConvexity: { pre: 15, mid: 11, post: 6 },
  abPlane: { pre: -12, mid: -8, post: -5 },
  mandibularPlaneAngle: { pre: 32, mid: 30, post: 27 },
  yAxis: { pre: 68, mid: 65, post: 62 },
  cantOfOcclusion: { pre: 16, mid: 13, post: 10 },
  lowerIncisorToOcclusal: { pre: 24, mid: 18, post: 14 },
  impa: { pre: 12, mid: 6, post: 2 },
  interincisalAngle: { pre: 118, mid: 128, post: 135 },
  upperIncisalAngle: { pre: 8, mid: 5, post: 3 },
};

const CLASS_III_SAMPLE: DownsParametersMap = {
  facialAngle: { pre: 98, mid: 94, post: 91 },
  angleConvexity: { pre: -12, mid: -7, post: 2 },
  abPlane: { pre: 4, mid: 1, post: -3 },
  mandibularPlaneAngle: { pre: 15, mid: 18, post: 20 },
  yAxis: { pre: 50, mid: 54, post: 57 },
  cantOfOcclusion: { pre: 1, mid: 4, post: 8 },
  lowerIncisorToOcclusal: { pre: 2, mid: 7, post: 12 },
  impa: { pre: -10, mid: -5, post: 0 },
  interincisalAngle: { pre: 155, mid: 145, post: 138 },
  upperIncisalAngle: { pre: -3, mid: 1, post: 3 },
};

export interface DownsAnalysisProps {
  data?: DownsAnalysisData;
  onChange?: (updatedData: DownsAnalysisData) => void;
  activeStage?: 'pre' | 'mid' | 'post';
  isOpen?: boolean;
  onToggle?: () => void;
}

export const DownsAnalysis: React.FC<DownsAnalysisProps> = ({
  data,
  onChange,
  activeStage = 'pre',
  isOpen = true,
  onToggle,
}) => {
  const currentStage: 'pre' | 'mid' | 'post' = (activeStage as 'pre' | 'mid' | 'post') || 'pre';
  // Merge initial parameters with default structure
  const [params, setParams] = useState<DownsParametersMap>(() => {
    if (data?.parameters) {
      return { ...DEFAULT_DOWNS_PARAMS, ...data.parameters };
    }
    return DEFAULT_DOWNS_PARAMS;
  });

  // Conclusion state
  const [conclusion, setConclusion] = useState<string>(data?.conclusion || '');
  const [userEditedConclusion, setUserEditedConclusion] = useState<boolean>(!!data?.conclusion);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync external prop updates
  useEffect(() => {
    if (data?.parameters) {
      setParams((prev) => {
        const isSame = DOWNS_PARAMETERS_META.every(
          (p) =>
            prev[p.key]?.pre === data.parameters?.[p.key]?.pre &&
            prev[p.key]?.mid === data.parameters?.[p.key]?.mid &&
            prev[p.key]?.post === data.parameters?.[p.key]?.post
        );
        return isSame ? prev : { ...prev, ...data.parameters };
      });
    }
    if (data?.conclusion !== undefined && data.conclusion !== conclusion) {
      setConclusion(data.conclusion);
    }
  }, [data]);

  // Handle stage value input change
  const handleInputChange = (
    key: DownsParameterKey,
    stage: 'pre' | 'mid' | 'post',
    rawValue: string
  ) => {
    const numVal = rawValue === '' ? '' : Number(rawValue);
    const updatedParams: DownsParametersMap = {
      ...params,
      [key]: {
        ...params[key],
        [stage]: numVal,
      },
    };
    setParams(updatedParams);
    const nextSummary = userEditedConclusion
      ? conclusion
      : generateDownsSummary(updatedParams, currentStage);
    if (!userEditedConclusion) {
      setConclusion(nextSummary);
    }
    notifyChange(updatedParams, nextSummary);
  };

  const notifyChange = (updatedParams: DownsParametersMap, updatedConclusion: string) => {
    if (onChange) {
      onChange({
        parameters: updatedParams,
        conclusion: updatedConclusion,
      });
    }
  };

  // Evaluate single input field for dynamic styling
  const getFieldValidation = (val: number | '', meta: ParameterMeta) => {
    if (val === '' || isNaN(Number(val))) {
      return {
        status: 'empty',
        className: 'bg-white border-slate-300 text-slate-900 focus:ring-teal-500/20 focus:border-teal-600',
      };
    }
    const num = Number(val);
    const isWithinRange = num >= meta.minNormal && num <= meta.maxNormal;
    if (isWithinRange) {
      return {
        status: 'normal',
        className: 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold focus:ring-emerald-500/20 focus:border-emerald-600',
      };
    }
    return {
      status: 'abnormal',
      className: 'bg-rose-50 border-rose-400 text-rose-950 font-semibold focus:ring-rose-500/20 focus:border-rose-600',
    };
  };

  // Calculate live inferences for all parameters at the currentStage
  const inferences = useMemo(() => {
    const result: Record<DownsParameterKey, { inference: string; status: 'normal' | 'abnormal' | 'empty' }> = {} as any;

    DOWNS_PARAMETERS_META.forEach((meta) => {
      const val = params[meta.key]?.[currentStage];
      if (val === '' || val === undefined || isNaN(Number(val))) {
        result[meta.key] = { inference: 'Enter value to analyze', status: 'empty' };
      } else {
        const res = meta.evaluateInference(Number(val));
        result[meta.key] = { inference: res.inference, status: res.status };
      }
    });

    return result;
  }, [params, currentStage]);

  const generateDownsSummary = (
    currentParams: DownsParametersMap,
    stage: 'pre' | 'mid' | 'post'
  ) => {
    const stageLabel = stage === 'pre' ? 'Pre-treatment' : stage === 'mid' ? 'Mid-treatment' : 'Post-treatment';
    const skeletalFindings: string[] = [];
    const dentalFindings: string[] = [];

    DOWNS_PARAMETERS_META.forEach((meta) => {
      const val = currentParams[meta.key]?.[stage];
      if (val !== '' && val !== undefined && !isNaN(Number(val))) {
        const num = Number(val);
        const res = meta.evaluateInference(num);
        const itemText = `${meta.label}: ${num}${meta.unit} (${res.inference})`;
        if (meta.category === 'Skeletal') {
          skeletalFindings.push(itemText);
        } else {
          dentalFindings.push(itemText);
        }
      }
    });

    if (skeletalFindings.length === 0 && dentalFindings.length === 0) {
      return `Please enter ${stageLabel.toLowerCase()} measurement values in the Downs Analysis section to auto-generate the diagnostic conclusion.`;
    }

    let summary = `Downs Cephalometric Analysis (${stageLabel} Evaluation):\n`;

    if (skeletalFindings.length > 0) {
      summary += `• Skeletal Assessment: ${skeletalFindings.join('; ')}.\n`;
    } else {
      summary += `• Skeletal Assessment: Pending measurement values.\n`;
    }

    if (dentalFindings.length > 0) {
      summary += `• Dental Assessment: ${dentalFindings.join('; ')}.`;
    } else {
      summary += `• Dental Assessment: Pending measurement values.`;
    }

    return summary;
  };

  // Auto-generate Cohesive Diagnostic Paragraph
  const autoGeneratedSummary = useMemo(
    () => generateDownsSummary(params, currentStage),
    [params, currentStage]
  );

  // Keep conclusion in sync with auto-generator unless user manually edited it
  useEffect(() => {
    if (!userEditedConclusion) {
      setConclusion(autoGeneratedSummary);
    }
  }, [autoGeneratedSummary, userEditedConclusion]);

  const handleConclusionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserEditedConclusion(true);
    setConclusion(e.target.value);
    notifyChange(params, e.target.value);
  };

  const handleResetConclusion = () => {
    setUserEditedConclusion(false);
    setConclusion(autoGeneratedSummary);
    notifyChange(params, autoGeneratedSummary);
  };

  const handleLoadSample = (sample: DownsParametersMap) => {
    setParams(sample);
    setUserEditedConclusion(false);
    notifyChange(sample, autoGeneratedSummary);
  };

  const handleResetAll = () => {
    setParams(DEFAULT_DOWNS_PARAMS);
    setUserEditedConclusion(false);
    const emptySummary = `Please enter measurement values to auto-generate the Downs Cephalometric diagnostic conclusion.`;
    setConclusion(emptySummary);
    notifyChange(DEFAULT_DOWNS_PARAMS, emptySummary);
  };

  const handleCopyConclusion = () => {
    navigator.clipboard.writeText(conclusion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Count active entries and abnormal findings
  const activeCount = useMemo(() => {
    return DOWNS_PARAMETERS_META.filter((m) => params[m.key]?.[currentStage] !== '').length;
  }, [params, currentStage]);

  const abnormalCount = useMemo(() => {
    return DOWNS_PARAMETERS_META.filter((m) => {
      const val = params[m.key]?.[currentStage];
      if (val === '' || val === undefined) return false;
      return m.evaluateInference(Number(val)).status === 'abnormal';
    }).length;
  }, [params, currentStage]);

  const stageDisplayLabel = currentStage === 'pre' ? 'Pre' : currentStage === 'mid' ? 'Mid' : 'Post';

  const renderInference = (activeInference: {
    inference: string;
    status: 'empty' | 'normal' | 'abnormal';
  }) => {
    if (activeInference.status === 'empty') {
      return <span className="text-slate-400 text-xs italic">Enter value</span>;
    }
    if (activeInference.status === 'normal') {
      return (
        <span className="inline-flex items-start gap-1 text-[11px] sm:text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <span className="leading-snug">{activeInference.inference}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-start gap-1 text-[11px] sm:text-xs font-bold text-rose-900 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md">
        <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
        <span className="leading-snug">{activeInference.inference}</span>
      </span>
    );
  };

  const handleInputWheel = (e: React.WheelEvent<HTMLInputElement>, key: DownsParameterKey, stage: 'pre' | 'mid' | 'post') => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const current = params[key]?.[stage];
    const num = current === '' || current === undefined ? 0 : Number(current);
    const newVal = Math.round((num + delta) * 10) / 10;
    handleInputChange(key, stage, String(newVal));
  };

  const renderMobileParamRows = (category: 'Skeletal' | 'Dental', title: string) => (
    <div className="space-y-2">
      <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
        {title}
      </div>
      {DOWNS_PARAMETERS_META.filter((m) => m.category === category).map((meta) => {
        const currentVal = params[meta.key]?.[currentStage] ?? '';
        const validation = getFieldValidation(currentVal, meta);
        const activeInference = inferences[meta.key];

        return (
          <div
            key={meta.key}
            className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 leading-snug">{meta.label}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Norm {meta.normalText}
                  <span className="ml-1.5 text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {meta.unit}
                  </span>
                </p>
              </div>
              <StepperInput
                value={currentVal}
                onChange={(v) => handleInputChange(meta.key, currentStage, v === '' ? '' : String(v))}
                min={meta.minNormal - 20}
                max={meta.maxNormal + 20}
                step={0.1}
                unit={meta.unit}
                validationClass={validation.className}
              />
            </div>
            <div>{renderInference(activeInference)}</div>
          </div>
        );
      })}
    </div>
  );

  const renderTableRows = (category: 'Skeletal' | 'Dental') =>
    DOWNS_PARAMETERS_META.filter((m) => m.category === category).map((meta) => {
      const currentVal = params[meta.key]?.[currentStage] ?? '';
      const validation = getFieldValidation(currentVal, meta);
      const activeInference = inferences[meta.key];

      return (
        <tr key={meta.key} className="hover:bg-slate-50 transition-colors">
          <td className="py-2.5 px-3 font-bold text-slate-900">
            {meta.label}
            <span className="ml-1.5 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {meta.unit}
            </span>
          </td>
          <td className="py-2.5 px-2 text-center font-bold text-slate-700 bg-slate-50/80 text-xs">
            {meta.normalText}
          </td>
          <td className="py-2 px-2 text-center">
            <StepperInput
              value={currentVal}
              onChange={(v) => handleInputChange(meta.key, currentStage, v === '' ? '' : String(v))}
              min={meta.minNormal - 20}
              max={meta.maxNormal + 20}
              step={0.1}
              unit={meta.unit}
              validationClass={validation.className}
            />
          </td>
          <td className="py-2.5 px-3">{renderInference(activeInference)}</td>
        </tr>
      );
    });

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs transition-all w-full max-w-full box-border">
      {/* Accordion Card Header */}
      <div
        onClick={onToggle}
        className="w-full p-3 sm:p-4 cursor-pointer hover:bg-slate-50 transition-colors space-y-2"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 flex flex-wrap items-center gap-1.5">
                Downs Analysis
                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                  10 Parameters
                </span>
              </h4>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Skeletal and Dental Normative Cephalometric Analysis
              </p>
            </div>
          </div>
          <div className="text-slate-500 shrink-0">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pl-0 sm:pl-9">
          <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
            <Activity className="w-3 h-3 text-teal-600" />
            {activeCount}/10 Measured
          </span>

          {abnormalCount > 0 ? (
            <span className="inline-flex items-center gap-1 font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md text-[11px]">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              {abnormalCount} Deviations
            </span>
          ) : activeCount > 0 ? (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Normative
            </span>
          ) : null}
        </div>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-2.5 sm:p-5 border-t border-slate-200 space-y-3 sm:space-y-4 bg-slate-50/50">
          {/* Presets — stacked on mobile so buttons never clip */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              Presets & controls
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleLoadSample(CLASS_II_SAMPLE)}
                className="min-h-12 px-1.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-[11px] sm:text-xs font-bold transition-colors inline-flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="truncate">Class II</span>
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample(CLASS_III_SAMPLE)}
                className="min-h-9 px-1.5 py-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 rounded-lg text-[11px] sm:text-xs font-bold transition-colors inline-flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
                <span className="truncate">Class III</span>
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                className="min-h-9 px-1.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-[11px] sm:text-xs font-bold transition-colors inline-flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-slate-600 shrink-0" />
                <span className="truncate">Reset</span>
              </button>
            </div>
          </div>

          {/* Mobile: stacked parameter rows */}
          <div className="space-y-3 md:hidden">
            {renderMobileParamRows('Skeletal', '1. Skeletal Parameters (5)')}
            {renderMobileParamRows('Dental', '2. Dental Parameters (5)')}
          </div>

          {/* Desktop: 4-column table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs w-full max-w-full box-border">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] sm:text-xs uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-3 w-[42%] whitespace-normal break-words">Parameter Name</th>
                    <th className="py-2.5 px-2 text-center w-[23%] whitespace-normal break-words">Normal Range</th>
                    <th className="py-2.5 px-2 text-center w-[20%] bg-teal-900 text-teal-200 font-extrabold border-b-2 border-teal-400 whitespace-normal break-words">
                      Input ({stageDisplayLabel})
                    </th>
                    <th className="py-2.5 px-3 w-[15%] whitespace-normal break-words">Auto Inference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                    <td
                      colSpan={4}
                      className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300"
                    >
                      1. Skeletal Parameters (5)
                    </td>
                  </tr>
                  {renderTableRows('Skeletal')}

                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                    <td
                      colSpan={4}
                      className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300"
                    >
                      2. Dental Parameters (5)
                    </td>
                  </tr>
                  {renderTableRows('Dental')}
                </tbody>
              </table>
            </div>
          </div>

          {/* DYNAMIC DIAGNOSTIC CONCLUSION BOX */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 space-y-2.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <h5 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="leading-snug">
                  Downs Conclusion ({stageDisplayLabel})
                </span>
              </h5>
              <div className="flex items-center gap-2 shrink-0">
                {userEditedConclusion && (
                  <button
                    type="button"
                    onClick={handleResetConclusion}
                    className="text-xs font-bold text-teal-700 hover:text-teal-800 underline inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopyConclusion}
                  className="px-2.5 py-1.5 min-h-9 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              rows={4}
              value={conclusion}
              onChange={handleConclusionChange}
              placeholder="Diagnostic summary concatenates row inferences in real time..."
              className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm font-medium bg-white leading-relaxed focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};
