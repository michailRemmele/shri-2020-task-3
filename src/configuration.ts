export enum RuleKeys {
    WarningTextSizesShouldBeEqual = 'warningTextSizesShouldBeEqual',
    WarningInvalidButtonSize = 'warningInvalidButtonSize',
    WarningInvalidButtonPosition = 'warningInvalidButtonPosition',
    WarningInvalidPlaceholderSize = 'warningInvalidPlaceholderSize',
    TextSeveralH1 = 'textSeveralH1',
    TextInvalidH2Position = 'textInvalidH2Position',
    TextInvalidH3Position = 'textInvalidH3Position',
    GridTooMuchMarketingBlocks = 'gridTooMuchMarketingBlocks',
}

export enum Severity {
    Error = 'Error', 
    Warning = 'Warning', 
    Information = 'Information', 
    Hint = 'Hint', 
    None = 'None'
}

export interface SeverityConfiguration {
    [RuleKeys.WarningTextSizesShouldBeEqual]: Severity;
    [RuleKeys.WarningInvalidButtonSize]: Severity;
    [RuleKeys.WarningInvalidButtonPosition]: Severity;
    [RuleKeys.WarningInvalidPlaceholderSize]: Severity;
    [RuleKeys.TextSeveralH1]: Severity;
    [RuleKeys.TextInvalidH2Position]: Severity;
    [RuleKeys.TextInvalidH3Position]: Severity;
    [RuleKeys.GridTooMuchMarketingBlocks]: Severity;
}

export interface ExampleConfiguration {
    enable: boolean;
    severity: SeverityConfiguration;
}
