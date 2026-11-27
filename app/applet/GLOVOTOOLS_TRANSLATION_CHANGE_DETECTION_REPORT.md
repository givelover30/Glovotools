# GLOVOTOOLS — TRANSLATION CHANGE DETECTION REPORT
# Change Detection & Dictionary Synchronization Audit

## 1. Overview
Defines change detection strategies for identifying modified English strings, new translation keys, and deprecated entries during development.

## 2. Detection Mechanisms
- **Stable Keys**: Translation dictionary keys and calculator canonical IDs serve as immutable identifiers.
- **Git Diff & Manifests**: Development-time diffing of English source files against translation dictionary coverage utilities (`getMissingTranslationKeys()`).
- **Selective Regeneration**: Only modified or newly added keys trigger Gemini translation prompts, preserving existing approved translations.

## 3. Status
**ACTIVE & VERIFIED**
