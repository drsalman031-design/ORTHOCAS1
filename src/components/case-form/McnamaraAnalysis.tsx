import React, { useState, useEffect, useMemo } from 'react';
import {
  McnamaraParameterKey,
  McnamaraParametersMap,
  McnamaraAnalysisData,
  SizeFrame,
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
  Sliders,
} from 'lucide-react';

export interface McnamaraParameterMeta {
  key: McnamaraParameterKey;
  label: string;
  category:
    | 'Maxilla to Cranial Base'
    | 'Maxilla to Mandible'
    | 'Mandible to Cranial Base'
    | 'Dentition'
    | 'Airway';
  unit: string;
  normalText: (frame: SizeFrame) => string;
  getNormalRange: (frame: SizeFrame) => { minNormal: number; maxNormal: number };
  evaluateInference: (
    val: number,
    frame: SizeFrame
  ) => {
    inference: string;
    status: 'normal' | 'abnormal';
  };
}

export const MCNAMARA_PARAMETERS_META: McnamaraParameterMeta[] = [
  // 1. Maxilla to Cranial Base
  {
    key: 'nasolabialAngle',
    label: '1. Nasiolabial Angle',
    category: 'Maxilla to Cranial Base',
    unit: '°',
    normalText: () => '102° ± 8° (94° - 110°)',
    getNormalRange: () => ({ minNormal: 94, maxNormal: 110 }),
    evaluateInference: (val: number) => {
      if (val < 94) return { inference: 'Acute Nasiolabial Angle / Upper Lip Protrusion', status: 'abnormal' };
      if (val > 110) return { inference: 'Obtuse Nasiolabial Angle / Upper Lip Retrusion', status: 'abnormal' };
      return { inference: 'Normal Lip Profile Angle', status: 'normal' };
    },
  },
  {
    key: 'naPerpToPointA',
    label: '2. Na-perp to Point A',
    category: 'Maxilla to Cranial Base',
    unit: 'mm',
    normalText: () => '0 to 1 mm',
    getNormalRange: () => ({ minNormal: 0, maxNormal: 1 }),
    evaluateInference: (val: number) => {
      if (val > 1) return { inference: 'Maxillary Skeletal Protrusion', status: 'abnormal' };
      if (val < 0) return { inference: 'Maxillary Skeletal Retrusion', status: 'abnormal' };
      return { inference: 'Normal Maxillary AP Position', status: 'normal' };
    },
  },

  // 2. Maxilla to Mandible
  {
    key: 'mandibularLengthCoGn',
    label: '3. Mandibular Length (Co-Gn)',
    category: 'Maxilla to Mandible',
    unit: 'mm',
    normalText: (frame: SizeFrame) => (frame === 'small' ? '97-103 mm' : frame === 'medium' ? '105-120 mm' : '121-135 mm'),
    getNormalRange: (frame: SizeFrame) =>
      frame === 'small'
        ? { minNormal: 97, maxNormal: 103 }
        : frame === 'medium'
        ? { minNormal: 105, maxNormal: 120 }
        : { minNormal: 121, maxNormal: 135 },
    evaluateInference: (val: number, frame: SizeFrame) => {
      const { minNormal, maxNormal } =
        frame === 'small'
          ? { minNormal: 97, maxNormal: 103 }
          : frame === 'medium'
          ? { minNormal: 105, maxNormal: 120 }
          : { minNormal: 121, maxNormal: 135 };
      if (val < minNormal) return { inference: 'Decreased Mandibular Effective Length', status: 'abnormal' };
      if (val > maxNormal) return { inference: 'Increased Mandibular Effective Length', status: 'abnormal' };
      return { inference: 'Normal Mandibular Length', status: 'normal' };
    },
  },
  {
    key: 'maxillaryLengthCoPointA',
    label: '4. Maxillary Length (Co-Point A)',
    category: 'Maxilla to Mandible',
    unit: 'mm',
    normalText: (frame: SizeFrame) => (frame === 'small' ? '75-82 mm' : frame === 'medium' ? '83-92 mm' : '93-102 mm'),
    getNormalRange: (frame: SizeFrame) =>
      frame === 'small'
        ? { minNormal: 75, maxNormal: 82 }
        : frame === 'medium'
        ? { minNormal: 83, maxNormal: 92 }
        : { minNormal: 93, maxNormal: 102 },
    evaluateInference: (val: number, frame: SizeFrame) => {
      const { minNormal, maxNormal } =
        frame === 'small'
          ? { minNormal: 75, maxNormal: 82 }
          : frame === 'medium'
          ? { minNormal: 83, maxNormal: 92 }
          : { minNormal: 93, maxNormal: 102 };
      if (val < minNormal) return { inference: 'Decreased Maxillary Effective Length', status: 'abnormal' };
      if (val > maxNormal) return { inference: 'Increased Maxillary Effective Length', status: 'abnormal' };
      return { inference: 'Normal Maxillary Length', status: 'normal' };
    },
  },
  {
    key: 'maxMandDifference',
    label: '5. Max-Mand Difference',
    category: 'Maxilla to Mandible',
    unit: 'mm',
    normalText: (frame: SizeFrame) =>
      frame === 'small' ? '20 to 23 mm' : frame === 'medium' ? '27 to 30 mm' : '30 to 33 mm',
    getNormalRange: (frame: SizeFrame) =>
      frame === 'small'
        ? { minNormal: 20, maxNormal: 23 }
        : frame === 'medium'
        ? { minNormal: 27, maxNormal: 30 }
        : { minNormal: 30, maxNormal: 33 },
    evaluateInference: (val: number, frame: SizeFrame) => {
      const { minNormal, maxNormal } =
        frame === 'small'
          ? { minNormal: 20, maxNormal: 23 }
          : frame === 'medium'
          ? { minNormal: 27, maxNormal: 30 }
          : { minNormal: 30, maxNormal: 33 };
      if (val < minNormal)
        return { inference: 'Mandibular Length Deficiency / Class II Discrepancy', status: 'abnormal' };
      if (val > maxNormal)
        return { inference: 'Mandibular Length Excess / Class III Discrepancy', status: 'abnormal' };
      return { inference: 'Normal Maxilla-Mandible Difference', status: 'normal' };
    },
  },

  // 3. Mandible to Cranial Base
  {
    key: 'mandibularPlaneAngle',
    label: '6. Mandibular Plane (FH-Go-Me)',
    category: 'Mandible to Cranial Base',
    unit: '°',
    normalText: () => '22° ± 4° (18° - 26°)',
    getNormalRange: () => ({ minNormal: 18, maxNormal: 26 }),
    evaluateInference: (val: number) => {
      if (val > 26) return { inference: 'High Mandibular Plane Angle / Vertical Growth', status: 'abnormal' };
      if (val < 18) return { inference: 'Low Mandibular Plane Angle / Horizontal Growth', status: 'abnormal' };
      return { inference: 'Normodivergent Mandibular Plane', status: 'normal' };
    },
  },
  {
    key: 'facialAxis',
    label: '7. Facial Axis (Ba-N)-(Ptm-Gn)',
    category: 'Mandible to Cranial Base',
    unit: '°',
    normalText: () => '0° ± 3.5° (-3.5° to +3.5°)',
    getNormalRange: () => ({ minNormal: -3.5, maxNormal: 3.5 }),
    evaluateInference: (val: number) => {
      if (val < -3.5) return { inference: 'Backward Chin Growth Direction', status: 'abnormal' };
      if (val > 3.5) return { inference: 'Forward Chin Growth Direction', status: 'abnormal' };
      return { inference: 'Normal Growth Axis', status: 'normal' };
    },
  },
  {
    key: 'pogNaPerp',
    label: '8. Pog-Na perp',
    category: 'Mandible to Cranial Base',
    unit: 'mm',
    normalText: (frame: SizeFrame) =>
      frame === 'small' ? '-8 to -6 mm' : frame === 'medium' ? '-4 to 0 mm' : '-15 to -2 mm',
    getNormalRange: (frame: SizeFrame) =>
      frame === 'small'
        ? { minNormal: -8, maxNormal: -6 }
        : frame === 'medium'
        ? { minNormal: -4, maxNormal: 0 }
        : { minNormal: -15, maxNormal: -2 },
    evaluateInference: (val: number, frame: SizeFrame) => {
      const { minNormal, maxNormal } =
        frame === 'small'
          ? { minNormal: -8, maxNormal: -6 }
          : frame === 'medium'
          ? { minNormal: -4, maxNormal: 0 }
          : { minNormal: -15, maxNormal: -2 };
      if (val < minNormal) return { inference: 'Mandibular Skeletal Retrusion', status: 'abnormal' };
      if (val > maxNormal) return { inference: 'Mandibular Skeletal Protrusion', status: 'abnormal' };
      return { inference: 'Normal Chin Position relative to Na-perp', status: 'normal' };
    },
  },

  // 4. Dentition
  {
    key: 'upperIncisorToPointA',
    label: '9. Upper Incisor to Point A',
    category: 'Dentition',
    unit: 'mm',
    normalText: () => '4 to 6 mm',
    getNormalRange: () => ({ minNormal: 4, maxNormal: 6 }),
    evaluateInference: (val: number) => {
      if (val > 6) return { inference: 'Upper Incisor Protrusion', status: 'abnormal' };
      if (val < 4) return { inference: 'Upper Incisor Retrusion', status: 'abnormal' };
      return { inference: 'Normal Upper Incisor Position', status: 'normal' };
    },
  },
  {
    key: 'lowerIncisorToPointA',
    label: '10. Lower Incisor to Point A',
    category: 'Dentition',
    unit: 'mm',
    normalText: () => '1 to 3 mm',
    getNormalRange: () => ({ minNormal: 1, maxNormal: 3 }),
    evaluateInference: (val: number) => {
      if (val > 3) return { inference: 'Lower Incisor Protrusion', status: 'abnormal' };
      if (val < 1) return { inference: 'Lower Incisor Retrusion', status: 'abnormal' };
      return { inference: 'Normal Lower Incisor Position', status: 'normal' };
    },
  },

  // 5. Airway
  {
    key: 'upperPharynx',
    label: '11. Upper Pharynx Width',
    category: 'Airway',
    unit: 'mm',
    normalText: () => '15 to 20 mm',
    getNormalRange: () => ({ minNormal: 15, maxNormal: 20 }),
    evaluateInference: (val: number) => {
      if (val < 15) return { inference: 'Upper Airway Constriction', status: 'abnormal' };
      if (val > 20) return { inference: 'Wide Upper Airway', status: 'abnormal' };
      return { inference: 'Normal Upper Airway Space', status: 'normal' };
    },
  },
  {
    key: 'lowerPharynx',
    label: '12. Lower Pharynx Width',
    category: 'Airway',
    unit: 'mm',
    normalText: () => '11 to 14 mm',
    getNormalRange: () => ({ minNormal: 11, maxNormal: 14 }),
    evaluateInference: (val: number) => {
      if (val < 11) return { inference: 'Lower Airway Narrowing', status: 'abnormal' };
      if (val > 14) return { inference: 'Wide Lower Airway', status: 'abnormal' };
      return { inference: 'Normal Lower Airway Space', status: 'normal' };
    },
  },
];

export const DEFAULT_MCNAMARA_PARAMS: McnamaraParametersMap = {
  nasolabialAngle: { pre: '', mid: '', post: '' },
  naPerpToPointA: { pre: '', mid: '', post: '' },
  mandibularLengthCoGn: { pre: '', mid: '', post: '' },
  maxillaryLengthCoPointA: { pre: '', mid: '', post: '' },
  maxMandDifference: { pre: '', mid: '', post: '' },
  mandibularPlaneAngle: { pre: '', mid: '', post: '' },
  facialAxis: { pre: '', mid: '', post: '' },
  pogNaPerp: { pre: '', mid: '', post: '' },
  upperIncisorToPointA: { pre: '', mid: '', post: '' },
  lowerIncisorToPointA: { pre: '', mid: '', post: '' },
  upperPharynx: { pre: '', mid: '', post: '' },
  lowerPharynx: { pre: '', mid: '', post: '' },
};

const CLASS_II_MCNAMARA_SAMPLE: McnamaraParametersMap = {
  nasolabialAngle: { pre: 88, mid: 98, post: 102 },
  naPerpToPointA: { pre: 4, mid: 2, post: 1 },
  mandibularLengthCoGn: { pre: 100, mid: 108, post: 114 },
  maxillaryLengthCoPointA: { pre: 88, mid: 88, post: 88 },
  maxMandDifference: { pre: 12, mid: 20, post: 26 },
  mandibularPlaneAngle: { pre: 31, mid: 27, post: 23 },
  facialAxis: { pre: -5, mid: -2, post: 0 },
  pogNaPerp: { pre: -9, mid: -5, post: -2 },
  upperIncisorToPointA: { pre: 8, mid: 6, post: 5 },
  lowerIncisorToPointA: { pre: 0, mid: 1, post: 2 },
  upperPharynx: { pre: 12, mid: 15, post: 17 },
  lowerPharynx: { pre: 9, mid: 11, post: 13 },
};

const CLASS_III_MCNAMARA_SAMPLE: McnamaraParametersMap = {
  nasolabialAngle: { pre: 115, mid: 108, post: 103 },
  naPerpToPointA: { pre: -2, mid: 0, post: 1 },
  mandibularLengthCoGn: { pre: 128, mid: 124, post: 120 },
  maxillaryLengthCoPointA: { pre: 85, mid: 87, post: 90 },
  maxMandDifference: { pre: 43, mid: 37, post: 30 },
  mandibularPlaneAngle: { pre: 16, mid: 20, post: 24 },
  facialAxis: { pre: 6, mid: 3, post: 0 },
  pogNaPerp: { pre: 3, mid: 1, post: -1 },
  upperIncisorToPointA: { pre: 2, mid: 4, post: 5 },
  lowerIncisorToPointA: { pre: -1, mid: 1, post: 2 },
  upperPharynx: { pre: 22, mid: 19, post: 18 },
  lowerPharynx: { pre: 16, mid: 14, post: 13 },
};

export interface McnamaraAnalysisProps {
  data?: McnamaraAnalysisData;
  onChange?: (updatedData: McnamaraAnalysisData) => void;
  activeStage?: 'pre' | 'mid' | 'post';
  isOpen?: boolean;
  onToggle?: () => void;
}

export const McnamaraAnalysis: React.FC<McnamaraAnalysisProps> = ({
  data,
  onChange,
  activeStage = 'pre',
  isOpen = true,
  onToggle,
}) => {
  const currentStage: 'pre' | 'mid' | 'post' = (activeStage as 'pre' | 'mid' | 'post') || 'pre';

  const [sizeFrame, setSizeFrame] = useState<SizeFrame>(data?.sizeFrame || 'medium');

  const [params, setParams] = useState<McnamaraParametersMap>(() => {
    if (data?.parameters) {
      return { ...DEFAULT_MCNAMARA_PARAMS, ...data.parameters };
    }
    return DEFAULT_MCNAMARA_PARAMS;
  });

  const [conclusion, setConclusion] = useState<string>(data?.conclusion || '');
  const [userEditedConclusion, setUserEditedConclusion] = useState<boolean>(!!data?.conclusion);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (data?.parameters) {
      setParams((prev) => {
        const isSame = MCNAMARA_PARAMETERS_META.every(
          (p) =>
            prev[p.key]?.pre === data.parameters?.[p.key]?.pre &&
            prev[p.key]?.mid === data.parameters?.[p.key]?.mid &&
            prev[p.key]?.post === data.parameters?.[p.key]?.post
        );
        return isSame ? prev : { ...prev, ...data.parameters };
      });
    }
    if (data?.sizeFrame && data.sizeFrame !== sizeFrame) {
      setSizeFrame(data.sizeFrame);
    }
    if (data?.conclusion !== undefined && data.conclusion !== conclusion) {
      setConclusion(data.conclusion);
    }
  }, [data]);

  const generateMcnamaraSummary = (
    currentParams: McnamaraParametersMap,
    stage: 'pre' | 'mid' | 'post',
    frame: SizeFrame
  ) => {
    const stageLabel =
      stage === 'pre'
        ? 'Pre-treatment'
        : stage === 'mid'
        ? 'Mid-treatment'
        : 'Post-treatment';

    const findings: string[] = [];

    MCNAMARA_PARAMETERS_META.forEach((meta) => {
      const val = currentParams[meta.key]?.[stage];
      if (val !== '' && val !== undefined && !isNaN(Number(val))) {
        const num = Number(val);
        const res = meta.evaluateInference(num, frame);
        findings.push(res.inference);
      }
    });

    if (findings.length === 0) {
      return `Please enter ${stageLabel.toLowerCase()} measurement values in McNamara Analysis section to auto-generate the diagnostic conclusion.`;
    }

    return `McNamara Summary (${stageLabel}, ${frame.toUpperCase()} frame): Patient presents with ${findings.join(', ')}.`;
  };

  const handleInputChange = (
    key: McnamaraParameterKey,
    stage: 'pre' | 'mid' | 'post',
    rawValue: string
  ) => {
    const numVal = rawValue === '' ? '' : Number(rawValue);

    let updatedParams: McnamaraParametersMap = {
      ...params,
      [key]: {
        ...params[key],
        [stage]: numVal,
      },
    };

    // Auto calculate Max-Mand difference if Co-Gn and Co-Point A exist
    if (key === 'mandibularLengthCoGn' || key === 'maxillaryLengthCoPointA') {
      const coGn = key === 'mandibularLengthCoGn' ? numVal : params.mandibularLengthCoGn[stage];
      const coPointA = key === 'maxillaryLengthCoPointA' ? numVal : params.maxillaryLengthCoPointA[stage];

      if (coGn !== '' && coPointA !== '' && !isNaN(Number(coGn)) && !isNaN(Number(coPointA))) {
        const autoDiff = Number(coGn) - Number(coPointA);
        updatedParams.maxMandDifference = {
          ...updatedParams.maxMandDifference,
          [stage]: autoDiff,
        };
      }
    }

    setParams(updatedParams);
    const nextSummary = userEditedConclusion
      ? conclusion
      : generateMcnamaraSummary(updatedParams, currentStage, sizeFrame);
    if (!userEditedConclusion) {
      setConclusion(nextSummary);
    }
    notifyChange(updatedParams, sizeFrame, nextSummary);
  };

  const handleFrameChange = (newFrame: SizeFrame) => {
    setSizeFrame(newFrame);
    const nextSummary = userEditedConclusion
      ? conclusion
      : generateMcnamaraSummary(params, currentStage, newFrame);
    if (!userEditedConclusion) {
      setConclusion(nextSummary);
    }
    notifyChange(params, newFrame, nextSummary);
  };

  const notifyChange = (
    updatedParams: McnamaraParametersMap,
    updatedFrame: SizeFrame,
    updatedConclusion: string
  ) => {
    if (onChange) {
      onChange({
        sizeFrame: updatedFrame,
        parameters: updatedParams,
        conclusion: updatedConclusion,
      });
    }
  };

  const getFieldValidation = (val: number | '', meta: McnamaraParameterMeta) => {
    if (val === '' || isNaN(Number(val))) {
      return {
        status: 'empty',
        className: 'bg-white border-slate-300 text-slate-900 focus:ring-amber-500/20 focus:border-amber-600',
      };
    }
    const num = Number(val);
    const { minNormal, maxNormal } = meta.getNormalRange(sizeFrame);
    const isWithinRange = num >= minNormal && num <= maxNormal;
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

  const inferences = useMemo(() => {
    const result: Record<
      McnamaraParameterKey,
      { inference: string; status: 'normal' | 'abnormal' | 'empty' }
    > = {} as any;

    MCNAMARA_PARAMETERS_META.forEach((meta) => {
      const val = params[meta.key]?.[currentStage];
      if (val === '' || val === undefined || isNaN(Number(val))) {
        result[meta.key] = { inference: 'Enter value to analyze', status: 'empty' };
      } else {
        const res = meta.evaluateInference(Number(val), sizeFrame);
        result[meta.key] = { inference: res.inference, status: res.status };
      }
    });

    return result;
  }, [params, currentStage, sizeFrame]);

  const autoGeneratedSummary = useMemo(
    () => generateMcnamaraSummary(params, currentStage, sizeFrame),
    [params, currentStage, sizeFrame]
  );

  useEffect(() => {
    if (!userEditedConclusion) {
      setConclusion(autoGeneratedSummary);
    }
  }, [autoGeneratedSummary, userEditedConclusion]);

  const handleConclusionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserEditedConclusion(true);
    setConclusion(e.target.value);
    notifyChange(params, sizeFrame, e.target.value);
  };

  const handleResetConclusion = () => {
    setUserEditedConclusion(false);
    setConclusion(autoGeneratedSummary);
    notifyChange(params, sizeFrame, autoGeneratedSummary);
  };

  const handleLoadSample = (sample: McnamaraParametersMap) => {
    setParams(sample);
    setUserEditedConclusion(false);
    notifyChange(sample, sizeFrame, autoGeneratedSummary);
  };

  const handleResetAll = () => {
    setParams(DEFAULT_MCNAMARA_PARAMS);
    setUserEditedConclusion(false);
    const emptySummary = `Please enter measurement values to auto-generate McNamara Cephalometric diagnostic conclusion.`;
    setConclusion(emptySummary);
    notifyChange(DEFAULT_MCNAMARA_PARAMS, sizeFrame, emptySummary);
  };

  const handleCopyConclusion = () => {
    navigator.clipboard.writeText(conclusion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeCount = useMemo(() => {
    return MCNAMARA_PARAMETERS_META.filter((m) => params[m.key]?.[currentStage] !== '').length;
  }, [params, currentStage]);

  const abnormalCount = useMemo(() => {
    return MCNAMARA_PARAMETERS_META.filter((m) => {
      const val = params[m.key]?.[currentStage];
      if (val === '' || val === undefined) return false;
      return m.evaluateInference(Number(val), sizeFrame).status === 'abnormal';
    }).length;
  }, [params, currentStage, sizeFrame]);

  const stageDisplayLabel =
    currentStage === 'pre' ? 'Pre' : currentStage === 'mid' ? 'Mid' : 'Post';

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

  const renderMobileParamRows = (
    category:
      | 'Maxilla to Cranial Base'
      | 'Maxilla to Mandible'
      | 'Mandible to Cranial Base'
      | 'Dentition'
      | 'Airway',
    title: string
  ) => (
    <div className="space-y-2 w-full max-w-full box-border">
      <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-800">
        {title}
      </div>
      {MCNAMARA_PARAMETERS_META.filter((m) => m.category === category).map((meta) => {
        const currentVal = params[meta.key]?.[currentStage] ?? '';
        const validation = getFieldValidation(currentVal, meta);
        const activeInference = inferences[meta.key];

        return (
          <div
            key={meta.key}
            className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-2 w-full max-w-full box-border"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 leading-snug whitespace-normal break-words">{meta.label}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 whitespace-normal break-words">
                  Norm {meta.normalText(sizeFrame)}
                  <span className="ml-1.5 text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                    {meta.unit}
                  </span>
                </p>
              </div>
              <input
                type="number"
                step="0.1"
                value={currentVal}
                onChange={(e) => handleInputChange(meta.key, currentStage, e.target.value)}
                placeholder="Val"
                aria-label={`${meta.label} ${stageDisplayLabel}`}
                className={`w-20 shrink-0 text-center py-1.5 px-1.5 border rounded-lg text-xs font-semibold ${validation.className}`}
              />
            </div>
            <div className="whitespace-normal break-words">{renderInference(activeInference)}</div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs transition-all w-full max-w-full box-border">
      {/* Accordion Card Header */}
      <div
        onClick={onToggle}
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-slate-50 transition-colors gap-2"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              McNamara Analysis
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                12 Parameters
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Maxilla, Mandible, Dentition & Airway Widths ({sizeFrame.toUpperCase()} Frame)
            </p>
          </div>
        </div>

        {/* Right Badges & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
              <Activity className="w-3 h-3 text-indigo-600" />
              {activeCount}/12 Measured
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

          <div className="flex items-center gap-1 text-slate-500">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-3 sm:p-5 border-t border-slate-200 space-y-4 bg-slate-50/50">
          {/* Controls & Size Frame Selector Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                Size Frame:
              </span>
              <div className="inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                {(['small', 'medium', 'large'] as SizeFrame[]).map((frame) => (
                  <button
                    key={frame}
                    type="button"
                    onClick={() => handleFrameChange(frame)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all uppercase ${
                      sizeFrame === frame
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {frame}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleLoadSample(CLASS_II_MCNAMARA_SAMPLE)}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                Class II Sample
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample(CLASS_III_MCNAMARA_SAMPLE)}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-900 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-blue-600" />
                Class III Sample
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-slate-600" />
                Reset
              </button>
            </div>
          </div>

          {/* Mobile: stacked parameter rows */}
          <div className="space-y-3 md:hidden">
            {renderMobileParamRows('Maxilla to Cranial Base', '1. Maxilla to Cranial Base')}
            {renderMobileParamRows('Maxilla to Mandible', '2. Maxilla to Mandible')}
            {renderMobileParamRows('Mandible to Cranial Base', '3. Mandible to Cranial Base')}
            {renderMobileParamRows('Dentition', '4. Dentition')}
            {renderMobileParamRows('Airway', '5. Airway')}
          </div>

          {/* Desktop: 4-column table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs w-full max-w-full box-border">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] sm:text-xs uppercase tracking-wider font-bold">
                    <th className="py-2.5 px-3 w-[42%] whitespace-normal break-words">Parameter Name</th>
                    <th className="py-2.5 px-2 text-center w-[23%] whitespace-normal break-words">
                      Normal ({sizeFrame.toUpperCase()})
                    </th>
                    <th className="py-2.5 px-2 text-center w-[20%] bg-indigo-900 text-indigo-200 font-extrabold border-b-2 border-indigo-400 whitespace-normal break-words">
                      Input ({stageDisplayLabel})
                    </th>
                    <th className="py-2.5 px-3 w-[15%] whitespace-normal break-words">Auto Inference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                  {/* Category 1: Maxilla to Cranial Base */}
                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                    <td colSpan={4} className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300">
                      1. Maxilla to Cranial Base
                    </td>
                  </tr>
                  {MCNAMARA_PARAMETERS_META.filter((m) => m.category === 'Maxilla to Cranial Base').map((meta) => {
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
                          {meta.normalText(sizeFrame)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={currentVal}
                            onChange={(e) => handleInputChange(meta.key, currentStage, e.target.value)}
                            placeholder="Val"
                            className={`w-full text-center py-1 px-2 border rounded-lg text-xs sm:text-sm transition-colors font-semibold ${validation.className}`}
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          {activeInference.status === 'empty' ? (
                            <span className="text-slate-400 text-xs italic">Enter value</span>
                          ) : activeInference.status === 'normal' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              {activeInference.inference}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-rose-900 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full">
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              {activeInference.inference}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Category 2: Maxilla to Mandible */}
                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                    <td colSpan={4} className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300">
                      2. Maxilla to Mandible (Skeletal Relationship)
                    </td>
                  </tr>
                  {MCNAMARA_PARAMETERS_META.filter((m) => m.category === 'Maxilla to Mandible').map((meta) => {
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
                          {meta.normalText(sizeFrame)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={currentVal}
                            onChange={(e) => handleInputChange(meta.key, currentStage, e.target.value)}
                            placeholder="Val"
                            className={`w-full text-center py-1 px-2 border rounded-lg text-xs sm:text-sm transition-colors font-semibold ${validation.className}`}
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          {activeInference.status === 'empty' ? (
                            <span className="text-slate-400 text-xs italic">Enter value</span>
                          ) : activeInference.status === 'normal' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              {activeInference.inference}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-rose-900 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full">
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              {activeInference.inference}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Category 3: Mandible to Cranial Base */}
                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                    <td colSpan={4} className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300">
                      3. Mandible to Cranial Base
                    </td>
                  </tr>
                  {MCNAMARA_PARAMETERS_META.filter((m) => m.category === 'Mandible to Cranial Base').map((meta) => {
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
                          {meta.normalText(sizeFrame)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={currentVal}
                            onChange={(e) => handleInputChange(meta.key, currentStage, e.target.value)}
                            placeholder="Val"
                            className={`w-full text-center py-1 px-2 border rounded-lg text-xs sm:text-sm transition-colors font-semibold ${validation.className}`}
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          {activeInference.status === 'empty' ? (
                            <span className="text-slate-400 text-xs italic">Enter value</span>
                          ) : activeInference.status === 'normal' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              {activeInference.inference}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-rose-900 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full">
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              {activeInference.inference}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Category 4: Dentition */}
                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                    <td colSpan={4} className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300">
                      4. Dentition
                    </td>
                  </tr>
                  {MCNAMARA_PARAMETERS_META.filter((m) => m.category === 'Dentition').map((meta) => {
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
                          {meta.normalText(sizeFrame)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={currentVal}
                            onChange={(e) => handleInputChange(meta.key, currentStage, e.target.value)}
                            placeholder="Val"
                            className={`w-full text-center py-1 px-2 border rounded-lg text-xs sm:text-sm transition-colors font-semibold ${validation.className}`}
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          {activeInference.status === 'empty' ? (
                            <span className="text-slate-400 text-xs italic">Enter value</span>
                          ) : activeInference.status === 'normal' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              {activeInference.inference}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-rose-900 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full">
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              {activeInference.inference}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Category 5: Airway */}
                  <tr className="bg-slate-100 font-bold text-slate-800 text-[11px] tracking-wider uppercase">
                    <td colSpan={4} className="py-1.5 px-3 bg-slate-100 text-slate-900 font-extrabold border-t border-b border-slate-300">
                      5. Airway Dimensions
                    </td>
                  </tr>
                  {MCNAMARA_PARAMETERS_META.filter((m) => m.category === 'Airway').map((meta) => {
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
                          {meta.normalText(sizeFrame)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            step="0.1"
                            value={currentVal}
                            onChange={(e) => handleInputChange(meta.key, currentStage, e.target.value)}
                            placeholder="Val"
                            className={`w-full text-center py-1 px-2 border rounded-lg text-xs sm:text-sm transition-colors font-semibold ${validation.className}`}
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          {activeInference.status === 'empty' ? (
                            <span className="text-slate-400 text-xs italic">Enter value</span>
                          ) : activeInference.status === 'normal' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              {activeInference.inference}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-rose-900 bg-rose-100 border border-rose-300 px-2.5 py-0.5 rounded-full">
                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                              {activeInference.inference}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* DYNAMIC DIAGNOSTIC CONCLUSION BOX */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 space-y-2.5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <h5 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                McNamara Diagnostic Conclusion ({stageDisplayLabel} Stage)
              </h5>
              <div className="flex items-center gap-2">
                {userEditedConclusion && (
                  <button
                    type="button"
                    onClick={handleResetConclusion}
                    className="text-xs font-bold text-indigo-700 hover:text-indigo-800 underline inline-flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCopyConclusion}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      Copy Conclusion
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={conclusion}
              onChange={handleConclusionChange}
              placeholder="Diagnostic summary concatenates row inferences in real time..."
              className="w-full p-3 border border-slate-300 rounded-lg text-slate-900 text-xs sm:text-sm font-medium bg-white leading-relaxed focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};
