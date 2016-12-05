import { LexerFactory, Lexer, TokenWithPosAndLen } from "typed-lexer";
import { TokenKind, Syntax } from "./syntax";
import * as Syntaxes from "./syntax";

export function createLexerFor(input: string) {
	return new LambdaLexerFactory().getLexerFor(input); 
}

class LambdaLexerFactory extends LexerFactory<TokenKind, {}> {
	constructor() {
		super();
		
		this.addSimpleRule("=>", TokenKind.FatArrow);
		this.addSimpleRule("->", TokenKind.SmallArrow);
		this.addSimpleRule("\\", TokenKind.Lambda);
		this.addSimpleRule(".", TokenKind.Dot);
		this.addSimpleRule("(", TokenKind.OpeningParen);
		this.addSimpleRule(")", TokenKind.ClosingParen);
		this.addSimpleRule(";", TokenKind.Semicolon);
		this.addSimpleRule("=", TokenKind.Equals);
		this.addSimpleRule(/\/\*.*\*\//, TokenKind.Comment);
		this.addSimpleRule(/\/\/.*\n/, TokenKind.Comment);
		
		this.addSimpleRule(/[a-zA-Z_][a-zA-Z0-9_]*/, TokenKind.Identifier);
		this.addSimpleRule(/\s+/, TokenKind.WS);
 
		this.addSimpleRule(/./, TokenKind.Invalid);
	}
}

type L = Lexer<TokenKind, {}>;

interface LogEntry {
	startPos: number;
	endPos: number;
	message: string;
}

export class Logger {
	public entries: LogEntry[] = [];
	public logError(msg: string, startPos: number, endPos: number) {
		this.entries.push({ message: msg, startPos: startPos, endPos: endPos });
	}
}

function getLexerPos(lexer: L): number {
	return (lexer as any).pos;
}

export class Parser {

	public static parseDocument(input: string, logger: Logger): Syntaxes.LambdaDocument {
		const lexer = createLexerFor(input);
		lexer.next();
		return new Parser(input).parseDocumentLexer(lexer, logger);
	}

	constructor(private input: string) {}


	private parseDocumentLexer(lexer: L, logger: Logger): Syntaxes.LambdaDocument {
		
		var nodes = new Syntaxes.SyntaxArray<Syntaxes.DocumentMember>();

		while (true) {

			this.skipWs(lexer);
			if (lexer.getCurToken() === undefined) break;

			let m: Syntaxes.DocumentMember|false = this.tryReadDefinitionMember(lexer, logger);
			if (m === false)
				m = this.readTermMember(lexer, logger);

			nodes.nodes.push(m);
		}

		const lambdaDoc = new Syntaxes.LambdaDocument();
		lambdaDoc.members = nodes;

		lambdaDoc.setParents();

		return lambdaDoc;
	}

	private readTermMember(lexer: L, logger: Logger): Syntaxes.TermDocumentMember {
		const term = this.parseTerm(lexer, logger);

		if (term instanceof Syntaxes.MissingTerm) {
			const cur = lexer.getCur();
			logger.logError("Unexpected token.", cur.startPos, cur.startPos + cur.length);
			lexer.next();
		}

		this.skipWs(lexer);

		let semicolonToken: TokenWithPosAndLen<TokenKind.Semicolon>|number = getLexerPos(lexer);
		if (lexer.getCurToken() === TokenKind.Semicolon) {
			semicolonToken = lexer.getCur() as TokenWithPosAndLen<TokenKind.Semicolon>;
			lexer.next();
		}
		else {
			logger.logError("Semicolon is missing.", semicolonToken, semicolonToken);
		}
		const member = new Syntaxes.TermDocumentMember();
		member.term = term;
		member.semicolon = this.toToken(semicolonToken);
		return member;
	}

	private tryReadDefinitionMember(lexer: L, logger: Logger): Syntaxes.DefinitionMember|false {
		if (lexer.getCurToken() === TokenKind.Identifier) {

			const stack: TokenWithPosAndLen<TokenKind>[] = [];
			const identifier = lexer.getCur() as TokenWithPosAndLen<TokenKind.Identifier>;
			stack.push(identifier);
			lexer.next();

			stack.push(...this.skipWs(lexer));

			if (lexer.getCurToken() === TokenKind.Equals) {
				const eqToken = lexer.getCur() as TokenWithPosAndLen<TokenKind.Equals>;
				lexer.next();
				this.skipWs(lexer);
				const term = this.parseTerm(lexer, logger);
				this.skipWs(lexer);

				let semicolonToken: TokenWithPosAndLen<TokenKind.Semicolon>|number = getLexerPos(lexer);
				if (lexer.getCurToken() === TokenKind.Semicolon) {
					semicolonToken = lexer.getCur() as TokenWithPosAndLen<TokenKind.Semicolon>;
					lexer.next();
				}
				else {
					logger.logError("Semicolon is missing.", semicolonToken, semicolonToken);
				}
				
				const member = new Syntaxes.DefinitionMember();
				member.equals = this.toToken(eqToken);
				member.name = this.toToken(identifier);
				
				member.term = term;
				member.semicolon = this.toToken(semicolonToken);
				return member;
			}
			else {
				if (lexer.getCur() !== undefined)
					stack.push(lexer.getCur());
				var first = stack.splice(0, 1)[0];
				lexer.getRestrained().unshift(...stack);
				(lexer as any).cur = first;
				return false;
			}
		}

		return false;
	}


	private toToken<T>(token: TokenWithPosAndLen<T>|number): Syntaxes.Token<T> {
		if (typeof token === "number")
		{
			const result = new Syntaxes.Token<T>();
			result.kind = TokenKind.Missing as any as T;
			result.startPos = token;
			result.endPos = token;
			result.text = "";
			return result;
		}

		const result = new Syntaxes.Token<T>();
		result.kind = token.token;
		result.startPos = token.startPos;
		result.endPos = token.startPos + token.length;
		result.text = this.input.substring(result.startPos, result.endPos);

		return result;
	}

	private skipWs(lexer: L): TokenWithPosAndLen<TokenKind.WS | TokenKind.Comment>[] {
		const result: TokenWithPosAndLen<TokenKind.WS | TokenKind.Comment>[] = [];
		while (true) {
			const cur = lexer.getCurToken();
			if (cur !== TokenKind.WS && cur !== TokenKind.Comment)
				return result;
			result.push(lexer.getCur() as TokenWithPosAndLen<TokenKind.WS | TokenKind.Comment>);
			lexer.next();
		}
	}
	
	private parseTerm(lexer: L, logger: Logger): Syntaxes.Term {
		let lastTerm: Syntaxes.Term|undefined = undefined;

		while (true) {
			var term = this.parseTerm2(lexer, logger);

			if (term === undefined)
				break;
			
			if (lastTerm === undefined) {
				lastTerm = term;
			}
			else {
				const app = new Syntaxes.Application();
				app.functionTerm = lastTerm;
				app.argumentTerm = term;
				lastTerm = app;
			}
		}

		if (lastTerm === undefined) {
			const r = new Syntaxes.MissingTerm();
			logger.logError("Term is missing.", getLexerPos(lexer), getLexerPos(lexer));
			r.missingToken = this.toToken(getLexerPos(lexer)) as Syntaxes.Token<TokenKind.Missing>;
			return r;
		}

		return lastTerm;
	}

	private parseTerm2(lexer: L, logger: Logger): Syntaxes.Term|undefined {
		this.skipWs(lexer);
		const kind = lexer.getCurToken();
		
		switch (kind) {
			case TokenKind.Lambda:
				const lambda = lexer.getCur() as TokenWithPosAndLen<TokenKind.Lambda>;
				lexer.next();

				this.skipWs(lexer);

				const nextToken = lexer.getCurToken();
				if (nextToken != TokenKind.Identifier)
					return undefined;

				const varName = lexer.getCur() as TokenWithPosAndLen<TokenKind.Identifier>;
				
				lexer.next();
				this.skipWs(lexer);

				const nextToken2 = lexer.getCurToken();
				if (nextToken2 != TokenKind.Dot)
					return undefined;

				const dotToken = lexer.getCur() as TokenWithPosAndLen<TokenKind.Dot>;

				lexer.next();
				this.skipWs(lexer);
				
				const innerTerm = this.parseTerm(lexer, logger);

				const varDecl = new Syntaxes.VariableDeclaration();
				varDecl.variable = this.toToken(varName);

				const abstraction = new Syntaxes.LambdaAbstraction();
				abstraction.variableDeclaration = varDecl;
				abstraction.lambda = this.toToken(lambda);
				abstraction.dot = this.toToken(dotToken);
				abstraction.term = innerTerm;
				return abstraction;
				
			case TokenKind.Identifier:
				const identifierToken = lexer.getCur() as TokenWithPosAndLen<TokenKind.Identifier>;
				const identifier = this.toToken(identifierToken);
				lexer.next();

				this.skipWs(lexer);
				const kind2 = lexer.getCurToken(); 
				if (kind2 === TokenKind.FatArrow || kind2 === TokenKind.SmallArrow) {
					const arrowToken = lexer.getCur() as TokenWithPosAndLen<TokenKind.FatArrow | TokenKind.SmallArrow>
					lexer.next();
					const innerTerm = this.parseTerm(lexer, logger);
					const abstraction = new Syntaxes.ArrowAbstraction();

					const varDecl = new Syntaxes.VariableDeclaration();
					varDecl.variable = identifier;

					abstraction.variableDeclaration = varDecl;
					abstraction.arrow = this.toToken(arrowToken);
					abstraction.term = innerTerm;
					return abstraction;
				}

				const v = new Syntaxes.Variable();
				v.identifier = identifier;
				return v;

			case TokenKind.OpeningParen: {
				const openParenToken = lexer.getCur() as TokenWithPosAndLen<TokenKind.OpeningParen>;
				lexer.next();
				const innerTerm = this.parseTerm(lexer, logger);
				let closeParenToken: TokenWithPosAndLen<TokenKind.ClosingParen>|number = getLexerPos(lexer);
				if (lexer.getCur().token === TokenKind.ClosingParen) {
					closeParenToken = lexer.getCur() as TokenWithPosAndLen<TokenKind.ClosingParen>;
					lexer.next();
				}
				else {
					logger.logError("')' is missing.", closeParenToken, closeParenToken);
				}
				var term = new Syntaxes.ParenthesizedTerm();
				term.openingParen = this.toToken(openParenToken);
				term.term = innerTerm;
				term.closingParen = this.toToken(closeParenToken);
				return term;
			}
		}

		return undefined;
	}
}
