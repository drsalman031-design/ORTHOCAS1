import React, { useState, useEffect, useMemo } from 'react';
import {
  CephDiscrepancyParameterKey,
  CephDiscrepancyParametersMap,
  CephDiscrepancyAnalysisData,
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
  Activity,
  ChevronDown,
  ChevronUp,
  Layers,
  Zap,
  Target,
  ShieldAlert,
} from 'lucide-react';

export interface CephDiscrepancyParameterMeta {
  key: CephDiscrepancyParameterKey;
  label: string;
  category: 'Sagittal Skeletal Relation' | 'Maxillary & Mandibular Apical Base Discrepancy';
  unit: string;
  normalText: (gender: 'Male' | 'Female') => string;
  getNormalRange: (gender: 'Male' | 'Female') => { minNormal: number; maxNormal: number };
  evaluateInference: (
    val: number,
    gender: 'Male' | 'Female'
  ) => {
    inference: string;
    status: 'normal' | 'abnormal';
  };
}

export const CEPH_DISCREPANCY_PARAMETERS_META: CephDiscrepancyParameterMeta[] = [
  // --- A. Sagittal Skeletal Relation Parameters (12) ---
  {
    key: 'anbAngle',
    label: 'ANB Angle (Skeletal Relationship)',
    category: 'Sagittal Skeletal Relation',
    unit: '°',
    normalText: () => '2° (0° to 4°)',
    getNormalRange: () => ({ minNormal: 0, maxNormal: 4 }),
    evaluateInference: (val) => {
      if (val > 4) return { inference: `Skeletal Class II Discrepancy (${val <= 6 ? 'Mild' : val <= 8 ? 'Moderate' : 'Severe'})`, status: 'abnormal' };
      if (val < 0) return { inference: 'Skeletal Class III Discrepancy', status: 'abnormal' };
      return { inference: 'Skeletal Class I Relationship', status: 'normal' };
    },
  },
  {
    key: 'aMoBFh',
    label: 'A-MoB-^nFH',
    category: 'Sagittal Skeletal Relation',
    unit: 'mm',
    normalText: () => '4 mm (2 to 6 mm)',
    getNormalRange: () => ({ minNormal: 2, maxNormal: 6 }),
    evaluateInference: (val) => {
      if (val > 6) return { inference: 'Increased Maxillomandibular AP Distance', status: 'abnormal' };
      if (val < 2) return { inference: 'Decreased Maxillomandibular AP Distance', status: 'abnormal' };
      return { inference: 'Normal Maxillomandibular AP Alignment', status: 'normal' };
    },
  },
  {
    key: 'witsAoBo',
    label: 'AO to BO (Wits Appraisal)',
    category: 'Sagittal Skeletal Relation',
    unit: 'mm',
    normalText: () => '0 to 1 mm (-1 to 1 mm)',
    getNormalRange: () => ({ minNormal: -1, maxNormal: 1 }),
    evaluateInference: (val) => {
      if (val > 3) return { inference: 'Wits Class II Discrepancy', status: 'abnormal' };
      if (val > 1) return { inference: 'Mild Wits Class II Tendency', status: 'abnormal' };
      if (val < -1) return { inference: 'Wits Class III Discrepancy', status: 'abnormal' };
      return { inference: 'Harmonious Wits Skeletal Relation', status: 'normal' };
    },
  },
  {
    key: 'betaAngle',
    label: 'Beta Angle',
    category: 'Sagittal Skeletal Relation',
    unit: '°',
    normalText: () => '27° to 35°',
    getNormalRange: () => ({ minNormal: 27, maxNormal: 35 }),
    evaluateInference: (val) => {
      if (val < 27) return { inference: 'Class II Skeletal Discrepancy', status: 'abnormal' };
      if (val > 35) return { inference: 'Class III Skeletal Discrepancy', status: 'abnormal' };
      return { inference: 'Class I Skeletal Pattern', status: 'normal' };
    },
  },
  {
    key: 'naPog',
    label: 'NA-Pog (Angle of Convexity)',
    category: 'Sagittal Skeletal Relation',
    unit: '°',
    normalText: () => '0° to 5°',
    getNormalRange: () => ({ minNormal: 0, maxNormal: 5 }),
    evaluateInference: (val) => {
      if (val > 5) return { inference: 'Convex Skeletal Profile (Class II Tendency)', status: 'abnormal' };
      if (val < 0) return { inference: 'Concave Skeletal Profile (Class III Tendency)', status: 'abnormal' };
      return { inference: 'Straight Skeletal Profile', status: 'normal' };
    },
  },
  {
    key: 'abNpog',
    label: 'AB-NPog Angle',
    category: 'Sagittal Skeletal Relation',
    unit: '°',
    normalText: () => '-4° (-6° to -2°)',
    getNormalRange: () => ({ minNormal: -6, maxNormal: -2 }),
    evaluateInference: (val) => {
      if (val > -2) return { inference: 'Class III AP Relation Tendency', status: 'abnormal' };
      if (val < -6) return { inference: 'Class II AP Relation Tendency', status: 'abnormal' };
      return { inference: 'Normal AB-NPog Relation', status: 'normal' };
    },
  },
  {
    key: 'maxMandRatio',
    label: 'Max:Mand Ratio (Maxillary/Mandibular Length)',
    category: 'Sagittal Skeletal Relation',
    unit: 'ratio',
    normalText: () => '2:3 (0.67)',
    getNormalRange: () => ({ minNormal: 0.63, maxNormal: 0.70 }),
    evaluateInference: (val) => {
      if (val > 0.70) return { inference: 'Relative Maxillary Excess or Mandibular Deficiency', status: 'abnormal' };
      if (val < 0.63) return { inference: 'Relative Mandibular Excess or Maxillary Deficiency', status: 'abnormal' };
      return { inference: 'Balanced Maxillomandibular Ratio', status: 'normal' };
    },
  },
  {
    key: 'harvoldUnitDiff',
    label: "Harvold's Unit Length Difference",
    category: 'Sagittal Skeletal Relation',
    unit: 'mm',
    normalText: () => '20 to 30 mm (Chart Ref)',
    getNormalRange: () => ({ minNormal: 20, maxNormal: 30 }),
    evaluateInference: (val) => {
      if (val > 30) return { inference: 'Increased Unit Difference (Mandibular Excess / Class III)', status: 'abnormal' };
      if (val < 20) return { inference: 'Decreased Unit Difference (Mandibular Deficiency / Class II)', status: 'abnormal' };
      return { inference: 'Harmonious Unit Length Difference', status: 'normal' };
    },
  },
  {
    key: 'softTissueProfileAngle',
    label: 'Soft Tissue Profile Angle',
    category: 'Sagittal Skeletal Relation',
    unit: '°',
    normalText: () => '161° (155° to 167°)',
    getNormalRange: () => ({ minNormal: 155, maxNormal: 167 }),
    evaluateInference: (val) => {
      if (val < 155) return { inference: 'Convex Soft Tissue Profile', status: 'abnormal' };
      if (val > 167) return { inference: 'Concave Soft Tissue Profile', status: 'abnormal' };
      return { inference: 'Straight Soft Tissue Profile', status: 'normal' };
    },
  },
  {
    key: 'totalTissueProfileAngle',
    label: 'Total Tissue Profile Angle',
    category: 'Sagittal Skeletal Relation',
    unit: '°',
    normalText: (gender) => (gender === 'Male' ? '133° (128° to 138°)' : '137° (132° to 142°)'),
    getNormalRange: (gender) =>
      gender === 'Male' ? { minNormal: 128, maxNormal: 138 } : { minNormal: 132, maxNormal: 142 },
    evaluateInference: (val, gender) => {
      const { minNormal, maxNormal } =
        gender === 'Male' ? { minNormal: 128, maxNormal: 138 } : { minNormal: 132, maxNormal: 142 };
      if (val < minNormal) return { inference: 'Increased Total Profile Convexity', status: 'abnormal' };
      if (val > maxNormal) return { inference: 'Decreased Total Profile Convexity', status: 'abnormal' };
      return { inference: 'Normal Total Profile Angle', status: 'normal' };
    },
  },
  {
    key: 'softTissueFacialAngle',
    label: 'Soft Tissue Facial Angle',
    category: 'Sagittal Skeletal Relation',
    unit: '°',
    normalText: () => '97° (87° to 107°)',
    getNormalRange: () => ({ minNormal: 87, maxNormal: 107 }),
    evaluateInference: (val) => {
      if (val < 87) return { inference: 'Retrusive Soft Tissue Chin', status: 'abnormal' };
      if (val > 107) return { inference: 'Protrusive Soft Tissue Chin', status: 'abnormal' };
      return { inference: 'Normal Soft Tissue Chin Position', status: 'normal' };
    },
  },
  {
    key: 'subnasaleToChin',
    label: 'Subnasale-to-Chin',
    category: 'Sagittal Skeletal Relation',
    unit: 'mm',
    normalText: () => '4 to 6 mm',
    getNormalRange: () => ({ minNormal: 4, maxNormal: 6 }),
    evaluateInference: (val) => {
      if (val > 6) return { inference: 'Increased Subnasale-Chin Projection', status: 'abnormal' };
      if (val < 4) return { inference: 'Decreased Subnasale-Chin Projection', status: 'abnormal' };
      return { inference: 'Balanced Subnasale-Chin Distance', status: 'normal' };
    },
  },

  // --- B. Maxillary & Mandibular Apical Base Discrepancy Analysis (9) ---
  {
    key: 'snaAngle',
    label: 'Maxilla - SNA Angle',
    category: 'Maxillary & Mandibular Apical Base Discrepancy',
    unit: '°',
    normalText: () => '82° ± 2° (80° to 84°)',
    getNormalRange: () => ({ minNormal: 80, maxNormal: 84 }),
    evaluateInference: (val) => {
      if (val > 84) return { inference: 'Maxillary Prognathism / AP Excess', status: 'abnormal' };
      if (val < 80) return { inference: 'Maxillary Retrognathism / AP Deficiency', status: 'abnormal' };
      return { inference: 'Normal Maxillary AP Position', status: 'normal' };
    },
  },
  {
    key: 'maxilla1aNl',
    label: 'Maxilla - 1A-N-L',
    category: 'Maxillary & Mandibular Apical Base Discrepancy',
    unit: 'mm',
    normalText: () => '2 mm (0 to 4 mm)',
    getNormalRange: () => ({ minNormal: 0, maxNormal: 4 }),
    evaluateInference: (val) => {
      if (val > 4) return { inference: 'Anterior Maxillary Base Prominence', status: 'abnormal' };
      if (val < 0) return { inference: 'Posterior Maxillary Base Position', status: 'abnormal' };
      return { inference: 'Normal Maxillary Base Position', status: 'normal' };
    },
  },
  {
    key: 'maxPlacementSInfPtmNf',
    label: 'Max Placement S.INF-Ptm ⊥ NF',
    category: 'Maxillary & Mandibular Apical Base Discrepancy',
    unit: 'mm',
    normalText: () => '18 mm (15 to 21 mm)',
    getNormalRange: () => ({ minNormal: 15, maxNormal: 21 }),
    evaluateInference: (val) => {
      if (val > 21) return { inference: 'Increased Posterior Maxillary Height/Position', status: 'abnormal' };
      if (val < 15) return { inference: 'Decreased Posterior Maxillary Height/Position', status: 'abnormal' };
      return { inference: 'Normal Maxillary Structural Placement', status: 'normal' };
    },
  },
  {
    key: 'snbAngle',
    label: 'Mandible - SNB Angle',
    category: 'Maxillary & Mandibular Apical Base Discrepancy',
    unit: '°',
    normalText: () => '80° ± 2° (78° to 82°)',
    getNormalRange: () => ({ minNormal: 78, maxNormal: 82 }),
    evaluateInference: (val) => {
      if (val > 82) return { inference: 'Mandibular Prognathism / AP Excess', status: 'abnormal' };
      if (val < 78) return { inference: 'Mandibular Retrognathism / AP Deficiency', status: 'abnormal' };
      return { inference: 'Normal Mandibular AP Position', status: 'normal' };
    },
  },
  {
    key: 'mandibleB1nL',
    label: 'Mandible - B-1N-L',
    category: 'Maxillary & Mandibular Apical Base Discrepancy',
    unit: 'mm',
    normalText: () => '-2 mm (-4 to 0 mm)',
    getNormalRange: () => ({ minNormal: -4, maxNormal: 0 }),
    evaluateInference: (val) => {
      if (val > 0) return { inference: 'Anterior Mandibular Base Prominence', status: 'abnormal' };
      if (val < -4) return { inference: 'Posterior Mandibular Base Position', status: 'abnormal' };
      return { inference: 'Normal Mandibular Base Position', status: 'normal' };
    },
  },
  {
    key: 'chinNPogFh',
    label: 'Chin - N-Pog-FH (Facial Angle)',
    category: 'Maxillary & Mandibular Apical Base Discrepancy',
    unit: '°',
    normalText: () => '87° (84° to 90°)',
    getNormalRange: () => ({ minNormal: 84, maxNormal: 90 }),
    evaluateInference: (val) => {
      if (val > 90) return { inference: 'Protrusive Chin / Prominent Mandible', status: 'abnormal' };
      if (val < 84) return { inference: 'Recessive Chin / Retrusive Mandible', status: 'abnormal' };
      return { inference: 'Normal Chin Prominence', status: 'normal' };
    },
  },
  {
    key: 'mandCorpusSize',
    label: 'Mand Corpus Size (1.05 * S)',
    category: 'Maxillary & Mandibular Apical Base Discrepancy',
    unit: 'mm',
    normalText: () => '1.05 × S (68 to 88 mm)',
    getNormalRange: () => ({ minNormal: 68, maxNormal: 88 }),
    evaluateInference: (val) => {
      if (val > 88) return { inference: 'Increased Mandibular Corpus Size', status: 'abnormal' };
      if (val < 68) return { inference: 'Decreased Mandibular Corpus Size', status: 'abnormal' };
      return { inference: 'Normal Mandibular Corpus Size', status: 'normal' };
    },
  },
  {
    key: 'basicUpperLip',
    label: 'Basic Upper Lip Thickness',
    category: 'Maxillary & Mandibular Apical Base Discrepancy',
    unit: 'mm',
    normalText: () => '14 to 15 mm',
    getNormalRange: () => ({ minNormal: 13, maxNormal: 16 }),
    evaluateInference: (val) => {
      if (val > 16) return { inference: 'Thick Upper Lip Soft Tissue', status: 'abnormal' };
      if (val < 13) return { inference: 'Thin Upper Lip Soft Tissue', status: 'abnormal' };
      return { inference: 'Normal Upper Lip Thickness', status: 'normal' };
    },
  },
  {
    key: 'softTissueChin',
    label: 'Soft Tissue Chin Thickness',
    category: 'Maxillary & Mandibular Apical Base Discrepancy',
    unit: 'mm',
    normalText: () => '10 to 12 mm',
    getNormalRange: () => ({ minNormal: 9, maxNormal: 13 }),
    evaluateInference: (val) => {
      if (val > 13) return { inference: 'Thick Soft Tissue Chin', status: 'abnormal' };
      if (val < 9) return { inference: 'Thin Soft Tissue Chin', status: 'abnormal' };
      return { inference: 'Normal Soft Tissue Chin Thickness', status: 'normal' };
    },
  },
];

export const DEFAULT_CEPH_DISCREPANCY_PARAMS: CephDiscrepancyParametersMap = {
  anbAngle: { pre: '', mid: '', post: '' },
  aMoBFh: { pre: '', mid: '', post: '' },
  witsAoBo: { pre: '', mid: '', post: '' },
  betaAngle: { pre: '', mid: '', post: '' },
  naPog: { pre: '', mid: '', post: '' },
  abNpog: { pre: '', mid: '', post: '' },
  maxMandRatio: { pre: '', mid: '', post: '' },
  harvoldUnitDiff: { pre: '', mid: '', post: '' },
  softTissueProfileAngle: { pre: '', mid: '', post: '' },
  totalTissueProfileAngle: { pre: '', mid: '', post: '' },
  softTissueFacialAngle: { pre: '', mid: '', post: '' },
  subnasaleToChin: { pre: '', mid: '', post: '' },
  snaAngle: { pre: '', mid: '', post: '' },
  maxilla1aNl: { pre: '', mid: '', post: '' },
  maxPlacementSInfPtmNf: { pre: '', mid: '', post: '' },
  snbAngle: { pre: '', mid: '', post: '' },
  mandibleB1nL: { pre: '', mid: '', post: '' },
  chinNPogFh: { pre: '', mid: '', post: '' },
  mandCorpusSize: { pre: '', mid: '', post: '' },
  basicUpperLip: { pre: '', mid: '', post: '' },
  softTissueChin: { pre: '', mid: '', post: '' },
};

const SAMPLE_CEPH_DISCREPANCY_DATA: CephDiscrepancyParametersMap = {
  anbAngle: { pre: 6.5, mid: 4.0, post: 2.0 },
  aMoBFh: { pre: 7.5, mid: 5.5, post: 4.0 },
  witsAoBo: { pre: 4.5, mid: 2.5, post: 0.5 },
  betaAngle: { pre: 24, mid: 28, post: 31 },
  naPog: { pre: 8.5, mid: 5.0, post: 2.5 },
  abNpog: { pre: -8.0, mid: -6.0, post: -4.0 },
  maxMandRatio: { pre: 0.74, mid: 0.70, post: 0.67 },
  harvoldUnitDiff: { pre: 18, mid: 22, post: 25 },
  softTissueProfileAngle: { pre: 151, mid: 156, post: 161 },
  totalTissueProfileAngle: { pre: 125, mid: 129, post: 133 },
  softTissueFacialAngle: { pre: 84, mid: 90, post: 96 },
  subnasaleToChin: { pre: 8.0, mid: 6.5, post: 5.0 },
  snaAngle: { pre: 85.0, mid: 83.5, post: 82.0 },
  maxilla1aNl: { pre: 4.5, mid: 3.0, post: 2.0 },
  maxPlacementSInfPtmNf: { pre: 20, mid: 19, post: 18 },
  snbAngle: { pre: 75.5, mid: 78.0, post: 80.0 },
  mandibleB1nL: { pre: -6.0, mid: -4.0, post: -2.0 },
  chinNPogFh: { pre: 81, mid: 84, post: 87 },
  mandCorpusSize: { pre: 65, mid: 72, post: 78 },
  basicUpperLip: { pre: 15, mid: 15, post: 15 },
  softTissueChin: { pre: 14, mid: 13, post: 11 },
};

export interface CephDiscrepancyAnalysisProps {
  data?: CephDiscrepancyAnalysisData;
  onChange?: (updatedData: CephDiscrepancyAnalysisData) => void;
  activeStage?: 'pre' | 'mid' | 'post';
  isOpen?: boolean;
  onToggle?: () => void;
  patientGender?: Gender;
}

export const CephDiscrepancyAnalysis: React.FC<CephDiscrepancyAnalysisProps> = ({
  data,
  onChange,
  activeStage = 'pre',
  isOpen = true,
  onToggle,
  patientGender = 'Male',
}) => {
  const currentStage: 'pre' | 'mid' | 'post' =
    activeStage === 'mid' ? 'mid' : activeStage === 'post' ? 'post' : 'pre';

  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female'>(
    patientGender === 'Female' ? 'Female' : 'Male'
  );

  useEffect(() => {
    if (patientGender === 'Female' || patientGender === 'Male') {
      setSelectedGender(patientGender);
    }
  }, [patientGender]);

  const [params, setParams] = useState<CephDiscrepancyParametersMap>(() => {
    if (data?.parameters) {
      const merged: any = { ...DEFAULT_CEPH_DISCREPANCY_PARAMS };
      CEPH_DISCREPANCY_PARAMETERS_META.forEach((p) => {
        merged[p.key] = {
          pre: data.parameters?.[p.key]?.pre ?? '',
          mid: data.parameters?.[p.key]?.mid ?? '',
          post: data.parameters?.[p.key]?.post ?? '',
        };
      });
      return merged as CephDiscrepancyParametersMap;
    }
    return DEFAULT_CEPH_DISCREPANCY_PARAMS;
  });

  const [conclusion, setConclusion] = useState<string>(data?.conclusion || '');
  const [userEditedConclusion, setUserEditedConclusion] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (data?.parameters) {
      setParams((prev) => {
        const isSame = CEPH_DISCREPANCY_PARAMETERS_META.every((p) => {
          return (
            prev[p.key]?.pre === data.parameters?.[p.key]?.pre &&
            prev[p.key]?.mid === data.parameters?.[p.key]?.mid &&
            prev[p.key]?.post === data.parameters?.[p.key]?.post
          );
        });
        if (isSame) return prev;
        const next: any = { ...prev };
        CEPH_DISCREPANCY_PARAMETERS_META.forEach((p) => {
          next[p.key] = {
            pre: data.parameters?.[p.key]?.pre ?? '',
            mid: data.parameters?.[p.key]?.mid ?? '',
            post: data.parameters?.[p.key]?.post ?? '',
          };
        });
        return next;
      });
    }
    if (data?.conclusion !== undefined && data.conclusion !== conclusion) {
      setConclusion(data.conclusion);
    }
  }, [data]);

  const computeEngineInference = (
    currentParams: CephDiscrepancyParametersMap,
    stage: 'pre' | 'mid' | 'post'
  ) => {
    const anb = currentParams.anbAngle?.[stage];
    const wits = currentParams.witsAoBo?.[stage];
    const beta = currentParams.betaAngle?.[stage];
    const sna = currentParams.snaAngle?.[stage];
    const snb = currentParams.snbAngle?.[stage];
    const softProfile = currentParams.softTissueProfileAngle?.[stage];
    const chinThick = currentParams.softTissueChin?.[stage];

    const hasAnb = anb !== '' && anb !== undefined && !isNaN(Number(anb));
    const hasWits = wits !== '' && wits !== undefined && !isNaN(Number(wits));
    const hasBeta = beta !== '' && beta !== undefined && !isNaN(Number(beta));
    const hasSna = sna !== '' && sna !== undefined && !isNaN(Number(sna));
    const hasSnb = snb !== '' && snb !== undefined && !isNaN(Number(snb));

    // 1. Skeletal Class & Severity
    let skeletalClass = 'Awaiting Measurements';
    let severity = '';

    if (hasAnb || hasWits || hasBeta) {
      const anbVal = hasAnb ? Number(anb) : null;
      const witsVal = hasWits ? Number(wits) : null;
      const betaVal = hasBeta ? Number(beta) : null;

      const isClass2 =
        (anbVal !== null && anbVal > 4) ||
        (witsVal !== null && witsVal > 3) ||
        (betaVal !== null && betaVal < 27);

      const isClass3 =
        (anbVal !== null && anbVal < 0) ||
        (witsVal !== null && witsVal < 0) ||
        (betaVal !== null && betaVal > 35);

      if (isClass2) {
        skeletalClass = 'Skeletal Class II';
        if (anbVal !== null) {
          if (anbVal <= 6) severity = 'Mild (ANB 4°–6°)';
          else if (anbVal <= 8) severity = 'Moderate (ANB 6°–8°)';
          else severity = 'Severe (ANB > 8°)';
        } else {
          severity = 'Discrepancy Present';
        }
      } else if (isClass3) {
        skeletalClass = 'Skeletal Class III';
        if (anbVal !== null) {
          if (anbVal >= -2) severity = 'Mild (ANB 0° to -2°)';
          else if (anbVal >= -5) severity = 'Moderate (ANB -2° to -5°)';
          else severity = 'Severe (ANB < -5°)';
        } else {
          severity = 'Discrepancy Present';
        }
      } else {
        skeletalClass = 'Skeletal Class I';
        severity = 'Harmonious AP Relationship (ANB 0°–4°)';
      }
    }

    // 2. Apical Base Fault Location
    let maxillaryFault = 'Not Evaluated';
    let mandibularFault = 'Not Evaluated';
    let apicalBaseSummary = 'Awaiting SNA / SNB Measurements';

    if (hasSna) {
      const snaNum = Number(sna);
      if (snaNum > 84) maxillaryFault = 'Maxillary Prognathism (AP Excess)';
      else if (snaNum < 80) maxillaryFault = 'Maxillary Retrognathism (AP Deficiency)';
      else maxillaryFault = 'Normal Maxillary Base Position';
    }

    if (hasSnb) {
      const snbNum = Number(snb);
      if (snbNum > 82) mandibularFault = 'Mandibular Prognathism (AP Excess)';
      else if (snbNum < 78) mandibularFault = 'Mandibular Retrognathism (AP Deficiency)';
      else mandibularFault = 'Normal Mandibular Base Position';
    }

    if (hasSna || hasSnb) {
      apicalBaseSummary = `Maxilla: ${maxillaryFault} | Mandible: ${mandibularFault}`;
    }

    // 3. Soft Tissue Reaction
    let softTissueReaction = 'Soft Tissues: Matching';
    if (skeletalClass === 'Skeletal Class II') {
      const chinNum = chinThick !== '' && chinThick !== undefined ? Number(chinThick) : null;
      if (chinNum !== null && chinNum > 12) {
        softTissueReaction = 'Soft Tissues: Compensating (Thick soft tissue chin masks skeletal Class II retrusion)';
      } else if (chinNum !== null && chinNum < 10) {
        softTissueReaction = 'Soft Tissues: Aggravating (Thin soft tissue chin accentuates skeletal Class II retrusion)';
      } else {
        softTissueReaction = 'Soft Tissues: Matching (Soft tissue profile directly reflects skeletal Class II)';
      }
    } else if (skeletalClass === 'Skeletal Class III') {
      const profNum = softProfile !== '' && softProfile !== undefined ? Number(softProfile) : null;
      if (profNum !== null && profNum > 167) {
        softTissueReaction = 'Soft Tissues: Aggravating (Concave profile accentuates skeletal Class III)';
      } else if (profNum !== null && profNum < 155) {
        softTissueReaction = 'Soft Tissues: Compensating (Thick lip/soft tissue masks Class III concavity)';
      } else {
        softTissueReaction = 'Soft Tissues: Matching (Soft tissue profile directly reflects skeletal Class III)';
      }
    } else if (skeletalClass === 'Skeletal Class I') {
      softTissueReaction = 'Soft Tissues: Matching (Harmonious soft tissue profile matches skeletal Class I)';
    }

    return {
      skeletalClass,
      severity,
      maxillaryFault,
      mandibularFault,
      apicalBaseSummary,
      softTissueReaction,
    };
  };

  const generateSummary = (
    currentParams: CephDiscrepancyParametersMap,
    stage: 'pre' | 'mid' | 'post',
    gender: 'Male' | 'Female'
  ) => {
    const stageLabel =
      stage === 'pre'
        ? 'Pre-treatment'
        : stage === 'mid'
        ? 'Mid-treatment'
        : 'Post-treatment';

    const measuredParams: string[] = [];
    CEPH_DISCREPANCY_PARAMETERS_META.forEach((meta) => {
      const val = currentParams[meta.key]?.[stage];
      if (val !== '' && val !== undefined && !isNaN(Number(val))) {
        const num = Number(val);
        const res = meta.evaluateInference(num, gender);
        measuredParams.push(`${meta.label}: ${num}${meta.unit} (${res.inference})`);
      }
    });

    if (measuredParams.length === 0) {
      return `Please enter ${stageLabel.toLowerCase()} sagittal cephalometric measurement values to auto-generate the Sagittal Discrepancy diagnostic conclusion.`;
    }

    const eng = computeEngineInference(currentParams, stage);

    let summary = `Cephalometric Discrepancy Analysis (Sagittal - ${stageLabel} Evaluation):\n`;
    summary += `• Primary Diagnostic Classification: ${eng.skeletalClass} ${
      eng.severity ? `[${eng.severity}]` : ''
    }.\n`;
    summary += `• Apical Base Fault Location: ${eng.apicalBaseSummary}.\n`;
    summary += `• Soft Tissue Behavior: ${eng.softTissueReaction}.\n`;
    summary += `• Key Parameter Findings: ${measuredParams.join('; ')}.`;

    return summary.trim();
  };

  const notifyChange = (
    newParams: CephDiscrepancyParametersMap,
    newConclusion: string,
    gender: 'Male' | 'Female'
  ) => {
    const eng = computeEngineInference(newParams, currentStage);
    onChange?.({
      parameters: newParams,
      conclusion: newConclusion,
      skeletalClass: eng.skeletalClass,
      apicalBaseFault: eng.apicalBaseSummary,
      softTissueReaction: eng.softTissueReaction,
    });
  };

  const handleValueChange = (
    key: CephDiscrepancyParameterKey,
    stage: 'pre' | 'mid' | 'post',
    valStr: string
  ) => {
    const num = valStr === '' ? '' : parseFloat(valStr);
    const updatedParams = {
      ...params,
      [key]: {
        ...params[key],
        [stage]: isNaN(num as number) ? '' : num,
      },
    };
    setParams(updatedParams);
    const nextSummary = userEditedConclusion
      ? conclusion
      : generateSummary(updatedParams, currentStage, selectedGender);
    if (!userEditedConclusion) {
      setConclusion(nextSummary);
    }
    notifyChange(updatedParams, nextSummary, selectedGender);
  };

  const getInputClass = (key: CephDiscrepancyParameterKey, stage: 'pre' | 'mid' | 'post') => {
    const val = params[key]?.[stage];
    if (val === '' || val === undefined || isNaN(Number(val))) {
      return 'bg-white border-slate-300 text-slate-800 focus:ring-slate-400 focus:border-slate-500';
    }
    const meta = CEPH_DISCREPANCY_PARAMETERS_META.find((p) => p.key === key);
    if (!meta) return 'bg-white border-slate-300 text-slate-800';
    const num = Number(val);
    const { minNormal, maxNormal } = meta.getNormalRange(selectedGender);
    if (num >= minNormal && num <= maxNormal) {
      return 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold focus:ring-emerald-500/20 focus:border-emerald-600';
    }
    return 'bg-rose-50 border-rose-400 text-rose-950 font-semibold focus:ring-rose-500/20 focus:border-rose-600';
  };

  // Live per-parameter inferences
  const paramInferences = useMemo(() => {
    const result: Record<
      CephDiscrepancyParameterKey,
      { inference: string; status: 'normal' | 'abnormal' | 'empty' }
    > = {} as any;

    CEPH_DISCREPANCY_PARAMETERS_META.forEach((meta) => {
      const val = params[meta.key]?.[currentStage];
      if (val === '' || val === undefined || isNaN(Number(val))) {
        result[meta.key] = { inference: 'Enter value to analyze', status: 'empty' };
      } else {
        const res = meta.evaluateInference(Number(val), selectedGender);
        result[meta.key] = { inference: res.inference, status: res.status };
      }
    });

    return result;
  }, [params, currentStage, selectedGender]);

  // REAL-TIME AUTO-INFERENCE ENGINE
  const engineInference = useMemo(
    () => computeEngineInference(params, currentStage),
    [params, currentStage]
  );

  // Comprehensive Auto-Generated Summary
  const autoGeneratedSummary = useMemo(
    () => generateSummary(params, currentStage, selectedGender),
    [params, currentStage, selectedGender]
  );

  useEffect(() => {
    if (!userEditedConclusion) {
      setConclusion(autoGeneratedSummary);
    }
  }, [autoGeneratedSummary, userEditedConclusion]);

  const handleConclusionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserEditedConclusion(true);
    setConclusion(e.target.value);
    notifyChange(params, e.target.value, selectedGender);
  };

  const handleResetConclusion = () => {
    setUserEditedConclusion(false);
    setConclusion(autoGeneratedSummary);
    notifyChange(params, autoGeneratedSummary, selectedGender);
  };

  const handleLoadSample = () => {
    setParams(SAMPLE_CEPH_DISCREPANCY_DATA);
    setUserEditedConclusion(false);
    const sampleSummary = generateSummary(SAMPLE_CEPH_DISCREPANCY_DATA, currentStage, selectedGender);
    setConclusion(sampleSummary);
    notifyChange(SAMPLE_CEPH_DISCREPANCY_DATA, sampleSummary, selectedGender);
  };

  const handleResetAll = () => {
    setParams(DEFAULT_CEPH_DISCREPANCY_PARAMS);
    setUserEditedConclusion(false);
    const emptySummary = generateSummary(DEFAULT_CEPH_DISCREPANCY_PARAMS, currentStage, selectedGender);
    setConclusion(emptySummary);
    notifyChange(DEFAULT_CEPH_DISCREPANCY_PARAMS, emptySummary, selectedGender);
  };

  const handleGenderChange = (gender: 'Male' | 'Female') => {
    setSelectedGender(gender);
    const nextSummary = userEditedConclusion
      ? conclusion
      : generateSummary(params, currentStage, gender);
    if (!userEditedConclusion) {
      setConclusion(nextSummary);
    }
    notifyChange(params, nextSummary, gender);
  };

  const handleCopyConclusion = () => {
    navigator.clipboard.writeText(conclusion);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeCount = useMemo(() => {
    return CEPH_DISCREPANCY_PARAMETERS_META.filter(
      (m) => params[m.key]?.[currentStage] !== '' && params[m.key]?.[currentStage] !== undefined
    ).length;
  }, [params, currentStage]);

  const abnormalCount = useMemo(() => {
    return CEPH_DISCREPANCY_PARAMETERS_META.filter((m) => {
      const val = params[m.key]?.[currentStage];
      if (val === '' || val === undefined || isNaN(Number(val))) return false;
      return m.evaluateInference(Number(val), selectedGender).status === 'abnormal';
    }).length;
  }, [params, currentStage, selectedGender]);

  const stageDisplayLabel =
    currentStage === 'pre' ? 'Pre' : currentStage === 'mid' ? 'Mid Stage' : 'Post Treatment';

  const categories = [
    'Sagittal Skeletal Relation',
    'Maxillary & Mandibular Apical Base Discrepancy',
  ] as const;

  const renderMobileParamRows = (cat: 'Sagittal Skeletal Relation' | 'Maxillary & Mandibular Apical Base Discrepancy', catTitle: string) => (
    <div className="space-y-2 w-full max-w-full box-border">
      <div className="px-2.5 py-1.5 rounded-lg bg-indigo-100/80 border border-indigo-200 text-[11px] font-extrabold uppercase tracking-wider text-indigo-900">
        {catTitle}
      </div>
      {CEPH_DISCREPANCY_PARAMETERS_META.filter((p) => p.category === cat).map((meta) => {
        const evalState = paramInferences[meta.key];
        const inputVal = params[meta.key]?.[currentStage] ?? '';

        return (
          <div key={meta.key} className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-2 w-full max-w-full box-border">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 leading-snug whitespace-normal break-words">{meta.label}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 whitespace-normal break-words">
                  Norm {meta.normalText(selectedGender)}
                  <span className="ml-1.5 text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                    {meta.unit}
                  </span>
                </p>
              </div>
              <input
                type="number"
                step="any"
                value={inputVal}
                onChange={(e) => handleValueChange(meta.key, currentStage, e.target.value)}
                placeholder="--"
                className={`w-20 shrink-0 text-center py-1.5 px-1.5 border rounded-lg text-xs font-bold font-mono ${getInputClass(meta.key, currentStage)}`}
              />
            </div>
            <div className="whitespace-normal break-words">
              {evalState.status === 'empty' ? (
                <span className="text-slate-400 italic text-xs">Enter value</span>
              ) : evalState.status === 'normal' ? (
                <span className="inline-flex items-start gap-1 text-[11px] font-bold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{evalState.inference}</span>
                </span>
              ) : (
                <span className="inline-flex items-start gap-1 text-[11px] font-bold text-rose-900 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{evalState.inference}</span>
                </span>
              )}
            </div>
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
        className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-slate-50 transition-colors gap-2 select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
              Cephalometric Discrepancy Analysis (Sagittal)
              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                14 Parameters
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Sagittal Skeletal Relationship, Apical Base Discrepancy & Soft Tissue Profile Reaction
            </p>
          </div>
        </div>

        {/* Right Badges & Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-1 font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md text-[11px]">
              <Activity className="w-3 h-3 text-indigo-600" />
              {activeCount}/14 Measured
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
        <div className="p-3 sm:p-5 border-t border-slate-200 space-y-5 bg-slate-50/50">
          {/* Quick Preset Actions Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                Gender Standards:
              </span>
              <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleGenderChange('Male')}
                  className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all ${
                    selectedGender === 'Male'
                      ? 'bg-indigo-600 text-white shadow-2xs'
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
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={handleLoadSample}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                Sample Data
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-slate-600" />
                Reset All
              </button>
            </div>
          </div>

          {/* PARAMETER TABLES IN RESPONSIVE LAYOUT */}
          {categories.map((cat, idx) => {
            const catParams = CEPH_DISCREPANCY_PARAMETERS_META.filter((p) => p.category === cat);
            const catTitle =
              cat === 'Sagittal Skeletal Relation'
                ? 'A. Sagittal Skeletal Relation Parameters'
                : 'B. Maxillary & Mandibular Apical Base Discrepancy Analysis';

            const activeCatCount = catParams.filter(
              (m) => params[m.key]?.[currentStage] !== '' && params[m.key]?.[currentStage] !== undefined
            ).length;

            return (
              <div key={cat} className="space-y-2">
                <div className="flex items-center justify-between bg-indigo-900 text-white px-3 py-2 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-300" />
                    <h5 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                      {catTitle}
                    </h5>
                  </div>
                  <span className="text-[11px] font-semibold bg-indigo-950/60 text-indigo-200 px-2 py-0.5 rounded-md border border-indigo-700">
                    {activeCatCount}/{catParams.length} Measured
                  </span>
                </div>

                {/* Mobile View */}
                <div className="md:hidden">
                  {renderMobileParamRows(cat as any, catTitle)}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs w-full max-w-full box-border">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse table-fixed">
                      <thead>
                        <tr className="bg-slate-900 text-white text-[11px] sm:text-xs uppercase tracking-wider font-bold">
                          <th className="py-2.5 px-3 w-[42%] whitespace-normal break-words">Parameter Name</th>
                          <th className="py-2.5 px-2 text-center w-[23%] whitespace-normal break-words">Reference Norm</th>
                          <th className="py-2.5 px-2 text-center w-[20%] bg-indigo-900 text-indigo-200 font-extrabold border-b-2 border-indigo-400 whitespace-normal break-words">
                            Input ({stageDisplayLabel})
                          </th>
                          <th className="py-2.5 px-3 w-[15%] whitespace-normal break-words">Auto Inference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                        {catParams.map((meta) => {
                          const evalState = paramInferences[meta.key];
                          const inputVal = params[meta.key]?.[currentStage] ?? '';

                          return (
                            <tr key={meta.key} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2 px-3 font-medium text-slate-900 whitespace-normal break-words">
                                <div className="text-xs sm:text-sm font-semibold">{meta.label}</div>
                                <div className="text-[10px] text-slate-400">Unit: {meta.unit}</div>
                              </td>

                              <td className="py-2 px-2 text-center text-xs font-mono text-slate-600 whitespace-normal break-words">
                                {meta.normalText(selectedGender)}
                              </td>

                              <td className="py-2 px-2 text-center bg-indigo-50/20">
                                <input
                                  type="number"
                                  step="any"
                                  value={inputVal}
                                  onChange={(e) =>
                                    handleValueChange(meta.key, currentStage, e.target.value)
                                  }
                                  placeholder="--"
                                  className={`w-full max-w-[90px] px-2 py-1 text-center font-mono rounded-lg border text-xs sm:text-sm transition-all focus:outline-hidden ${getInputClass(
                                    meta.key,
                                    currentStage
                                  )}`}
                                />
                              </td>

                              <td className="py-2 px-3 whitespace-normal break-words">
                                {evalState.status === 'empty' ? (
                                  <span className="text-slate-400 italic text-xs">
                                    Enter {stageDisplayLabel} value
                                  </span>
                                ) : evalState.status === 'normal' ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    {evalState.inference}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300">
                                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                    {evalState.inference}
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
              </div>
            );
          })}

          {/* REAL-TIME AUTO-INFERENCE ENGINE DISPLAY BOX */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-4 space-y-3.5 border border-indigo-500/30 shadow-md">
            <div className="flex items-center justify-between border-b border-indigo-800/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                <h5 className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-amber-300">
                  Real-Time Auto-Inference Engine ({stageDisplayLabel})
                </h5>
              </div>
              <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 px-2 py-0.5 rounded-full">
                Sagittal Diagnostic Synthesis
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 1. Skeletal Class & Severity */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 space-y-1">
                <div className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                  1. Skeletal Class & Severity
                </div>
                <div className="text-sm font-extrabold text-white">
                  {engineInference.skeletalClass}
                </div>
                {engineInference.severity && (
                  <div className="text-xs font-medium text-indigo-200">
                    {engineInference.severity}
                  </div>
                )}
              </div>

              {/* 2. Apical Base Fault Location */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 space-y-1">
                <div className="text-[10px] uppercase font-bold text-teal-300 tracking-wider flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-teal-400" />
                  2. Apical Base Fault Location
                </div>
                <div className="text-xs font-semibold text-slate-200 space-y-0.5">
                  <div>
                    <span className="text-slate-400">Maxilla: </span>
                    <span className="text-white font-bold">{engineInference.maxillaryFault}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Mandible: </span>
                    <span className="text-white font-bold">{engineInference.mandibularFault}</span>
                  </div>
                </div>
              </div>

              {/* 3. Soft Tissue Reaction */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3 space-y-1">
                <div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  3. Soft Tissue Profile Reaction
                </div>
                <div className="text-xs font-bold text-amber-200">
                  {engineInference.softTissueReaction}
                </div>
              </div>
            </div>
          </div>

          {/* DIAGNOSTIC CONCLUSION BOX */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 space-y-2.5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                  Cephalometric Sagittal Discrepancy Integrated Conclusion ({stageDisplayLabel})
                </h5>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyConclusion}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center gap-1"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-600" />
                  )}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                {userEditedConclusion && (
                  <button
                    type="button"
                    onClick={handleResetConclusion}
                    className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    Reset to Auto
                  </button>
                )}
              </div>
            </div>

            <textarea
              rows={3}
              value={conclusion}
              onChange={handleConclusionChange}
              placeholder="Auto-generated diagnostic conclusion will appear here based on entered sagittal parameters..."
              className="w-full p-3 border border-slate-300 rounded-lg text-xs sm:text-sm font-medium text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
};
