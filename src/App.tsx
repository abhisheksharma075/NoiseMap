import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { NavigationBar, TabType } from './components/layout/NavigationBar';
import { MeasureView } from './components/measure/MeasureView';
import { MapView } from './components/map/MapView';
import { IncidentsView } from './components/incidents/IncidentsView';
import { EvidenceView } from './components/evidence/EvidenceView';
import { ProfileView } from './components/profile/ProfileView';
import { ComplaintGeneratorModal } from './components/evidence/ComplaintGeneratorModal';
import { DemoSimulatorModal } from './components/layout/DemoSimulatorModal';
import { InstallPromptBanner } from './components/layout/InstallPromptBanner';
import { NoiseReading, NoiseIncident, UserPin, UserStreak } from './types';
import { IncidentEngine } from './services/incidentEngine';
import { NotificationService } from './services/notificationService';
import { NoiseDataService } from './services/noiseDataService';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('measure');
  const [modalIncident, setModalIncident] = useState<NoiseIncident | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [readings, setReadings] = useState<NoiseReading[]>([
    {
      id: 'demo-1',
      session_id: 'anon_demo1',
      lat: 26.144,
      lng: 91.736,
      grid_id: '26.144_91.736',
      db_avg: 82.4,
      db_peak: 94.1,
      source_type: 'traffic',
      zone_type: 'commercial',
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-2',
      session_id: 'anon_demo2',
      lat: 26.144,
      lng: 91.736,
      grid_id: '26.144_91.736',
      db_avg: 84.2,
      db_peak: 91.5,
      source_type: 'traffic',
      zone_type: 'commercial',
      created_at: new Date(Date.now() - 3 * 60000).toISOString(),
    },
    {
      id: 'demo-3',
      session_id: 'anon_demo3',
      lat: 26.144,
      lng: 91.736,
      grid_id: '26.144_91.736',
      db_avg: 80.7,
      db_peak: 88.0,
      source_type: 'traffic',
      zone_type: 'commercial',
      created_at: new Date(Date.now() - 6 * 60000).toISOString(),
    },
    {
      id: 'demo-4',
      session_id: 'anon_demo4',
      lat: 26.148,
      lng: 91.741,
      grid_id: '26.148_91.741',
      db_avg: 74.2,
      db_peak: 83.5,
      source_type: 'construction',
      zone_type: 'residential',
      created_at: new Date().toISOString(),
    },
    {
      id: 'demo-5',
      session_id: 'anon_demo5',
      lat: 26.141,
      lng: 91.731,
      grid_id: '26.141_91.731',
      db_avg: 48.7,
      db_peak: 54.0,
      source_type: 'unknown',
      zone_type: 'silence',
      created_at: new Date().toISOString(),
    },
  ]);

  const [incidents, setIncidents] = useState<NoiseIncident[]>(() => {
    // Initial clustering pass based on default readings
    return IncidentEngine.clusterReadings([
      {
        id: 'demo-1',
        session_id: 'anon_demo1',
        lat: 26.144,
        lng: 91.736,
        grid_id: '26.144_91.736',
        db_avg: 82.4,
        db_peak: 94.1,
        source_type: 'traffic',
        zone_type: 'commercial',
        created_at: new Date().toISOString(),
      },
      {
        id: 'demo-2',
        session_id: 'anon_demo2',
        lat: 26.144,
        lng: 91.736,
        grid_id: '26.144_91.736',
        db_avg: 84.2,
        db_peak: 91.5,
        source_type: 'traffic',
        zone_type: 'commercial',
        created_at: new Date(Date.now() - 3 * 60000).toISOString(),
      },
      {
        id: 'demo-3',
        session_id: 'anon_demo3',
        lat: 26.144,
        lng: 91.736,
        grid_id: '26.144_91.736',
        db_avg: 80.7,
        db_peak: 88.0,
        source_type: 'traffic',
        zone_type: 'commercial',
        created_at: new Date(Date.now() - 6 * 60000).toISOString(),
      },
    ]);
  });

  const [pins, setPins] = useState<UserPin[]>(() =>
    NotificationService.getSavedPins()
  );

  const [streak, setStreak] = useState<UserStreak>({
    session_id: 'local_user',
    total_readings: 14,
    verified_readings: 11,
    current_streak: 3,
    badge_level: 'noise_watcher',
    last_reading: new Date().toISOString(),
  });

  // Automatically evaluate geofenced pin breaches whenever incidents update
  useEffect(() => {
    const breaches = NotificationService.evaluateBreaches(pins, incidents);
    if (breaches.length > 0) {
      console.log("Geofenced breach detected:", breaches);
    }
  }, [pins, incidents]);

  const handleReadingSubmitted = async (reading: NoiseReading) => {
    // Sync to Supabase cloud if configured, otherwise falls back gracefully to local autonomous store
    await NoiseDataService.submitReading(reading);

    setReadings((prev) => {
      const updated = [reading, ...prev];
      const updatedIncidents = IncidentEngine.clusterReadings(updated, incidents);
      setIncidents(updatedIncidents);
      return updated;
    });

    // Increment user streak count
    setStreak((prev) => ({
      ...prev,
      total_readings: prev.total_readings + 1,
      last_reading: new Date().toISOString(),
    }));
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-vector-grid text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black antialiased">
      {/* Top Precision HUD Telemetry Header */}
      <Header
        currentGrid={readings[0]?.grid_id || "GEO_GRID: LOCATING..."}
        activeIncidentsCount={incidents.filter((i) => i.status === 'active').length}
        onOpenDemoToolbar={() => setIsSimulatorOpen(true)}
      />

      {/* PWA Install Promotion Banner */}
      <InstallPromptBanner />

      {/* Main Dynamic Viewport */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 pb-28 sm:pb-24 flex flex-col items-center justify-start">
        {activeTab === 'measure' && (
          <MeasureView
            onReadingSubmitted={handleReadingSubmitted}
            onViewMap={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'map' && (
          <MapView
            readings={readings}
            incidents={incidents}
            onGenerateComplaint={(inc) => {
              console.log("Complaint requested for incident:", inc);
              setActiveTab('evidence');
            }}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentsView
            incidents={incidents}
            onGenerateComplaint={(inc) => {
              setModalIncident(inc);
            }}
            onViewOnMap={(inc) => {
              console.log("Locate incident on map:", inc);
              setActiveTab('map');
            }}
          />
        )}

        {activeTab === 'evidence' && (
          <EvidenceView incidents={incidents} />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            pins={pins}
            onUpdatePins={setPins}
            streak={streak}
          />
        )}
      </main>

      {/* Floating Complaint Generator Modal */}
      {modalIncident && (
        <ComplaintGeneratorModal
          incident={modalIncident}
          onClose={() => setModalIncident(null)}
        />
      )}

      {/* Hackathon Demo Simulator Controller Modal */}
      <DemoSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onInjectReadings={(simReadings) => {
          setReadings((prev) => {
            const updated = [...simReadings, ...prev];
            const updatedIncidents = IncidentEngine.clusterReadings(updated, incidents);
            setIncidents(updatedIncidents);
            return updated;
          });
        }}
        onResetToBaseline={() => {
          setReadings([]);
          setIncidents([]);
        }}
        activeCount={readings.length}
      />

      {/* Docked Floating Bottom Navigation Bar */}
      <NavigationBar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        hasActiveIncidents={true}
      />
    </div>
  );
};

export default App;
