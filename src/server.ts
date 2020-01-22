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

import { ExampleConfiguration, Severity, RuleKeys, RuleGroups } from './configuration';

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

function GetSeverity(code: string): DiagnosticSeverity | undefined {
    if (!conf || !conf.severity) {
        return undefined;
    }

    const splitCode = code.split('.');
    const group: RuleGroups = splitCode[0] as RuleGroups;
    const key: RuleKeys = splitCode[1] as RuleKeys;
    const severity: Severity = conf.severity[group][key];

    switch (severity) {
        case Severity.Error:
            return DiagnosticSeverity.Information;
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
