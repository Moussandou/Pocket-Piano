# POCKET PIANO — CAHIER DES CHARGES V2
## Axe stratégique : Gamification, Progression & Analytics Avancées

---

# 1. OBJECTIF PRODUIT

Transformer Pocket Piano d’un simple instrument virtuel en :

→ Une plateforme d’entraînement musical
→ Un outil de progression mesurable
→ Un environnement motivant basé sur la data
→ Un studio personnel intelligent

L’objectif est d’introduire une réelle notion de progression avec :
- Statistiques avancées
- Indicateurs de performance
- Système de niveaux
- Objectifs
- Feedback post-session
- Défis
- Visualisation claire de l’évolution

---

# 2. NOUVELLES FONCTIONNALITÉS — AXE PROGRESSION

---

## 2.1 SYSTÈME DE STATISTIQUES AVANCÉES

### 🎯 Objectif
Quantifier la pratique réelle et créer un sentiment de progression mesurable.

### 📊 Nouvelles métriques à implémenter

1. Total Keys Pressed (global)
2. Keys Pressed Today
3. Average Notes Per Minute (NPM)
4. Longest Streak (temps de jeu continu)
5. Accuracy (si mode exercice activé)
6. Velocity Control Score (écart-type des vélocités)
7. Range Usage (nombre d’octaves utilisées)
8. Most Used Key
9. Session Intensity Score (calcul basé sur NPM + vélocité)
10. Practice Consistency (jours consécutifs)

---

### 🔧 Implémentation Technique

- Hook global : usePerformanceTracker()
- Tracking en temps réel via contexte React
- Batch save Firestore toutes les X secondes
- Agrégation journalière
- Collection Firestore :

users/{userId}/stats/
- global
- daily
- sessions

---

### 🎨 Prompt Design — Dashboard Stats

Design a performance analytics dashboard for a premium piano training web app.
Light theme. No gradients. No emoji.
Industrial precision style.
Dynamic grid layout inspired by studio hardware panels.
Each stat block must feel engineered.
Use strong typography hierarchy.
Display metrics like Total Keys Pressed, Notes Per Minute, Longest Streak.
Data visualization minimal, no generic chart style.
Use sharp lines, structured spacing.

---

# 3. SYSTÈME DE NIVEAUX & XP

## 🎯 Objectif
Créer une progression visible et motivante.

### 🧠 Concept
XP basé sur :
- Notes jouées
- Régularité
- Utilisation complète du clavier
- Complexité rythmique

### 📈 Système

Level 1 → 10 000 notes
Level 2 → 25 000 notes
Level 3 → 60 000 notes

Formule exponentielle.

### 🏆 Badges

- First 1000 Notes
- 7 Days Streak
- Full Keyboard Explorer
- Dynamic Player (variation vélocité élevée)
- Night Session (joué après 23h)

---

### 🎨 Prompt Design — Level System

Design a refined progression level system UI for a piano web app.
No gamification clichés.
No cartoon.
Minimal but prestigious.
XP bar must look like a calibrated instrument meter.
Level indicator subtle but powerful.
No gradient.
No shiny gaming effects.

---

# 4. SESSION REPORT INTELLIGENT

## 🎯 Objectif
Afficher un rapport après chaque session.

### 📊 Données affichées

- Duration
- Notes played
- Notes per minute
- Dynamic range
- Intensity score
- Keyboard heatmap
- Improvement vs last session

---

### 🎨 Prompt Design — Session Summary

Design a post-session performance report panel.
Studio-grade interface.
Light theme.
Heatmap visualization of piano keyboard usage.
Stat comparison vs previous session.
Structured layout, asymmetric grid.
No gradients.

---

# 5. MODE ENTRAÎNEMENT (Practice Mode)

## 🎯 Objectif
Introduire un cadre pédagogique.

### Types d'exercices

1. Random note training
2. Scale training
3. Chord recognition
4. Rhythm timing mode

### Score

- Accuracy %
- Reaction time
- Consistency index

---

### 🎨 Prompt Design — Practice Mode

Design a minimal training interface for piano exercises.
Clean light background.
Target note displayed with strong typography.
Countdown timer subtle.
Score displayed in structured numeric blocks.
No playful design.
Precision tool aesthetic.

---

# 6. HEATMAP & ANALYSE VISUELLE

## 🎯 Objectif
Montrer comment l’utilisateur joue.

### Features

- Keyboard heatmap global
- Heatmap par session
- Graph évolution NPM sur 30 jours
- Graph régularité hebdomadaire

---

### 🎨 Prompt Design — Heatmap

Design a piano keyboard heatmap visualization.
Light industrial theme.
Sharp color signals.
No gradient.
Keys progressively tinted based on usage intensity.
Clean data representation.

---

# 7. OBJECTIFS & DÉFIS

## 🎯 Objectif
Créer un engagement long terme.

### Daily Goals

- Play 10 minutes
- Use 4 octaves
- Reach 300 notes

### Weekly Goals

- 5 sessions
- 10 000 notes

---

### 🎨 Prompt Design — Goals Panel

Design a goals tracking panel.
Minimal.
Check indicators subtle.
Progress represented by thin calibrated bars.
Industrial design.
No gamification colors.

---

# 8. SOCIAL (OPTION FUTURE)

- Compare streak with friends
- Anonymous leaderboard
- Share session stats image export

---

# 9. ROADMAP TECHNIQUE PRIORITAIRE

Phase 1
- Tracking avancé
- Firestore structuration
- Dashboard

Phase 2
- Level & XP
- Session report

Phase 3
- Practice mode
- Heatmap avancée

---

# 10. IMPACT PRODUIT

Avec ces ajouts, Pocket Piano devient :

- Un instrument
- Un coach
- Un tracker
- Un outil analytique
- Une plateforme de progression musicale

Ce pivot change totalement la perception produit :
Ce n’est plus un piano web.
C’est un environnement de pratique intelligent.

