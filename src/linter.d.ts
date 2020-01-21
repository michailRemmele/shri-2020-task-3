declare namespace Linter {
  export interface ProblemLocationPoint {
    column: number;
    line: number;
  }

  export interface ProblemLocation {
    start: ProblemLocationPoint;
    end: ProblemLocationPoint;
  }

  export interface LinterProblem {
    code: string;
    error: string;
    location: ProblemLocation;
  }
}

declare function lint(json: string): Linter.LinterProblem[];