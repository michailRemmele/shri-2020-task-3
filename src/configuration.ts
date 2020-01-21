export enum RuleGroups {
    Warning = 'WARNING',
    Text = 'TEXT',
    Grid = 'GRID',
}

export enum RuleKeys {
    TextSizesShouldBeEqual = 'TEXT_SIZES_SHOULD_BE_EQUAL',
    InvalidButtonSize = 'INVALID_BUTTON_SIZE',
    InvalidButtonPosition = 'INVALID_BUTTON_POSITION',
    InvalidPlaceholderSize = 'INVALID_PLACEHOLDER_SIZE',
    SeveralH1 = 'SEVERAL_H1',
    InvalidH2Position = 'INVALID_H2_POSITION',
    InvalidH3Position = 'INVALID_H3_POSITION',
    TooMuchMarketingBlocks = 'TOO_MUCH_MARKETING_BLOCKS',
}

export enum Severity {
    Error = 'Error', 
    Warning = 'Warning', 
    Information = 'Information', 
    Hint = 'Hint', 
    None = 'None'
}

export interface SeverityConfiguration {
    [RuleGroups.Warning]: {
        [RuleKeys.TextSizesShouldBeEqual]: Severity;
        [RuleKeys.InvalidButtonSize]: Severity;
        [RuleKeys.InvalidButtonPosition]: Severity;
        [RuleKeys.InvalidPlaceholderSize]: Severity;
        [RuleKeys.SeveralH1]: Severity;
        [RuleKeys.InvalidH2Position]: Severity;
        [RuleKeys.InvalidH3Position]: Severity;
        [RuleKeys.TooMuchMarketingBlocks]: Severity;
    };
    [RuleGroups.Text]: {
        [RuleKeys.TextSizesShouldBeEqual]: Severity;
        [RuleKeys.InvalidButtonSize]: Severity;
        [RuleKeys.InvalidButtonPosition]: Severity;
        [RuleKeys.InvalidPlaceholderSize]: Severity;
        [RuleKeys.SeveralH1]: Severity;
        [RuleKeys.InvalidH2Position]: Severity;
        [RuleKeys.InvalidH3Position]: Severity;
        [RuleKeys.TooMuchMarketingBlocks]: Severity;
    };
    [RuleGroups.Grid]: {
        [RuleKeys.TextSizesShouldBeEqual]: Severity;
        [RuleKeys.InvalidButtonSize]: Severity;
        [RuleKeys.InvalidButtonPosition]: Severity;
        [RuleKeys.InvalidPlaceholderSize]: Severity;
        [RuleKeys.SeveralH1]: Severity;
        [RuleKeys.InvalidH2Position]: Severity;
        [RuleKeys.InvalidH3Position]: Severity;
        [RuleKeys.TooMuchMarketingBlocks]: Severity;
    };
}

export interface ExampleConfiguration {
    enable: boolean;
    severity: SeverityConfiguration;
}
