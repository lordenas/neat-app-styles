export type PrimitiveValue = string | number | boolean | null;
export interface RuntimeObjectValue {
  [key: string]: RuntimeValue;
}
export type RuntimeValue = PrimitiveValue | RuntimeValue[] | RuntimeObjectValue;

export interface FormulaDslMeta {
  name?: string;
  description?: string;
}

export interface InputFieldDefinition {
  type: 'number' | 'string' | 'boolean';
  required?: boolean;
}

export type FormulaBinaryOperator =
  | '+'
  | '-'
  | '*'
  | '/'
  | '%'
  | '>'
  | '<'
  | '>='
  | '<='
  | '=='
  | '!='
  | '&&'
  | '||';

export type FormulaUnaryOperator = '-' | '!';

export interface LiteralExpressionNode {
  type: 'literal';
  value: PrimitiveValue;
}

export interface InputRefExpressionNode {
  type: 'input_ref';
  path: string;
}

export interface VarRefExpressionNode {
  type: 'var_ref';
  name: string;
}

export interface LookupExpressionNode {
  type: 'lookup';
  table: string;
  key: ExpressionNode;
  fallback?: ExpressionNode;
}

export interface UnaryExpressionNode {
  type: 'unary';
  op: FormulaUnaryOperator;
  arg: ExpressionNode;
}

export interface BinaryExpressionNode {
  type: 'binary';
  op: FormulaBinaryOperator;
  left: ExpressionNode;
  right: ExpressionNode;
}

export interface ConditionalExpressionNode {
  type: 'if';
  condition: ExpressionNode;
  then: ExpressionNode;
  else: ExpressionNode;
}

export interface FunctionExpressionNode {
  type: 'func';
  name: 'min' | 'max' | 'round' | 'abs' | 'clamp' | 'coalesce';
  args: ExpressionNode[];
}

export type ExpressionNode =
  | LiteralExpressionNode
  | InputRefExpressionNode
  | VarRefExpressionNode
  | LookupExpressionNode
  | UnaryExpressionNode
  | BinaryExpressionNode
  | ConditionalExpressionNode
  | FunctionExpressionNode;

export interface VariableNode {
  name: string;
  expr: ExpressionNode;
}

export interface OutputNode {
  key: string;
  expr: ExpressionNode;
}

export interface FormulaDslDefinition {
  version: string;
  inputs: Record<string, InputFieldDefinition>;
  variables: VariableNode[];
  lookups: Record<string, Record<string, PrimitiveValue>>;
  outputs: OutputNode[];
  meta?: FormulaDslMeta;
}

export interface FormulaDslExecutionResult {
  outputs: Record<string, RuntimeValue>;
  variablesSnapshot?: Record<string, RuntimeValue>;
  engineMeta: {
    version: string;
    traceEnabled: boolean;
  };
}
