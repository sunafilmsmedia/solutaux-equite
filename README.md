# SoluTaux — Combien puis-je aller chercher sur ma maison pour payer mes dettes?

Questionnaire de 9 questions pour un courtier hypothécaire. Le visiteur répond, l'app estime
l'équité disponible sur sa propriété et de combien il pourrait réduire ses paiements, puis
classe le dossier en 4 niveaux de qualification (A à D) avant de l'envoyer au CRM.

## Démarrage

```bash
npm install
npm run dev        # http://localhost:3000
```

## Statut des intégrations

| Service | État | Où le brancher |
|---|---|---|
| Calculs financiers | ✅ réels, en local | `src/lib/calculations.ts`, `scoring.ts`, `recommendation.ts` |
| Envoi CRM | 🟡 **stub** (log serveur) | `src/lib/crm.ts` → définir `CRM_WEBHOOK_URL` pour POST réel (format GoHighLevel) |
| Base de données | ⛔ non branché | Supabase (table `leads`) — voir TODO dans `src/app/api/submit-lead/route.ts` |

Copie `.env.example` vers `.env.local` et remplis les clés au besoin.

## Flux

`/` (landing) → `/calculator` (questionnaire 9 questions) →
`POST /api/submit-lead` (validation Zod → calculs d'équité → classification A-D → CRM) →
`/results/[id]` (résultat) → `/thank-you`.

## Les 9 questions

1. Type de propriété (filtre non-propriétaire)
2. Ancienneté comme propriétaire
3. Valeur de la propriété (curseur)
4. Solde hypothécaire (curseur + « Je ne sais pas »)
5. Historique de refinancement (+ montant utilisé si marge/2e hypothèque)
6. Montant de dettes à régler
7. Paiement mensuel actuel sur ces dettes
8. Qualité du crédit
9. Situation d'emploi

Puis coordonnées : prénom, téléphone, courriel, code postal.

## Calcul

```
Max refinançable    = Valeur × 0,80
Prêts garantis       = Solde hypo + Marge/2e hypothèque
Équité disponible   = Max refinançable − Prêts garantis
Ratio actuel (LTV)  = Prêts garantis ÷ Valeur
Couverture          = Équité disponible ÷ Dettes
```

Si le solde hypothécaire est inconnu, il est estimé à partir de l'ancienneté (`lib/config.ts`,
`estimatedLtvByOwnershipDuration`) et le lead est tagué `solde-a-valider`.

## Qualification (tags GHL)

| Niveau | Conditions | Action |
|---|---|---|
| 🔥 A Chaud | Couverture ≥ 100 %, crédit bon/quelques retards, pas de refinancement récent | Appel 5 minutes |
| ✅ B Partiel | Équité > 0 mais couverture < 100 % | Appel dans l'heure |
| ⚠️ C Alternatif | Ratio actuel 80-85 %, OU crédit refusé/faillite, OU refinancement < 3 ans | Michael ou Dufresne évalue (prêteurs alternatifs) |
| ❌ D Non qualifié | Pas propriétaire, ou ratio > 85 % | Séquence de nurture, pas d'appel |

⚠️ Les seuils du niveau C (`altLenderMinLTV`/`altLenderMaxLTV` dans `src/lib/config.ts`) sont
des valeurs de départ — à confirmer avec Michael (jusqu'où ses prêteurs alternatifs acceptent
d'aller), de même que le taux et l'amortissement utilisés pour l'estimation d'économie.

## Configuration métier

Taux, amortissement, seuils LTV, points milieux des fourchettes, estimation du solde manquant,
coordonnées du courtier : tout est centralisé dans `src/lib/config.ts`.
