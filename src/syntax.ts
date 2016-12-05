
export abstract class Syntax {
	public abstract getChildren(): Syntax[];

	public getStartPos(): number {
		if (this instanceof Token) {
			return this.startPos;
		}

		var children = this.getChildren();
		return children[0].getStartPos();
	}

	public getEndPos(): number {
		if (this instanceof Token) {
			return this.endPos;
		}

		var children = this.getChildren();
		return children[children.length - 1].getEndPos();
	}

	public toString(): string {
		if (this instanceof Token) {
			return this.text;
		}
		return this.getChildren().map(c => c.toString()).join(" ");
	}

	public setParents() {
		for (var c of this.getChildren()) {
			c.parent = this;
			c.setParents();
		}
	}

	public parent: Syntax;
}

export enum TokenKind {
	FatArrow,
	SmallArrow,
	Dot,
	Lambda,
	OpeningParen,
	ClosingParen,
	Semicolon,
	Equals,
	WS,
	Comment,
	Identifier,
	Invalid,
	Missing
}

export class Token<Kind> extends Syntax {
	public kind: Kind;
	public startPos: number;
	public endPos: number;
	public text: string;

	public getChildren(): Syntax[] { return []; }

	public clone(): Token<Kind> {
		const r = new Token<Kind>();
		r.text = this.text;
		r.kind = this.kind;
		return r;
	}
}

export class SyntaxArray<T extends Syntax> extends Syntax {
	public nodes: T[] = [];

	public getChildren(): Syntax[] { return this.nodes; }
}

export class LambdaDocument extends Syntax {
	public members: SyntaxArray<DocumentMember>;

	public getChildren(): Syntax[] { return [this.members]; }
}

export abstract class DocumentMember extends Syntax {
	private _documentMemberMarker: number;
}

// term;
export class TermDocumentMember extends DocumentMember {
	public term: Term;
	public semicolon: Token<TokenKind.Semicolon>;

	public getChildren(): Syntax[] { return [this.term, this.semicolon]; }
}

// name = term;
export class DefinitionMember extends DocumentMember {
	public name: Token<TokenKind.Identifier>;
	public equals: Token<TokenKind.Equals>;
	public term: Term;
	public semicolon: Token<TokenKind.Semicolon>;

	public getChildren(): Syntax[] { return [this.name, this.equals, this.term, this.semicolon]; }
}

export abstract class Term extends Syntax {
	private _termMarker: any;
}

// (term)
export class ParenthesizedTerm extends Term {
	public openingParen: Token<TokenKind.OpeningParen>;
	public term: Term;
	public closingParen: Token<TokenKind.ClosingParen>;

	public getChildren(): Syntax[] { return [this.openingParen, this.term, this.closingParen]; }
}


// identifier
export class Variable extends Term {
	public identifier: Token<TokenKind.Identifier>;

	public getChildren(): Syntax[] { return [this.identifier]; }
}

export class VariableDeclaration extends Syntax {
	public variable: Token<TokenKind.Identifier>;

	public getChildren(): Syntax[] { return [this.variable]; }
}

export abstract class Abstraction extends Term {
	public variableDeclaration: VariableDeclaration;
	public term: Term;
}

// variable => term
export class ArrowAbstraction extends Abstraction {
	public arrow: Token<TokenKind.FatArrow | TokenKind.SmallArrow>;

	public getChildren(): Syntax[] { return [this.variableDeclaration, this.arrow, this.term]; }
}

// variable => term
export class LambdaAbstraction extends Abstraction {
	public lambda: Token<TokenKind.Lambda>;
	public dot: Token<TokenKind.Dot>;

	public getChildren(): Syntax[] { return [this.lambda, this.variableDeclaration, this.dot, this.term]; }
}


// functionTerm argumentTerm
export class Application extends Term {
	public functionTerm: Term;
	public argumentTerm: Term;

	public getChildren(): Syntax[] { return [this.functionTerm, this.argumentTerm]; }
}

export class MissingTerm extends Term {
	public missingToken: Token<TokenKind.Missing>;

	public getChildren(): Syntax[] { return []; }
}

