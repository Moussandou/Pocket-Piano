import React from 'react';
import './Landing.css'; // Reusing landing styles for consistency

export const Legal: React.FC = () => {
    return (
        <main className="landing-main">
            <section className="features-section" style={{ paddingTop: '8rem', minHeight: '80vh' }}>
                <div className="features-header" style={{ alignItems: 'flex-start' }}>
                    <div>
                        <span className="subhead">Compliance & Data</span>
                        <h3 className="section-title">Mentions Légales & RGPD</h3>
                    </div>
                </div>

                <div className="legal-content" style={{ maxWidth: '800px', padding: '0 1.5rem', fontFamily: 'var(--font-body)', lineHeight: '1.8' }}>
                    <div style={{ marginBottom: '4rem' }}>
                        <h4 style={{ textTransform: 'uppercase', marginBottom: '1.5rem', fontSize: '1.25rem' }}>1. Mentions Légales</h4>
                        <p style={{ marginBottom: '1.5rem' }}>
                            <strong>Éditeur du site :</strong><br />
                            Pocket Piano est un projet expérimental développé par Audio Industries Ltd.<br />
                            Directeur de la publication : O. Moussandou
                        </p>
                        <p>
                            <strong>Hébergement :</strong><br />
                            Le site est hébergé par Firebase (Google Cloud Platform)<br />
                            Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA.
                        </p>
                    </div>

                    <div style={{ marginBottom: '4rem' }}>
                        <h4 style={{ textTransform: 'uppercase', marginBottom: '1.5rem', fontSize: '1.25rem' }}>2. Politique de Confidentialité (RGPD)</h4>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Conformément au Règlement Général sur la Protection des Données (RGPD), nous vous informons que Pocket Piano collecte des données minimales nécessaires au fonctionnement du service.
                        </p>
                        <p style={{ marginBottom: '1.5rem' }}>
                            <strong>Données collectées :</strong><br />
                            - Adresse email (via Google Authentication pour la synchronisation du profil).<br />
                            - Statistiques d'utilisation anonymisées (notes jouées, temps de session) pour améliorer l'expérience utilisateur.
                        </p>
                        <p style={{ marginBottom: '1.5rem' }}>
                            <strong>Finalités :</strong><br />
                            Les données sont utilisées exclusivement pour permettre la sauvegarde de vos réglages, de vos enregistrements et l'affichage de vos statistiques personnelles. Aucune donnée n'est cédée à des tiers.
                        </p>
                        <p>
                            <strong>Vos droits :</strong><br />
                            Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez exercer ces droits en nous contactant à l'adresse email de support indiquée en bas de page.
                        </p>
                    </div>

                    <div style={{ marginBottom: '4rem' }}>
                        <h4 style={{ textTransform: 'uppercase', marginBottom: '1.5rem', fontSize: '1.25rem' }}>3. Propriété Intellectuelle</h4>
                        <p>
                            L'ensemble des éléments constituant ce site (structure, design, logos, sons) est la propriété exclusive de ses créateurs, sauf mention contraire.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
};
