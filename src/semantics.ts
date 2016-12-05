
import * as s from "./syntax";

export function getDeclaration(v: s.Variable): s.VariableDeclaration|null {
	let t: s.Syntax = v;
	while (t instanceof s.Term) {
		if (t instanceof s.Abstraction) {
			if (t.variableDeclaration.variable.text === v.identifier.text)
				return t.variableDeclaration;
		}
		t = t.parent;
	}
	return null;
}

export function getUsages(v: s.VariableDeclaration): s.Variable[] {

}

export function getDeclaredVarsInScope(term: s.Term): s.VariableDeclaration[] {
	let result: s.VariableDeclaration[];
	if (term.parent instanceof s.Term) {
		result = getDeclaredVarsInScope(term.parent);
	}
	else {
		result = [];
	}

	if (term.parent instanceof s.Abstraction) {
		result.push(term.parent.variableDeclaration);
	}

	return result;
}

export function getAllRedexes(term: s.Term): s.Application[] {
	let r: s.Application[] = [];
	for (var c of term.getChildren()) {
		if (c instanceof s.Term)
			r.push(...getAllRedexes(c));
	}
	
	if (isRedex(term)) {
		r.push(term);
	}

	return r;
}

export interface Instantiation {
	variable: s.Variable;
	newValue: s.Term;
}

export function reduce(term: s.Term, redex: s.Application): { newTerm: s.Term, instantiations: Instantiation[] } {

	let instantiations: { variable: s.Variable, newValue: s.Term }[] = [];

	let newTerm = clone(term, t => {
		if (t === redex) {
			var redexFunc = skipParenthesizedTerm(redex.functionTerm) as s.Abstraction;
			return clone(redexFunc.term, t2 => {

				if ((t2 instanceof s.Variable) && getDeclaration(t2) === redexFunc.variableDeclaration) {
					var cloned = clone(redex.argumentTerm, t3 => t3);
					instantiations.push({ variable: t2, newValue: cloned });
					return cloned;
				}

				return t2;
			});
		}
		return t;
	});
	newTerm.setParents();

	return { newTerm, instantiations };
}

export function skipParenthesizedTerm(term: s.Term): s.Term {
	while (term instanceof s.ParenthesizedTerm) {
		term = term.term;
	}
	return term;
}

export function parentSkipParenthesizedTerm(term: s.Term): s.Term {
	while (term instanceof s.ParenthesizedTerm) {
		term = term.parent as s.Term;
	}
	return term;
}

export function isRedex(term: s.Term): term is s.Application {
	return term instanceof s.Application && skipParenthesizedTerm(term.functionTerm) instanceof s.Abstraction;
}

export function isRedexAbstraction(term: s.Term): term is s.Abstraction {
	if (!(term instanceof s.Abstraction)) return false;
	const parent = parentSkipParenthesizedTerm(term.parent as s.Term);
	return parent instanceof s.Application && skipParenthesizedTerm(parent.functionTerm) === term; 
}

export function clone(term: s.Term, f: (t: s.Term) => s.Term): s.Term {

	const term2 = f(term);
	if (term2 !== term) return term2;

	if (term instanceof s.Variable) {
		const v = new s.Variable();
		v.identifier = term.identifier.clone();
		return v;
	}
	else if (term instanceof s.LambdaAbstraction) {
		const t = new s.LambdaAbstraction();
		t.variableDeclaration = new s.VariableDeclaration();
		t.variableDeclaration.variable = term.variableDeclaration.variable.clone();
		t.lambda = term.lambda.clone();
		t.dot = term.dot.clone();
		t.term = clone(term.term, f);
		return t;
	}
	else if (term instanceof s.ArrowAbstraction) {
		const t = new s.ArrowAbstraction();
		t.variableDeclaration = new s.VariableDeclaration();
		t.variableDeclaration.variable = term.variableDeclaration.variable.clone();
		t.arrow = term.arrow.clone();
		t.term = clone(term.term, f);
		return t;
	}
	else if (term instanceof s.Application) {
		const t = new s.Application();
		t.argumentTerm = clone(term.argumentTerm, f);
		t.functionTerm = clone(term.functionTerm, f);
		return t;
	}
	else if (term instanceof s.ParenthesizedTerm) {
		const t = new s.ParenthesizedTerm();
		t.openingParen = term.openingParen.clone();
		t.term = clone(term.term, f);
		t.closingParen = term.closingParen.clone();
		return t; 
	}

	throw "unsupported.";
}

/*public getAllFreeVarsIn(term: s.Term): s.Variable[] {


}*/
