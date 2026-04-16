const CHINESE_DIGITS = {
    零: 0,
    〇: 0,
    一: 1,
    二: 2,
    两: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9
};
function parseChineseQuestionNumber(raw) {
    const normalized = raw
        .replace(/[题号第\s()（）【】、.．-]/g, '')
        .replaceAll('[', '')
        .replaceAll(']', '');
    if (!normalized || !/^[零〇一二两三四五六七八九十百]+$/.test(normalized)) {
        return null;
    }
    let result = 0;
    let current = 0;
    for (const char of normalized) {
        if (char === '百') {
            result += (current || 1) * 100;
            current = 0;
            continue;
        }
        if (char === '十') {
            result += (current || 1) * 10;
            current = 0;
            continue;
        }
        current = CHINESE_DIGITS[char] ?? current;
    }
    const value = result + current;
    return value > 0 ? value : null;
}
function formatQuestionNo(no, fallback) {
    const target = no && no > 0 ? no : fallback && fallback > 0 ? fallback : null;
    return target ? `第${target}题` : '';
}
/**
 * 格式化/标准化题目编号 (例如: 1 -> 第1题, 一 -> 第1题)
 */
export function normalizeQuestionNo(value, fallback) {
    const raw = String(value ?? '').trim();
    if (!raw) {
        return formatQuestionNo(null, fallback);
    }
    const arabicMatch = raw.match(/\d+/);
    if (arabicMatch) {
        return formatQuestionNo(Number(arabicMatch[0]), fallback);
    }
    const chineseValue = parseChineseQuestionNumber(raw);
    if (chineseValue) {
        return formatQuestionNo(chineseValue, fallback);
    }
    return formatQuestionNo(null, fallback) || raw;
}
//# sourceMappingURL=exam-utils.js.map