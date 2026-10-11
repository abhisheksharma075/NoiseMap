import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { NavigationBar, TabType } from './components/layout/NavigationBar';
import { LandingView } from './components/landing/LandingView';
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
import { locationService } from './services/locationService';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as TabType;
      if (tabParam && ['home', 'measure', 'map', 'incidents', 'evidence', 'profile'].includes(tabParam)) {
        return tabParam;
      }
    } catch (e) {
      // ignore
    }
    return 'home';
  });
  const [modalIncident, setModalIncident] = useState<NoiseIncident | null>(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  
  // Persistent readings store loaded synchronously on boot
  const [readings, setReadings] = useState<NoiseReading[]>(() =>
    NoiseDataService.getAllReadings()
  );

  const [incidents, setIncidents] = useState<NoiseIncident[]>(() => {
    const initialReadings = NoiseDataService.getAllReadings();
    return IncidentEngine.clusterReadings(initialReadings);
  });

  const [pins, setPins] = useState<UserPin[]>(() =>
    NotificationService.getSavedPins()
  );

  const [streak, setStreak] = useState<UserStreak>(() => {
    const initialReadings = NoiseDataService.getAllReadings();
    const currentSession = locationService.getOrCreateSessionId();
    const userReadings = initialReadings.filter((r) => r.session_id === currentSession);
    const count = userReadings.length;
    const verified = userReadings.filter((r) => r.db_avg > 0).length;

    let badge: UserStreak['badge_level'] = 'newcomer';
    if (count >= 50) badge = 'noise_guardian';
    else if (count >= 25) badge = 'community_sensor';
    else if (count >= 10) badge = 'noise_watcher';

    return {
      session_id: currentSession,
      total_readings: count,
      verified_readings: verified,
      current_streak: count > 0 ? 1 : 0,
      badge_level: badge,
      last_reading: userReadings[0]?.created_at || new Date().toISOString(),
    };
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
      const updated = NoiseDataService.sortReadingsNewestFirst([reading, ...prev]);
      const updatedIncidents = IncidentEngine.clusterReadings(updated, incidents);
      setIncidents(updatedIncidents);
      return updated;
    });

    // Dynamically increment user contribution records and streak
    setStreak((prev) => {
      const newTotal = prev.total_readings + 1;
      const newVerified = prev.verified_readings + 1;
      let badge = prev.badge_level;
      if (newTotal >= 50) badge = 'noise_guardian';
      else if (newTotal >= 25) badge = 'community_sensor';
      else if (newTotal >= 10) badge = 'noise_watcher';

      return {
        ...prev,
        total_readings: newTotal,
        verified_readings: newVerified,
        current_streak: Math.max(prev.current_streak, 1),
        badge_level: badge,
        last_reading: reading.created_at,
      };
    });
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-paper dark:bg-night-bg bg-field-grid text-graphite dark:text-night-text flex flex-col font-sans selection:bg-lime-signal selection:text-graphite transition-colors duration-150 antialiased">
      {/* Top Precision HUD Telemetry Header */}
      <Header
        currentGrid={readings[0]?.grid_id || "GEO_GRID: LOCATING..."}
        activeIncidentsCount={incidents.filter((i) => i.status === 'active').length}
        onOpenDemoToolbar={() => setIsSimulatorOpen(true)}
        onNavigateHome={() => setActiveTab('home')}
      />

      {/* PWA Install Promotion Banner */}
      <InstallPromptBanner />

      {/* Main Dynamic Viewport */}
      <main className={`flex-1 w-full mx-auto p-4 sm:p-6 pb-28 sm:pb-24 flex flex-col items-center justify-start ${
        activeTab === 'home' ? 'max-w-6xl' : 'max-w-5xl'
      }`}>
        {activeTab === 'home' && (
          <LandingView
            readings={readings}
            incidents={incidents}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onGenerateComplaint={(inc) => {
              setModalIncident(inc);
            }}
          />
        )}

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
            readings={readings}
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
          <EvidenceView
            incidents={incidents}
            readings={readings}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            pins={pins}
            onUpdatePins={setPins}
            streak={streak}
            readings={readings}
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
            const updated = NoiseDataService.sortReadingsNewestFirst([...simReadings, ...prev]);
            NoiseDataService.saveReadings(updated);
            const updatedIncidents = IncidentEngine.clusterReadings(updated, incidents);
            setIncidents(updatedIncidents);
            return updated;
          });
        }}
        onResetToBaseline={() => {
          const baseline = NoiseDataService.resetToBaseline();
          setReadings(baseline);
          setIncidents(IncidentEngine.clusterReadings(baseline));
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
