import {
    createConnection,
    ProposedFeatures,
    TextDocuments,
    TextDocument,
    Diagnostic,
    DiagnosticSeverity,
    DidChangeConfigurationParams,
    Position
} from 'vscode-languageserver';

import { basename } from 'path';

import { ExampleConfiguration, Severity, RuleKeys } from './configuration';

require('./linter');

let conn = createConnection(ProposedFeatures.all);
let docs = new TextDocuments();
let conf: ExampleConfiguration | undefined = undefined;

conn.onInitialize(() => {
    return {
        capabilities: {
            textDocumentSync: docs.syncKind
        }
    };
});

function GetRuleKey(code: string): RuleKeys | undefined {
    switch (code) {
        case 'WARNING.TEXT_SIZES_SHOULD_BE_EQUAL':
            return RuleKeys.WarningTextSizesShouldBeEqual;
        case 'WARNING.INVALID_BUTTON_SIZE':
            return RuleKeys.WarningInvalidButtonSize;
        case 'WARNING.INVALID_BUTTON_POSITION':
            return RuleKeys.WarningInvalidButtonPosition;
        case 'WARNING.INVALID_PLACEHOLDER_SIZE':
            return RuleKeys.WarningInvalidPlaceholderSize;
        case 'TEXT.SEVERAL_H1':
            return RuleKeys.TextSeveralH1;
        case 'TEXT.INVALID_H2_POSITION':
            return RuleKeys.TextInvalidH2Position;
        case 'TEXT.INVALID_H3_POSITION':
            return RuleKeys.TextInvalidH3Position;
        case 'GRID.TOO_MUCH_MARKETING_BLOCKS':
            return RuleKeys.GridTooMuchMarketingBlocks;
        default:
            return undefined;
    }
}

function GetSeverity(code: string): DiagnosticSeverity | undefined {
    const key: RuleKeys | undefined = GetRuleKey(code);

    if (!conf || !conf.severity || !key) {
        return undefined;
    }

    const severity: Severity = conf.severity[key];

    switch (severity) {
        case Severity.Error:
            return DiagnosticSeverity.Error;
        case Severity.Warning:
            return DiagnosticSeverity.Warning;
        case Severity.Information:
            return DiagnosticSeverity.Information;
        case Severity.Hint:
            return DiagnosticSeverity.Hint;
        default:
            return undefined;
    }
}

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
    const source = basename(textDocument.uri);
    const json = textDocument.getText();

    const toPosition = (point: Linter.ProblemLocationPoint): Position => {
        return {
            line: point.line - 1,
            character: point.column - 1
        };
    };

    const diagnostics: Diagnostic[] = lint(
        json,
    ).reduce(
        (
            list: Diagnostic[],
            problem: Linter.LinterProblem,
        ): Diagnostic[] => {
            const severity = GetSeverity(problem.code);

            if (severity) {
                const message = problem.error;
                const { start, end } = problem.location;

                let diagnostic: Diagnostic = {
                    range: {
                        start: toPosition(start),
                        end: toPosition(end)
                    },
                    severity,
                    message,
                    source
                };

                list.push(diagnostic);
            }

            return list;
        },
        []
    );

    conn.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

async function validateAll() {
    for (const document of docs.all()) {
        await validateTextDocument(document);
    }
}

docs.onDidChangeContent(change => {
    validateTextDocument(change.document);
});

conn.onDidChangeConfiguration(({ settings }: DidChangeConfigurationParams) => {
    conf = settings.example;
    validateAll();
});

docs.listen(conn);
conn.listen();
