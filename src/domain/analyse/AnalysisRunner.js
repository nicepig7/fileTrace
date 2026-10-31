import { runVueTrace } from "./vue/VueAnalyzer.js";
import { runKotlinTrace } from "./kotlin/KotlinAnalyzer.js";
import { runClassTrace } from "./class/ClassAnalyzer.js";
import { runDbioTrace } from "./dbio/DbioAnalyzer.js";

export class AnalysisRunner {
  constructor(projects) {
    this.projects = projects;
    this.allVue = {};
    this.allUi = { screens: [], apis: [], mappings: [] };
    this.allClassesV2 = [];
    this.allDbiosV2 = [];
  }


  async runAll() {
    for (const project of this.projects) {
      if (!project.dir) continue;

      if (project.type === 'WEB') {
        const taskName = `${project.id.toLowerCase()}-web`;
        try {
          const res = await runVueTrace(project);
          this.logTaskCompletion(taskName, res);
          this.processResult('vue', res);
        } catch (err) {
          console.error(`[AnalysisRunner] Error in vue analysis for project ${project.id}:`, err);
        }
      } else if (project.type === 'AOS') {
        const taskName = `${project.id.toLowerCase()}-aos`;
        try {
          const res = await runKotlinTrace(project);
          this.logTaskCompletion(taskName, res);
          this.processResult('kotlin', res);
        } catch (err) {
          console.error(`[AnalysisRunner] Error in kotlin analysis for project ${project.id}:`, err);
        }
      } else if (project.type === 'ONLINE') {
        const dbioTaskName = `${project.id.toLowerCase()}-dbio`;
        try {
          const res = await runDbioTrace(project);
          this.logTaskCompletion(dbioTaskName, res);
          this.processResult('dbio', res);
        } catch (err) {
          console.error(`[AnalysisRunner] Error in dbio analysis for project ${project.id}:`, err);
        }

        const classTaskName = `${project.id.toLowerCase()}-class`;
        try {
          const res = await runClassTrace(project);
          this.logTaskCompletion(classTaskName, res);
          this.processResult('class', res);
        } catch (err) {
          console.error(`[AnalysisRunner] Error in class analysis for project ${project.id}:`, err);
        }
      }
    }
  }

  logTaskCompletion(taskName, res) {
    const time = new Date().toTimeString().split(' ')[0];
    const durs = String(res.durationSec.toFixed(2)).padStart(6, ' ');
    console.log(`${time}(${durs}s) Task completed: ${taskName} `);
  }


  processResult(type, result) {
    if (!result) return;
    if (type === 'vue' && result.vueMappings) {
      this.allUi.screens.push(...result.vueMappings.screens);
      this.allUi.apis.push(...result.vueMappings.apis);
      this.allUi.mappings.push(...result.vueMappings.mappings);
    } else if (type === 'kotlin' && result.kotlinMappings) {
      this.allUi.screens.push(...result.kotlinMappings.screens);
      this.allUi.apis.push(...result.kotlinMappings.apis);
      this.allUi.mappings.push(...result.kotlinMappings.mappings);
    } else if (type === 'class' && result.classes) {
      this.allClassesV2.push(...result.classes);
    } else if (type === 'dbio' && result.dbios) {
      this.allDbiosV2.push(...result.dbios);
    }
  }

  getResults() {
    return {
      allUi: this.allUi,
      allClassesV2: this.allClassesV2,
      allDbiosV2: this.allDbiosV2,
    };
  }
}
