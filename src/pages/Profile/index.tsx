import React, { useRef } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { useTranslation } from 'react-i18next';
import { useProfileData } from './useProfileData';
import { ProfileHeader } from './ProfileHeader';
import { ProfileSettings } from './ProfileSettings';
import { ProfileStats } from './ProfileStats';
import '../Profile.css';

export const Profile: React.FC = () => {
    const { t } = useTranslation();
    const { settings, updateSetting, exportSettings, importSettings } = useSettings();
    const configRef = useRef<HTMLDivElement>(null);
    const profileData = useProfileData();

    const handleConfigClick = () => {
        configRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleImportClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) importSettings(file);
        };
        input.click();
    };

    return (
        <div className="profile-container">
            <main className="profile-main">
                <ProfileHeader
                    user={profileData.user}
                    onConfigClick={handleConfigClick}
                />

                <div className="profile-dashboard-grid">
                    <div ref={configRef}>
                        <ProfileSettings
                            settings={settings}
                            updateSetting={updateSetting}
                            exportSettings={exportSettings}
                            onImportClick={handleImportClick}
                        />
                    </div>

                    <ProfileStats
                        displayPlaytime={profileData.displayPlaytime}
                        displayNotes={profileData.displayNotes}
                        displayAvgVelocity={profileData.displayAvgVelocity}
                        displaySessions={profileData.displaySessions}
                        currentLevel={profileData.currentLevel}
                        nextLevel={profileData.nextLevel}
                        levelProgress={profileData.levelProgress}
                        notesToNextLevel={profileData.notesToNextLevel}
                        statsTimeframe={profileData.statsTimeframe}
                        setStatsTimeframe={profileData.setStatsTimeframe}
                        recordings={profileData.recordings}
                        lastSession={profileData.stats.lastSession}
                    />
                </div>

                <footer className="profile-footer">
                    <p>{t('footer.copyright')} Systems v2.4.1</p>
                    <div className="footer-links">
                        <button>{t('profile.privacy')}</button>
                        <button>{t('profile.terms')}</button>
                        <button>{t('profile.systemStatus')} <span className="text-green-600">{t('profile.statusStable')}</span></button>
                    </div>
                </footer>
            </main>
        </div>
    );
};
