const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

console.time('총 소요 시간');

const defaultDirs = [
    path.join(process.cwd(), 'target/sample-backend'),
];

// Read directories from CLI arguments (comma-separated or multiple args) or environment variable
const customDirs = process.argv.slice(2).flatMap(arg => arg.split(',')).filter(Boolean);
const targetDirs = customDirs.length > 0 
    ? customDirs 
    : (process.env.TARGET_DIRS ? process.env.TARGET_DIRS.split(',') : defaultDirs);

function getFormattedDate() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${yyyy}${mm}${dd}_${hh}${min}`;
}

const reportPath = path.join(process.cwd(), 'temp', 'report', `java_usage_report_${getFormattedDate()}.txt`);
fs.mkdirSync(path.dirname(reportPath), { recursive: true });

let reportContent = '프로젝트명\t패키지명\t클래스명\tLine위치\t커밋작성자\t소스코드\n' + '-'.repeat(100) + '\n';
let totalFoundCount = 0;
let totalFoundFileCount = 0;

async function processProjects() {
    for (const projectDir of targetDirs) {
        const projectName = path.basename(projectDir);
        process.stdout.write(`\nProcessing project: ${projectName}...\n`);
        
        if (!fs.existsSync(projectDir)) {
            process.stdout.write(`  -> 프로젝트 폴더를 찾을 수 없습니다.\n`);
            continue;
        }

        let grepOutput = '';
        try {
            // git grep으로 고속 사전 스캔
            grepOutput = execSync(`git grep -n -i -E "System\\.out\\.print|\\.printstacktrace|stacktrace\\(" -- "*.java"`, { 
                cwd: projectDir, 
                encoding: 'utf8',
                maxBuffer: 1024 * 1024 * 10
            });
        } catch (e) {
            process.stdout.write(`  -> [완료] 발견된 파일: 0개, 발견된 라인: 0라인\n`);
            continue;
        }

        const matches = grepOutput.split('\n').filter(Boolean);
        const filesMap = {};

        matches.forEach(match => {
            const firstColon = match.indexOf(':');
            const secondColon = match.indexOf(':', firstColon + 1);
            if (firstColon > -1 && secondColon > -1) {
                const filePath = match.substring(0, firstColon);
                const lineNum = parseInt(match.substring(firstColon + 1, secondColon), 10);
                const codeLine = match.substring(secondColon + 1).trim();

                if (!codeLine.startsWith('//') && !codeLine.startsWith('*') && !codeLine.startsWith('/*')) {
                    if (!filesMap[filePath]) filesMap[filePath] = [];
                    filesMap[filePath].push({ lineNum, codeLine });
                }
            }
        });

        const fileEntries = Object.entries(filesMap);
        const projectFileCount = fileEntries.length;
        let projectLineCount = 0;
        let processedFiles = 0;

        // 비동기 병렬 실행을 위한 워커 함수
        async function processFile(filePath, lines) {
            let authorsByLine = {};
            try {
                // 병렬로 git blame 실행
                const { stdout: blameOutput } = await execAsync(`git blame --line-porcelain "${filePath}"`, { 
                    cwd: projectDir, 
                    encoding: 'utf8', 
                    maxBuffer: 1024 * 1024 * 10
                });
                
                let currentLineNum = 1;
                blameOutput.split('\n').forEach(bLine => {
                    if (bLine.startsWith('author ')) {
                        authorsByLine[currentLineNum] = bLine.substring(7).trim();
                    } else if (bLine.startsWith('\t')) {
                        currentLineNum++;
                    }
                });
            } catch (e) {}

            const className = path.basename(filePath, '.java');
            let packageName = 'Unknown';
            try {
                const fileContent = await fs.promises.readFile(path.join(projectDir, filePath), 'utf8');
                const pkgMatch = fileContent.match(/package\s+([^;]+);/);
                if (pkgMatch) packageName = pkgMatch[1].trim();
            } catch (e) {}

            let localContent = '';
            lines.forEach(l => {
                const author = authorsByLine[l.lineNum] || 'Unknown';
                localContent += `${projectName}\t${packageName}\t${className}\t${l.lineNum}\t${author}\t${l.codeLine}\n`;
                projectLineCount++;
            });
            
            processedFiles++;
            // 프로그레스 바 갱신
            process.stdout.write(`\r\x1b[K  -> 스캔 및 Blame 분석 중... (파일 ${processedFiles}/${projectFileCount} 처리 완료)`);
            return localContent;
        }

        // 최대 10개의 파일을 병렬로 동시 처리하여 git blame 속도를 비약적으로 상승 (Batch 처리)
        const CONCURRENCY_LIMIT = 10;
        for (let i = 0; i < fileEntries.length; i += CONCURRENCY_LIMIT) {
            const batch = fileEntries.slice(i, i + CONCURRENCY_LIMIT);
            const results = await Promise.all(batch.map(([filePath, lines]) => processFile(filePath, lines)));
            reportContent += results.join('');
        }

        // 개별 프로젝트 끝날 때마다 요약 출력
        process.stdout.write(`\n  -> [완료] 발견된 파일: ${projectFileCount}개, 발견된 라인: ${projectLineCount}라인\n`);
        
        totalFoundFileCount += projectFileCount;
        totalFoundCount += projectLineCount;
    }

    fs.writeFileSync(reportPath, reportContent, 'utf8');
    console.log(`\n=================================================`);
    console.log(`최종 완료! Report: ${reportPath}`);
    console.log(`총 발견된 파일: ${totalFoundFileCount}개`);
    console.log(`총 발견된 라인: ${totalFoundCount}라인`);
    console.timeEnd('총 소요 시간');
}

processProjects().catch(console.error);
