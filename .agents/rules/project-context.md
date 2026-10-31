---
description: TraceFile Project Core Architecture & Analysis Rules
---

# TraceFile Project Context

When working on the TraceFile Analysis Script Project, always keep the following architectural principles and context in mind:

## 1. Monorepo-style 1-Level Structure
- This project integrates both the **Node.js backend (Static Analyzer)** and the **Vue 3 frontend (Web Viewer)** in a single repository.
- Code is divided by domain, not strictly by frontend/backend folders at the root.
- **Key Directories**:
  - `src/domain/analyse/`: Backend scripts (Java, Vue, Android, DBIO parsing, Report Aggregation). Entry: `src/buildData.js`.
  - `src/domain/report/`: Frontend Vue 3 UI for visualizing the reports. Entry: `src/main.js`.
  - `result/`: Temporary raw JSON outputs from the analyzer.
  - `report/`: The final Vite build output folder (HTML, JS, CSS).

## 2. Dynamic Target Path Resolution
- The analyzer supports multiple projects (e.g., MBW, ADM).
- During execution, the tool reads system environment variables (e.g., `TARGET_DIR`, `VUE_TARGET_DIR`, `ADM_TARGET_DIR`) to find the source code of the target systems. 
- Always ensure that file paths and parsers can handle dynamic roots.

## 3. Analysis Artifacts
The node analyzer generates several core JSON artifacts which the Vue viewer then consumes:
- `report_mci.json`: External interface mapping (callTrx).
- `report_ctr.json`: Controller endpoint mapping.
- `report_call.json`: Complete method call hierarchy (CTR -> SVC -> COM).
- `report_dbm.json`: DB Mapper queries (`_DBM.dbio`).
- `report_vue.json` / `report_android.json`: Client UI to Backend API mappings.
- `report_owner.json`: Git Blame developer ownership data.
- **`report_data.js`**: The aggregated final file used by the frontend to render the viewer.

## 4. Maintenance Guidelines
- Ensure that updates to the Node.js parsers (`domain/analyse`) output data in structures that the Vue UI (`domain/report`) can handle, or update both simultaneously.
- When generating new features, strictly adhere to the established `assets`, `base`, `common`, `domain`, and `extern` 1-level folder structure.
