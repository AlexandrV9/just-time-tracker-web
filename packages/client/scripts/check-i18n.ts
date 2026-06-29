import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = join(ROOT, "src");
const LOCALES_DIR = join(ROOT, "public/locales");
const LOCALES = ["en", "ru", "zh"] as const;
const REFERENCE_LOCALE = "en";

const I18N_KEY_PREFIX_RE =
  /^(?:pages|features|widgets|common|nav|errors)(?:\.|$)/;

const CYRILLIC_RE = /[А-Яа-яЁё]/;

type ExtractResult = {
  staticKeys: Set<string>;
  dynamicPatterns: Set<string>;
  hardcodedCyrillic: { file: string; line: number; text: string }[];
};

const walkSourceFiles = (dir: string): string[] => {
  const files: string[] = [];

  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...walkSourceFiles(fullPath));
      continue;
    }

    if (/\.(ts|tsx)$/.test(entry)) {
      files.push(fullPath);
    }
  }

  return files;
};

const flattenTranslations = (
  value: unknown,
  prefix = "",
): Set<string> => {
  const keys = new Set<string>();

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return keys;
  }

  for (const [key, nested] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      flattenTranslations(nested, fullKey).forEach((item) => keys.add(item));
      continue;
    }

    keys.add(fullKey);
  }

  return keys;
};

const loadLocaleKeys = (locale: (typeof LOCALES)[number]) => {
  const filePath = join(LOCALES_DIR, locale, "translation.json");
  const json = JSON.parse(readFileSync(filePath, "utf-8")) as unknown;
  return flattenTranslations(json);
};

const extractLocaleVars = (content: string) => {
  const vars = new Map<string, string>();
  const re = /const\s+(\w+)\s*=\s*["']([^"']+)["']/g;

  for (const match of content.matchAll(re)) {
    const [, name, value] = match;
    if (I18N_KEY_PREFIX_RE.test(value)) {
      vars.set(name, value);
    }
  }

  return vars;
};

const collectBaseLocalePrefixes = (content: string) => {
  const prefixes = new Set<string>();

  for (const match of content.matchAll(/const\s+\w+\s*=\s*["']([^"']+)["']/g)) {
    prefixes.add(match[1]);
  }

  return prefixes;
};

const resolveTemplate = (template: string, vars: Map<string, string>) => {
  let resolved = template;

  for (const [name, value] of vars) {
    resolved = resolved.replaceAll(`\${${name}}`, value);
  }

  if (resolved.includes("${")) {
    return null;
  }

  return resolved;
};

const isTranslationKey = (key: string) => I18N_KEY_PREFIX_RE.test(key);

const extractFromFile = (filePath: string): ExtractResult => {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const vars = extractLocaleVars(content);
  const baseLocalePrefixes = collectBaseLocalePrefixes(content);
  const staticKeys = new Set<string>();
  const dynamicPatterns = new Set<string>();
  const hardcodedCyrillic: ExtractResult["hardcodedCyrillic"] = [];

  const addKey = (key: string) => {
    if (!isTranslationKey(key)) return;
    if (baseLocalePrefixes.has(key)) return;
    staticKeys.add(key);
  };

  for (const match of content.matchAll(/\b(?:i18n\.)?t\(\s*"([^"]+)"/g)) {
    addKey(match[1]);
  }

  for (const match of content.matchAll(/\b(?:i18n\.)?t\(\s*'([^']+)'/g)) {
    addKey(match[1]);
  }

  for (const match of content.matchAll(/\b(?:i18n\.)?t\(\s*`([^`]+)`/g)) {
    const resolved = resolveTemplate(match[1], vars);
    if (resolved) {
      addKey(resolved);
      continue;
    }

    if (match[1].includes("${")) {
      dynamicPatterns.add(match[1]);
    }
  }

  for (const match of content.matchAll(
    /(?:titleKey|bodyKey|labelKey)\s*:\s*["']([^"']+)["']/g,
  )) {
    addKey(match[1]);
  }

  lines.forEach((line, index) => {
    if (line.trim().startsWith("//") || line.includes("t(")) return;

    const jsxText = line.match(/>([^<{]+)</);
    if (!jsxText) return;

    const text = jsxText[1].trim();
    if (!text || !CYRILLIC_RE.test(text)) return;

    hardcodedCyrillic.push({
      file: relative(ROOT, filePath),
      line: index + 1,
      text,
    });
  });

  return { staticKeys, dynamicPatterns, hardcodedCyrillic };
};

const compareLocaleParity = (localeKeys: Map<string, Set<string>>) => {
  const reference = localeKeys.get(REFERENCE_LOCALE)!;
  const mismatches: string[] = [];

  for (const locale of LOCALES) {
    if (locale === REFERENCE_LOCALE) continue;

    const keys = localeKeys.get(locale)!;

    for (const key of reference) {
      if (!keys.has(key)) {
        mismatches.push(`[${locale}] missing key: ${key}`);
      }
    }

    for (const key of keys) {
      if (!reference.has(key)) {
        mismatches.push(`[${locale}] extra key vs ${REFERENCE_LOCALE}: ${key}`);
      }
    }
  }

  return mismatches;
};

const main = () => {
  const localeKeys = new Map(
    LOCALES.map((locale) => [locale, loadLocaleKeys(locale)] as const),
  );

  const usedKeys = new Set<string>();
  const dynamicPatterns = new Set<string>();
  const hardcodedCyrillic: ExtractResult["hardcodedCyrillic"] = [];

  for (const filePath of walkSourceFiles(SRC_DIR)) {
    const extracted = extractFromFile(filePath);
    extracted.staticKeys.forEach((key) => usedKeys.add(key));
    extracted.dynamicPatterns.forEach((pattern) => dynamicPatterns.add(pattern));
    hardcodedCyrillic.push(...extracted.hardcodedCyrillic);
  }

  const missingInLocales: string[] = [];
  for (const key of [...usedKeys].sort()) {
    for (const locale of LOCALES) {
      if (!localeKeys.get(locale)!.has(key)) {
        missingInLocales.push(`[${locale}] missing key used in code: ${key}`);
      }
    }
  }

  const localeParity = compareLocaleParity(localeKeys);

  let hasErrors = false;

  const printSection = (title: string, items: string[]) => {
    if (items.length === 0) return;

    hasErrors = true;
    console.error(`\n${title} (${items.length})`);
    for (const item of items) {
      console.error(`  - ${item}`);
    }
  };

  printSection("Missing translations", missingInLocales);
  printSection("Locale file parity issues", localeParity);
  printSection(
    "Possible hardcoded Cyrillic in JSX (not wrapped in t())",
    hardcodedCyrillic.map(
      ({ file, line, text }) => `${file}:${line} → "${text}"`,
    ),
  );

  if (dynamicPatterns.size > 0) {
    console.warn(
      `\nSkipped ${dynamicPatterns.size} dynamic t() pattern(s) (not checked statically).`,
    );
  }

  console.log(
    `\nChecked ${usedKeys.size} static key(s) across ${LOCALES.length} locale(s).`,
  );

  if (hasErrors) {
    process.exit(1);
  }

  console.log("i18n check passed.");
};

main();
