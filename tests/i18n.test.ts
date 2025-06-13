import { flattenKeys, loadResources } from "@/i18n/i18n.resources";
import { expect, mock, test } from "bun:test";
import { Project, SyntaxKind } from 'ts-morph';
import fs from "fs";
import { glob } from "glob";
import yaml from "js-yaml";
import path from "path";

function collectAllUsedKeys(): string[] {
    let ret: string[] = [];
    mock('next-i18next', () => ({
        useTranslation: () => ({
            t: (key: string, ...args: any[]) => {
                ret.push(key || "");
            },
            i18n: {
                changeLanguage() {
                }
            },
        }),
    }));

    // Get all .ts files in the "app" folder recursively
    const allAppFiles = glob.sync('src/app/**/*.ts*');
    // Loop through and require each file
    allAppFiles.forEach((file) => {
        const resolvedPath = path.resolve(file);
        import(resolvedPath).then(module => {
            console.log(file, module)
            const defaultExport = module.default;
            if (typeof defaultExport == "function") {
                try {
                    // const jsx = defaultExport(new Promise<any>(resolve=> resolve({any:2})));
                } catch {

                }
            } else {
            }
        }).catch(error => {

        });
    });

    return ret.filter(x => x != "");
}

interface ExtractedKey {
    key: string;
    file: string;
    line: number;
    column: number;
}

function extractI18nKeys(sourceDir: string): ExtractedKey[] {
    const project = new Project();
    const extractedKeys: ExtractedKey[] = [];

    // Add source files to project
    project.addSourceFilesAtPaths(`${sourceDir}/**/*.{ts,tsx,js,jsx}`);

    const sourceFiles = project.getSourceFiles();

    sourceFiles.forEach(sourceFile => {
        const filePath = sourceFile.getFilePath();

        // Find all call expressions
        sourceFile.forEachDescendant(node => {
            if (node.getKind() === SyntaxKind.CallExpression) {
                const callExpr = node.asKind(SyntaxKind.CallExpression);
                if (!callExpr) {
                    return;
                }

                const expression = callExpr.getExpression();

                // Check if it's a 't' function call
                if (expression.getKind() === SyntaxKind.Identifier) {
                    const identifier = expression.asKind(SyntaxKind.Identifier);
                    if (identifier && identifier.getText() === 't') {
                        const args = callExpr.getArguments();
                        if (args.length > 0) {
                            if (args[0].getKind() === SyntaxKind.StringLiteral) {
                                const stringLiteral = args[0].asKind(SyntaxKind.StringLiteral);
                                if (stringLiteral) {
                                    const key = stringLiteral.getLiteralValue();
                                    const pos = stringLiteral.getStart();
                                    const lineAndColumn = sourceFile.getLineAndColumnAtPos(pos);

                                    extractedKeys.push({
                                        key,
                                        file: path.relative(process.cwd(), filePath),
                                        line: lineAndColumn.line,
                                        column: lineAndColumn.column
                                    });
                                }
                            } else if (args[0].getKind() === SyntaxKind.TemplateExpression ||
                                args[0].getKind() === SyntaxKind.NoSubstitutionTemplateLiteral) {
                                const element = args[0].asKind(SyntaxKind.TemplateExpression);
                                if (element) {
                                    const pos = element.getStart();
                                    const key = element.getText().substring(1, element.getText().length - 1);
                                    const lineAndColumn = sourceFile.getLineAndColumnAtPos(pos);

                                    const exKey = {
                                        key: key,
                                        file: path.relative(process.cwd(), filePath),
                                        line: lineAndColumn.line,
                                        column: lineAndColumn.column
                                    };
                                    extractedKeys.push(exKey);
                                }
                            } else if (args[0].getKind() === SyntaxKind.Identifier) {
                                const element = args[0].asKind(SyntaxKind.Identifier);
                                if (element) {
                                    const pos = element.getStart();
                                    const key = element.getText();
                                    const lineAndColumn = sourceFile.getLineAndColumnAtPos(pos);
                                    const exKey = {
                                        key: key,
                                        file: path.relative(process.cwd(), filePath),
                                        line: lineAndColumn.line,
                                        column: lineAndColumn.column
                                    };
                                    extractedKeys.push(exKey);
                                }
                            } else {
                                console.error("unknown kind", SyntaxKind[args[0].getKind()]);
                            }
                        }
                    }
                }
            }
        });
    });

    return extractedKeys;
}

const extractedKeys = extractI18nKeys('./src');
const usedKeys = extractedKeys.map(extracted => extracted.key);
// console.table(extractedKeys);

const defined_keys_per_translation: Record<string, string[]> = Object.fromEntries(
    // first, we extract all the resources
    Object.entries(
        loadResources((id: string) => {
            function loadYaml(filepath: string) {
                const absPath = path.resolve(filepath);
                const content = fs.readFileSync(absPath, "utf8");
                return yaml.load(content);
            }

            return (
                loadYaml(`src/config/locales/${id}.yaml`) as any
            ).translation;
        })
        // then we map each language and translation object
    ).map(([lang, translations]) => {
        // extract all the key hierarchy in a "a.b.c" = "value" scheme
        const flattened_keys = flattenKeys(translations);
        // then we extract just the keys
        const keys_list = Object.keys(flattened_keys);
        // and finally return a entry to get all the keys per language
        return [lang, keys_list];
    })
);

test('that each file is translated', () => {
    const sourceDir: string = "src"
    const AmountOfTInFiles = new Set();
    const project = new Project();

    // Add source files to project
    project.addSourceFilesAtPaths(`${sourceDir}/**/*.{ts,tsx,js,jsx}`);

    const sourceFiles = project.getSourceFiles();

    sourceFiles.forEach(sourceFile => {
        // Find all call expressions
        sourceFile.forEachDescendant(node => {
            if (node.getKind() === SyntaxKind.CallExpression) {
                const expression = node.asKind(SyntaxKind.CallExpression)?.getExpression();
                // Check if it's a 't' function call
                if (expression?.getKind() === SyntaxKind.Identifier) {
                    const identifier = expression.asKind(SyntaxKind.Identifier);
                    if (identifier && identifier.getText() === 't') {
                        AmountOfTInFiles.add(sourceFile.getFilePath());
                    }
                }
            }
        });
    });

    const excludes = [
        // folders
        "src/config",
        "src/lib",
        "src/app/api",
        "src/model",
        "src/app/layout",
        "src/app/zustand",
        // now individual
        "src/app/components/Button.tsx",
        "src/app/components/Loading.tsx",
        "src/app/components/LoadingSpinner.tsx",
        "src/app/WithSystemCheck.tsx",
        "src/app/admin/logout/",
        "src/app/admin/WithAuth.jsx",
        'src/app/components/FloatingIslandElement.tsx',
        'src/app/components/order/OrderQR.jsx',
    ];

    const tFileList = [...AmountOfTInFiles];
    for (const sourceFile of sourceFiles) {
        const filepath = sourceFile.getFilePath();
        // whole groups excluded
        if (excludes.some(exclude => filepath.indexOf(exclude) > 0)) {
            continue;
        }

        if (!tFileList.includes(filepath)) {
            console.error("- ❌ could not find t() in", path.relative(path.join(sourceDir, ".."), filepath));
        }
    }
});

test('that each translation has each key', () => {
    const allDefinedKeys = new Set(
        Object.values(defined_keys_per_translation).flat()
    );

    let flaws = [];

    for (const [lang, keys] of Object.entries(defined_keys_per_translation)) {
        for (const key of allDefinedKeys) {
            if (!keys.includes(key)) {
                flaws.push(`❌ key "${key}" is not present in translation "${lang}"`);
            }
        }
    }
    if (flaws.length > 0) {
        throw new Error(`Missing keys for translation:\n${flaws.map(f => "  - " + f).join("\n")}`);
    }
    expect(flaws).toBeEmpty();
});

test('that each key is present in the translations', () => {
    let flaws = [];
    for (const key of usedKeys) {
        for (const [lang, keys] of Object.entries(defined_keys_per_translation)) {
            if (!keys.includes(key)) {
                // Skip template keys if matching static key exists
                if (key.includes('${') && keys.some(k => k.startsWith(key.substring(0, key.indexOf('${'))))) {
                    continue;
                }
                flaws.push(`❌ key "${key}" is not present in translation "${lang}"`);
            }
        }
    }
    if (flaws.length > 0) {
        throw new Error(`Missing keys:\n${flaws.map(f => "  - " + f).join("\n")}`);
    }
    expect(flaws).toBeEmpty();
});

test('that no key is unused in the translations', () => {
    const allDefinedKeys = new Set(
        Object.values(defined_keys_per_translation).flat()
    );

    // Pre-compile regexes once - handle any variable name in ${}
    const templateRegexes = usedKeys.map(templateKey =>
        new RegExp('^' + templateKey
            .replace(/\./g, '\\.')
            .replace(/\$\{[^}]+\}/g, '[^.]+') + '$')
    );

    function is_special(definedKey: string): boolean {
        if (definedKey.endsWith("_plural") && usedKeys.includes(definedKey.substring(0, definedKey.length - "_plural".length))) {
            return true;
        }
        if (templateRegexes.some(regex => regex.test(definedKey))) {
            return true;
        }

        return false; // default does not match
    }

    let flaws = [];
    for (const key of allDefinedKeys) {
        if (!usedKeys.includes(key) && !is_special(key)) {
            const languages: string[] = Object.entries(defined_keys_per_translation)
                .filter(([_, keys]) => keys.includes(key))
                .map(([lang]) => lang);
            flaws.push(`❌ key "${key}" is unused, found in (${languages})`);
        }
    }
    if (flaws.length > 0) {
        throw new Error(`Unused keys:\n${flaws.map(f => "  - " + f).join("\n")}`);
    }
    expect(flaws).toBeEmpty();
});
