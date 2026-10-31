import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'src/extern/raw/translation/translation_cache.json');
const TODO_FILE = path.join(process.cwd(), 'src/extern/raw/translation/todo_translate.json');

const VIETNAMESE_REGEX = /[àáãạảăắằẵặẳâấầẫậẩđèéẽẹẻêếềễệểìíĩịỉòóõọỏôốồỗộổơớờỡợởùúũụủưứừữựửỳýỹỵỷ]/i;
const KOREAN_REGEX = /[가-힣]/;

export class TranslateManager {
    constructor() {
        this.cache = {}; // In-memory map
        this.todoList = new Set(); // Track missing translations
        this.isDirty = false;
        
        // Load existing todo to avoid losing items if run multiple times
        this.loadTodo();
        this.loadCache();
    }

    loadTodo() {
        if (fs.existsSync(TODO_FILE)) {
            try {
                const arr = JSON.parse(fs.readFileSync(TODO_FILE, 'utf-8'));
                if (Array.isArray(arr)) {
                    arr.forEach(item => this.todoList.add(item));
                }
            } catch (e) {
                console.error("[TranslateManager] Failed to load todo list:", e);
            }
        }
    }

    loadCache() {
        if (fs.existsSync(CACHE_FILE)) {
            try {
                const raw = fs.readFileSync(CACHE_FILE, 'utf-8');
                const arr = JSON.parse(raw);
                if (Array.isArray(arr)) {
                    for (const item of arr) {
                        const { original, ko, en, vi } = item;
                        if (original) this.cache[original] = item;
                        if (ko) this.cache[ko] = item;
                        if (en) this.cache[en] = item;
                        if (vi) this.cache[vi] = item;
                    }
                } else {
                    this.cache = arr;
                    this.isDirty = true;
                }
            } catch (e) {
                console.error("[TranslateManager] Failed to load cache:", e);
                this.cache = {};
            }
        }
    }

    saveCache() {
        if (this.isDirty) {
            const uniqueItems = new Set(Object.values(this.cache));
            const arr = Array.from(uniqueItems);
            fs.writeFileSync(CACHE_FILE, JSON.stringify(arr, null, 2), 'utf-8');
            this.isDirty = false;
            console.log(`[TranslateManager] Cache saved: ${CACHE_FILE} (${arr.length} unique items)`);
        }
        
        // Always save todo list if there are missing translations
        if (this.todoList.size > 0) {
            const todoArr = Array.from(this.todoList);
            fs.writeFileSync(TODO_FILE, JSON.stringify(todoArr, null, 2), 'utf-8');
            console.log(`[TranslateManager] Missing translations saved to: ${TODO_FILE} (${todoArr.length} items)`);
        } else if (fs.existsSync(TODO_FILE)) {
            // If all done, we can optionally clear/remove it
            fs.unlinkSync(TODO_FILE);
            console.log(`[TranslateManager] All translations completed. Removed: ${TODO_FILE}`);
        }
    }

    detectLanguage(text) {
        if (!text) return 'en';
        if (KOREAN_REGEX.test(text)) return 'ko';
        if (VIETNAMESE_REGEX.test(text)) return 'vi';
        return 'en';
    }

    getTranslatedObject(originalText) {
        if (!originalText || !originalText.trim()) {
            return { ko: '', en: '', vi: '' };
        }
        
        const text = originalText.trim();

        // 1. Check cache
        if (this.cache[text]) {
            return this.cache[text];
        }

        // 2. Cache miss -> Add to TODO list
        this.todoList.add(text);
        
        // Return original text as placeholder to avoid breaking flow immediately,
        // but we will catch this later using hasMissingTranslations()
        const sourceLang = this.detectLanguage(text);
        return {
            ko: sourceLang === 'ko' ? text : '',
            en: sourceLang === 'en' ? text : '',
            vi: sourceLang === 'vi' ? text : ''
        };
    }

    hasMissingTranslations() {
        return this.todoList.size > 0;
    }
}

