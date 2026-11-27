# GLOVOTOOLS — PLANNER-IMPLEMENTATION-02 BATCH 2 MANUAL BROWSER QA CHECKLIST

**Task ID:** PLANNER-IMPLEMENTATION-02 — Batch 2  
**Scope:** 12 Authorized P1 Generic Placeholder Planner Tools  
**Mode:** Real-Browser Manual QA Preparation  

## Instructions for Opening the Application in a Real Browser

1. Start the development server (or use the deployed preview URL):
   - Local Dev URL: `http://localhost:3000`
   - Preview URL: `https://ais-dev-nqfwbudob6ijkgfndfzzwd-291596293761.us-east1.run.app`
2. Navigate directly to any of the 12 Batch 2 planner routes using the URL pattern `/calculator/<tool-id>` or via the Planners & Organizers directory.

---

## The 12 Batch 2 Routes

1. `/calculator/construction-cost-schedule-planner`
2. `/calculator/electrical-install-planner`
3. `/calculator/solar-install-planner`
4. `/calculator/manufacturing-production-planner`
5. `/calculator/marketing-budget-planner`
6. `/calculator/employee-payroll-planner`
7. `/calculator/inventory-reorder-planner`
8. `/calculator/freelance-pricing-planner`
9. `/calculator/workforce-shift-planner`
10. `/calculator/procurement-purchase-order-planner`
11. `/calculator/preventive-maintenance-schedule-planner`
12. `/calculator/business-continuity-disaster-recovery-planner`

---

## Universal Manual QA Test Scenarios & Instructions

For each of the 12 planners above, perform the following verification steps:

1. **Workspace Opening:** Navigate to `/calculator/<tool-id>` and confirm the workspace title, input panel, and results panel render correctly.
2. **Valid Inputs:** Enter valid initial numeric and text values. Verify that calculations update live.
3. **Calculation Accuracy:** Verify primary KPI cards, breakdown lists, and calculated summary metrics.
4. **Invalid / Missing Inputs:** Enter negative numbers or clear required fields. Verify inline validation error messages and error states.
5. **State Persistence:** Modify input values, refresh the browser page (`F5`), and verify that changes persist via `usePlannerStorage`.
6. **Reset Functionality:** Click the Reset / Restore Default button and verify state reverts to default values.
7. **CSV Export:** Click the CSV export button and verify that an RFC 4180 `.csv` file downloads with correct headers and rows.
8. **JSON Export:** Click the JSON export button and verify that a structured `.json` backup file downloads successfully.
9. **Clipboard & Print:** Test the Copy Result/Text control (verifying success toast) and Print Result button.
10. **Bilingual EN/ES Switching:** Toggle language between English and Spanish via the header/footer locale switcher; verify all labels and results render correctly in Spanish.
11. **Responsive Layout:** Test viewports across Desktop (1280px+), Tablet (768px), and Mobile (375px) to ensure no overflow or truncation occurs.
