import React, { useState, useEffect, lazy, Suspense, startTransition } from 'react';
import { ActiveTab, PatientRecord, StudentProfile, UserRole } from './types';
import {
  getAllPatients,
  savePatient,
  savePatientsBatch,
  deletePatient,
  toggleArchivePatient,
  getStudentProfile,
  saveStudentProfile,
  getDB,
} from './lib/db';
import { prefetchCaseForm, prefetchBonwillHawley, prefetchOnIdle, prefetchPatientList, prefetchReportViewer } from './lib/prefetch';
import { getCurrentUserAccount } from './lib/authContext';
import { LoginScreen } from './components/LoginScreen';

// Components loaded on first paint (home shell)
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';

function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<any>,
  exportName?: string
) {
  return lazy(async () => {
    try {
      const module = await factory();
      if (exportName && module[exportName]) {
        return { default: module[exportName] as T };
      }
      if (module.default) {
        return { default: module.default as T };
      }
      const firstExport = Object.values(module)[0] as T;
      return { default: firstExport };
    } catch (error) {
      console.warn('Dynamic import failed, retrying once...', error);
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const module = await factory();
        if (exportName && module[exportName]) {
          return { default: module[exportName] as T };
        }
        if (module.default) {
          return { default: module.default as T };
        }
        const firstExport = Object.values(module)[0] as T;
        return { default: firstExport };
      } catch (retryErr) {
        console.error('Dynamic import retry failed:', retryErr);
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
    }
  });
}

// Secondary screens — lazy loaded so the app shell opens fast
const PatientList = lazyWithRetry(
  () => import('./components/PatientList'),
  'PatientList'
);
const StudentDirectory = lazyWithRetry(
  () => import('./components/StudentDirectory'),
  'StudentDirectory'
);
const AnalyticsDashboard = lazyWithRetry(
  () => import('./components/AnalyticsDashboard'),
  'AnalyticsDashboard'
);
const Settings = lazyWithRetry(
  () => import('./components/Settings'),
  'Settings'
);

// Heavy screens — lazy loaded so localhost opens fast
const CaseForm = lazyWithRetry(
  () => import('./components/CaseForm'),
  'CaseForm'
);
const CaseDetailsModal = lazyWithRetry(
  () => import('./components/CaseDetailsModal'),
  'CaseDetailsModal'
);
const ReportViewer = lazyWithRetry(
  () => import('./components/ReportViewer'),
  'ReportViewer'
);
const BonwillHawleyGenerator = lazyWithRetry(
  () => import('./components/bonwill/BonwillHawleyGenerator'),
  'BonwillHawleyGenerator'
);

function TabLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]" aria-label="Loading">
      <div className="h-8 w-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('orthocase_current_user_id'));
  });

  const currentUser = getCurrentUserAccount();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('orthocase_current_user_id');
    setIsAuthenticated(false);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [profile, setProfile] = useState<StudentProfile>({
    studentName: currentUser.name,
    rollNumber: currentUser.rollNumber || 'PG-ORTHO-2024-012',
    institution: currentUser.institution || 'Department of Orthodontics & Dentofacial Orthopedics',
    department: currentUser.department || 'Postgraduate Orthodontics',
    academicYear: 'Final Year MDS',
    supervisorName: currentUser.assignedStaffName || 'Prof. Dr. A. K. Varma',
  });

  const [editingPatient, setEditingPatient] = useState<PatientRecord | null>(null);
  const [selectedPatientModal, setSelectedPatientModal] = useState<PatientRecord | null>(null);
  const [caseFilter, setCaseFilter] = useState<'all' | 'pending' | 'approved' | 'corrections' | 'archived'>('all');

  // Load local data without blocking first paint or auto-seeding samples.
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const [storedPatients, storedProfile] = await Promise.all([
          getAllPatients(),
          getStudentProfile(),
        ]);
        if (cancelled) return;
        setPatients(storedPatients);
        if (storedProfile && storedProfile.studentName) {
          setProfile((prev) => ({
            ...storedProfile,
            studentName: currentUser.role === 'STUDENT' ? currentUser.name : (currentUser.role === 'STAFF_GUIDE' || currentUser.role === 'HOD' ? currentUser.name : storedProfile.studentName),
          }));
        }
      } catch (err) {
        console.error('Failed to load local data:', err);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Warm CaseForm ASAP so Add Patient opens without waiting on idle/Bonwill
  useEffect(() => {
    prefetchCaseForm();
    return prefetchOnIdle(() => prefetchBonwillHawley(), 4000);
  }, []);

  // Handlers
  const handleSavePatient = async (patient: PatientRecord) => {
    const saved = await savePatient(patient);
    setPatients((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = saved;
        return updated;
      }
      return [saved, ...prev];
    });
    setEditingPatient(null);
  };

  const handleDeletePatient = async (id: string) => {
    await deletePatient(id);
    setPatients((prev) => prev.filter((p) => p.id !== id));
    if (selectedPatientModal?.id === id) {
      setSelectedPatientModal(null);
    }
  };

  const handleToggleArchive = async (id: string) => {
    await toggleArchivePatient(id);
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, archived: !p.archived } : p))
    );
  };

  const handleSaveProfile = async (newProfile: StudentProfile) => {
    setProfile(newProfile);
    await saveStudentProfile(newProfile);
  };

  const handleLoadSamples = async () => {
    const { SAMPLE_PATIENTS } = await import('./lib/sampleData');
    await savePatientsBatch(SAMPLE_PATIENTS);
    const updated = await getAllPatients();
    setPatients(updated);
  };

  const handleClearData = async () => {
    const db = await getDB();
    const tx = db.transaction('patients', 'readwrite');
    await tx.store.clear();
    await tx.done;
    setPatients([]);
  };

  const handleStartNewCase = () => {
    prefetchCaseForm();
    setEditingPatient(null);
    startTransition(() => setActiveTab('form'));
  };

  const handleEditPatient = (patient: PatientRecord) => {
    prefetchCaseForm();
    setSelectedPatientModal(null);
    setEditingPatient(patient);
    startTransition(() => setActiveTab('form'));
  };

  const handleGeneratePDF = async (patient: PatientRecord) => {
    const { generatePatientPDF } = await import('./lib/pdfGenerator');
    generatePatientPDF(patient, profile);
  };

  const isFormMode = activeTab === 'form';

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="app-frame text-slate-900 font-sans selection:bg-teal-200">
      <div className="app-shell">
        <Header
          profile={profile}
          compact={isFormMode}
          onOpenSearch={() => setActiveTab('patients')}
          onOpenSettings={() => setActiveTab('settings')}
          onLogout={handleLogout}
        />

        <main className={`app-main ${isFormMode ? 'app-main--form' : 'px-3 pt-3'}`}>
          {activeTab === 'home' && (
            <Dashboard
              patients={patients}
              profile={profile}
              onChangeTab={(tab, filter) => {
                if (filter) setCaseFilter(filter as any);
                setActiveTab(tab);
              }}
              onSelectPatient={(p) => setSelectedPatientModal(p)}
              onNewCase={handleStartNewCase}
              onGeneratePDF={handleGeneratePDF}
              onLoadSamples={handleLoadSamples}
            />
          )}

          {activeTab === 'patients' && (
            <Suspense fallback={<TabLoader />}>
              <PatientList
                patients={patients}
                initialFilter={caseFilter}
                onSelectPatient={(p) => setSelectedPatientModal(p)}
                onEditPatient={handleEditPatient}
                onGeneratePDF={handleGeneratePDF}
                onToggleArchive={handleToggleArchive}
                onDeletePatient={handleDeletePatient}
                onNewCase={handleStartNewCase}
              />
            </Suspense>
          )}

          {activeTab === 'form' && (
            <Suspense fallback={<TabLoader />}>
              <CaseForm
                initialPatient={editingPatient}
                onSavePatient={handleSavePatient}
                onCancel={() => {
                  setEditingPatient(null);
                  setActiveTab('patients');
                }}
              />
            </Suspense>
          )}

          {activeTab === 'bonwill' && (
            <Suspense fallback={<TabLoader />}>
              <BonwillHawleyGenerator
                patient={editingPatient || selectedPatientModal || patients[0]}
              />
            </Suspense>
          )}

          {activeTab === 'reports' && (
            <Suspense fallback={<TabLoader />}>
              <ReportViewer patients={patients} profile={profile} />
            </Suspense>
          )}

          {activeTab === 'students' && (
            <Suspense fallback={<TabLoader />}>
              <StudentDirectory patients={patients} />
            </Suspense>
          )}

          {activeTab === 'analytics' && (
            <Suspense fallback={<TabLoader />}>
              <AnalyticsDashboard />
            </Suspense>
          )}

          {activeTab === 'settings' && (
            <Suspense fallback={<TabLoader />}>
              <Settings
                profile={profile}
                onSaveProfile={handleSaveProfile}
                onLoadSamples={handleLoadSamples}
                onClearData={handleClearData}
                patientCount={patients.filter((p) => !p.archived).length}
                theme={theme}
                toggleTheme={toggleTheme}
                onLogout={handleLogout}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            </Suspense>
          )}
        </main>

        {selectedPatientModal && (
          <Suspense fallback={null}>
            <CaseDetailsModal
              patient={selectedPatientModal}
              profile={profile}
              onClose={() => setSelectedPatientModal(null)}
              onEdit={handleEditPatient}
            />
          </Suspense>
        )}

        <BottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => {
            if (tab === 'form') {
              prefetchCaseForm();
              if (editingPatient) setEditingPatient(null);
              startTransition(() => setActiveTab('form'));
              return;
            }
            setActiveTab(tab);
          }}
          onPrefetchTab={(tab) => {
            if (tab === 'form') prefetchCaseForm();
            if (tab === 'patients') prefetchPatientList();
            if (tab === 'reports') prefetchReportViewer();
          }}
          patientCount={patients.filter((p) => !p.archived).length}
        />
      </div>
    </div>
  );
}
