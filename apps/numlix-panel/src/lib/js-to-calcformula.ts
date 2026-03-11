/**
 * Transpiles a JavaScript `calculate()` function body into CalcHub formula syntax
 * for each result key.
 *
 * Strategy:
 * 1. Extract assignments like `const foo = <expr>` from the function body.
 * 2. Inline intermediate variables so each result expression is self-contained.
 * 3. Apply syntax transforms: Math.round → round, Math.ceil → ceil, etc.
 * 4. Replace {key} references for input fields.
 */

// JS Math functions → CalcHub builtins
const MATH_TRANSFORMS: [RegExp, string][] = [
  [/Math\.round\(([^)]+)\)/g, "round($1, 0)"],
  [/Math\.ceil\(([^)]+)\)/g, "ceil($1)"],
  [/Math\.floor\(([^)]+)\)/g, "floor($1)"],
  [/Math\.abs\(([^)]+)\)/g, "abs($1)"],
  [/Math\.sqrt\(([^)]+)\)/g, "sqrt($1)"],
  [/Math\.pow\(([^,]+),\s*([^)]+)\)/g, "pow($1, $2)"],
  [/Math\.PI/g, "3.14159"],
  [/Math\.min\(([^)]+)\)/g, "min($1)"],
  [/Math\.max\(([^)]+)\)/g, "max($1)"],
];

/** Remove JS comments from a string */
function stripComments(src: string): string {
  return src
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Extract the body of the calculate function */
function extractFunctionBody(fn: Function): string {
  const src = fn.toString();
  // Find the opening brace
  const openBrace = src.indexOf("{");
  const closeBrace = src.lastIndexOf("}");
  if (openBrace === -1 || closeBrace === -1) return "";
  return src.slice(openBrace + 1, closeBrace);
}

/** Parse `const varName = expr;` or `let varName = expr;` declarations */
function parseDeclarations(body: string): Map<string, string> {
  const map = new Map<string, string>();
  // Match: const/let varName = <expr>;
  const declRe = /(?:const|let|var)\s+(\w+)\s*=\s*([^;]+);/g;
  let m: RegExpExecArray | null;
  while ((m = declRe.exec(body)) !== null) {
    map.set(m[1], m[2].trim());
  }
  return map;
}

/** Find the return statement and parse its object keys */
function parseReturnObject(body: string): Map<string, string> {
  const map = new Map<string, string>();

  // Find all return { ... } blocks (handles early returns too)
  // We collect the last (main) return statement
  const returnRe = /return\s*\{([^}]+)\}/g;
  let m: RegExpExecArray | null;
  let lastMatch: string | null = null;
  while ((m = returnRe.exec(body)) !== null) {
    lastMatch = m[1];
  }
  if (!lastMatch) return map;

  // Parse key: value pairs from the object
  // Handles: key, key: expr, key: expr, ...
  const parts = lastMatch.split(",").map(s => s.trim()).filter(Boolean);
  for (const part of parts) {
    const colonIdx = part.indexOf(":");
    if (colonIdx === -1) {
      // Shorthand: { foo } means foo: foo
      const key = part.trim();
      if (/^\w+$/.test(key)) map.set(key, key);
    } else {
      const key = part.slice(0, colonIdx).trim();
      const val = part.slice(colonIdx + 1).trim();
      if (/^\w+$/.test(key)) map.set(key, val);
    }
  }
  return map;
}

/**
 * Inline intermediate variables: replace references to declared vars with their expressions.
 * Iterates until no more substitutions happen (handles chains like: c = a + b; d = c * 2).
 */
function inlineVars(expr: string, decls: Map<string, string>): string {
  let prev = "";
  let current = expr;
  let iterations = 0;
  while (current !== prev && iterations < 10) {
    prev = current;
    for (const [varName, varExpr] of decls) {
      // Replace standalone variable references (not part of longer identifiers)
      const re = new RegExp(`\\b${varName}\\b`, "g");
      current = current.replace(re, `(${varExpr})`);
    }
    iterations++;
  }
  return current;
}

/** Apply Math.* → CalcHub function transforms */
function applyMathTransforms(expr: string): string {
  let result = expr;
  // Iteratively apply until stable (for nested Math.round(Math.round(...)))
  let prev = "";
  while (result !== prev) {
    prev = result;
    for (const [re, replacement] of MATH_TRANSFORMS) {
      result = result.replace(re, replacement);
    }
  }
  return result;
}

/** Wrap input field keys in {braces} */
function wrapInputKeys(expr: string, inputKeys: string[]): string {
  let result = expr;
  // Sort by length descending to avoid partial replacements
  const sorted = [...inputKeys].sort((a, b) => b.length - a.length);
  for (const key of sorted) {
    const re = new RegExp(`\\b${key}\\b`, "g");
    result = result.replace(re, `{${key}}`);
  }
  return result;
}

/** Remove double-wrapping: ({expr}) → (expr), and clean up excessive parens */
function cleanupParens(expr: string): string {
  let result = expr;
  let prev = "";
  while (result !== prev) {
    prev = result;
    // Remove ( (expr) ) → (expr) only when outer parens wrap exact inner parens
    result = result.replace(/\(\(([^()]+)\)\)/g, "($1)");
    // Remove leading/trailing parens wrapping the whole expression
    if (result.startsWith("(") && result.endsWith(")")) {
      // Check if these outer parens are balanced and wrapping everything
      let depth = 0;
      let allWrapped = true;
      for (let i = 0; i < result.length - 1; i++) {
        if (result[i] === "(") depth++;
        else if (result[i] === ")") depth--;
        if (depth === 0 && i < result.length - 1) { allWrapped = false; break; }
      }
      if (allWrapped) result = result.slice(1, -1);
    }
  }
  return result;
}

/** Simplify round(x * 100) / 100 → round(x, 2) pattern */
function simplifyRoundPatterns(expr: string): string {
  // round(expr * 100) / 100 → round(expr, 2)
  return expr
    .replace(/round\(([^,)]+)\s*\*\s*100,\s*0\)\s*\/\s*100/g, "round($1, 2)")
    .replace(/round\(([^,)]+)\s*\*\s*10000,\s*0\)\s*\/\s*100/g, "round($1, 2)")
    .replace(/round\(([^,)]+)\s*\*\s*10,\s*0\)\s*\/\s*10/g, "round($1, 1)");
}

/**
 * Main entry point.
 * Returns a map of resultKey → CalcHub formula string.
 */
export function transpileCalculateToFormulas(
  calculateFn: Function,
  inputKeys: string[]
): Map<string, string> {
  const body = stripComments(extractFunctionBody(calculateFn));
  const decls = parseDeclarations(body);
  const returnMap = parseReturnObject(body);
  const formulas = new Map<string, string>();

  for (const [resultKey, rawExpr] of returnMap) {
    let expr = rawExpr;

    // 1. Inline all intermediate variables
    expr = inlineVars(expr, decls);

    // 2. Apply Math.* transforms
    expr = applyMathTransforms(expr);

    // 3. Wrap input field keys in {braces}
    expr = wrapInputKeys(expr, inputKeys);

    // 4. Simplify common patterns
    expr = simplifyRoundPatterns(expr);

    // 5. Clean up parens
    expr = cleanupParens(expr);

    // 6. Final trim
    expr = expr.trim();

    formulas.set(resultKey, expr);
  }

  return formulas;
}
