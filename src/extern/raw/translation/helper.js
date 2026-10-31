import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'src/extern/raw/translation/translation_cache.json');
const TODO_FILE = path.join(process.cwd(), 'src/extern/raw/translation/todo_translate.json');

// 작업 편의를 위해 temp 디렉토리 사용
const TEMP_DIR = path.join(process.cwd(), 'temp/translation_helper');
const INPUT_FILE = path.join(TEMP_DIR, 'input.json');
const OUTPUT_FILE = path.join(TEMP_DIR, 'output.json');

const VIETNAMESE_REGEX = /[àáãạảăắằẵặẳâấầẫậẩđèéẽẹẻêếềễệểìíĩịỉòóõọỏôốồỗộổơớờỡợởùúũụủưứừữựửỳýỹỵỷ]/i;
const KOREAN_REGEX = /[가-힣]/;

function detectLanguage(text) {
    if (!text) return 'en';
    if (KOREAN_REGEX.test(text)) return 'ko';
    if (VIETNAMESE_REGEX.test(text)) return 'vi';
    return 'en';
}

function isValid(ko, en, vi) {
    if (!ko || !en || !vi) return false;
    if (detectLanguage(ko) !== 'ko') return false;
    // 영어는 한국어나 베트남어가 포함되어 있지 않으면 통과
    if (detectLanguage(en) !== 'en') return false;
    if (detectLanguage(vi) !== 'vi') return false;
    return true;
}

function ensureTempDir() {
    if (!fs.existsSync(TEMP_DIR)) {
        fs.mkdirSync(TEMP_DIR, { recursive: true });
    }
}

function extract(count) {
    if (!fs.existsSync(TODO_FILE)) {
        console.error("TODO file not found!");
        return;
    }

    const todoArr = JSON.parse(fs.readFileSync(TODO_FILE, 'utf-8'));
    if (todoArr.length === 0) {
        console.log("TODO list is already empty! Everything is translated.");
        return;
    }

    ensureTempDir();
    const toExtract = todoArr.slice(0, count);
    fs.writeFileSync(INPUT_FILE, JSON.stringify(toExtract, null, 2), 'utf-8');

    // Create an empty output file for convenience so user just pastes into it
    fs.writeFileSync(OUTPUT_FILE, "[\n  // 여기에 AI가 번역해준 JSON 배열을 붙여넣으세요.\n]", 'utf-8');

    console.log(`\n✅ [추출 완료] ${toExtract.length}개의 단어가 추출되었습니다.`);
    console.log(`- 남은 TODO 개수: ${todoArr.length - toExtract.length}개`);
    console.log(`\n👉 다음 작업을 수행하세요:`);
    console.log(`1. 'temp/translation_helper/input.json' 파일의 내용을 복사하여 외부 번역 AI에게 전달하세요.`);
    console.log(`2. AI가 번역해준 결과(JSON 배열)를 복사하세요.`);
    console.log(`3. 'temp/translation_helper/output.json' 파일에 결과를 덮어쓰기 형태로 붙여넣고 저장하세요.`);
    console.log(`4. 터미널에서 'node src/extern/raw/translation/helper.js merge' 명령어를 실행하세요.\n`);
}

function merge() {
    if (!fs.existsSync(OUTPUT_FILE)) {
        console.error("❌ Output file not found! 'temp/translation_helper/output.json' 파일을 확인하세요.");
        return;
    }

    let aiResults = [];
    try {
        const raw = fs.readFileSync(OUTPUT_FILE, 'utf-8');
        aiResults = JSON.parse(raw);
        if (!Array.isArray(aiResults)) {
            throw new Error("Result is not an array");
        }
    } catch (e) {
        console.error("❌ 'output.json' 파일의 형식이 올바른 JSON 배열이 아닙니다. 붙여넣기 시 괄호 및 쉼표 등 문법을 확인해주세요.");
        return;
    }

    let inputArr = [];
    if (fs.existsSync(INPUT_FILE)) {
        inputArr = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
    }

    let cacheArr = [];
    if (fs.existsSync(CACHE_FILE)) {
        cacheArr = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
    }
    const existingCacheOriginals = new Set(cacheArr.map(c => c.original));

    let successCount = 0;
    
    // AI 번역 결과를 검증하고 캐시에 추가
    aiResults.forEach((item, index) => {
        const originalText = item.original ? item.original.trim() : (inputArr[index] ? inputArr[index].trim() : null);
        if (!originalText) return;

        let ko = item.ko ? item.ko.trim() : "";
        let en = item.en ? item.en.trim() : "";
        let vi = item.vi ? item.vi.trim() : "";

        // 원문을 해당 언어 속성에 덮어씌워서 무조건 원본을 보존
        const lang = detectLanguage(originalText);
        if (lang === 'ko') ko = originalText;
        if (lang === 'en') en = originalText;
        if (lang === 'vi') vi = originalText;

        if (isValid(ko, en, vi)) {
            // 원본 텍스트 및 번역본 각각을 검색키(original)로 활용하여 캐시 3개 생성 (단 중복 방지)
            const langs = [ko, en, vi];
            let addedForThisItem = false;
            for (let orig of langs) {
                if (!existingCacheOriginals.has(orig)) {
                    cacheArr.push({ original: orig, ko, en, vi });
                    existingCacheOriginals.add(orig);
                    addedForThisItem = true;
                }
            }
            if (addedForThisItem) successCount++;
        } else {
            console.warn(`⚠️ [검증 실패] 유효하지 않은 번역 건 제외됨: Original="${originalText}"`);
        }
    });

    // Cache 저장
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheArr, null, 2), 'utf-8');

    // Todo 정리
    let todoArr = [];
    if (fs.existsSync(TODO_FILE)) {
        todoArr = JSON.parse(fs.readFileSync(TODO_FILE, 'utf-8'));
    }

    const inputSet = new Set(inputArr.map(item => item.trim()));
    const newTodoArr = todoArr.filter(item => !inputSet.has(item.trim()));

    fs.writeFileSync(TODO_FILE, JSON.stringify(newTodoArr, null, 2), 'utf-8');

    // 성공한 경우 temp 파일 정리
    if (fs.existsSync(INPUT_FILE)) fs.unlinkSync(INPUT_FILE);
    if (fs.existsSync(OUTPUT_FILE)) fs.unlinkSync(OUTPUT_FILE);

    console.log(`\n✅ [병합 완료] ${successCount}개의 번역 항목이 성공적으로 검증되어 캐시에 저장되었습니다.`);
    console.log(`- 업데이트된 총 캐시 아이템 수: ${cacheArr.length}개`);
    console.log(`- 남은 TODO 아이템 수: ${newTodoArr.length}개\n`);
    console.log(`추가 작업을 원하시면 'node src/extern/raw/translation/helper.js extract 30'을 다시 실행하세요.\n`);
}

const action = process.argv[2];
const countArg = parseInt(process.argv[3], 10);

if (action === 'extract') {
    const count = isNaN(countArg) || countArg <= 0 ? 30 : countArg;
    extract(count);
} else if (action === 'merge') {
    merge();
} else {
    console.log("사용법:");
    console.log("  추출: node src/extern/raw/translation/helper.js extract [가져올개수]");
    console.log("  병합: node src/extern/raw/translation/helper.js merge");
}
