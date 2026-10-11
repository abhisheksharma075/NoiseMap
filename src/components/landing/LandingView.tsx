import React from 'react';
import { HeroSection } from './HeroSection';
import { EnvironmentalStatistics } from './EnvironmentalStatistics';
import { LiveMapPreview } from './LiveMapPreview';
import { FeatureShowcase } from './FeatureShowcase';
import { HowItWorks } from './HowItWorks';
import { PrivacySection } from './PrivacySection';
import { LandingFooter } from './LandingFooter';
import { NoiseReading, NoiseIncident } from '../../types';
import { TabType } from '../layout/NavigationBar';

interface LandingViewProps {
  readings: NoiseReading[];
  incidents: NoiseIncident[];
  onNavigateTab: (tab: TabType) => void;
  onGenerateComplaint?: (incident: NoiseIncident) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  readings,
  incidents,
  onNavigateTab,
  onGenerateComplaint,
}) => {
  return (
    <div className="w-full flex flex-col items-center animate-in fade-in duration-300">
      {/* 1. Hero Section with AI Acoustic Guardian Avatar */}
      <HeroSection
        readings={readings}
        incidents={incidents}
        onStartMeasuring={() => onNavigateTab('measure')}
        onExploreMap={() => onNavigateTab('map')}
      />

      {/* 2. Real-Time Telemetry Statistics */}
      <EnvironmentalStatistics
        readings={readings}
        incidents={incidents}
      />

      {/* 3. Live Heatmap Interactive Preview */}
      <LiveMapPreview
        readings={readings}
        incidents={incidents}
        onOpenFullMap={() => onNavigateTab('map')}
        onGenerateComplaint={onGenerateComplaint}
      />

      {/* 4. Feature Showcase Grid */}
      <FeatureShowcase
        onNavigateTab={(tab) => onNavigateTab(tab)}
      />

      {/* 5. 4-Stage Operational Pipeline */}
      <HowItWorks
        onStartMeasuring={() => onNavigateTab('measure')}
      />

      {/* 6. Zero-Knowledge Privacy Architecture */}
      <PrivacySection />

      {/* 7. Comprehensive Landing Footer */}
      <LandingFooter
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
