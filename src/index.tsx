import { Syntax } from './syntax';
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as cn from "classnames";
import { observable, computed, autorun } from "mobx";
import { observer } from "mobx-react";
import DevTools from 'mobx-react-devtools'; 
import "./style.scss";
import { Parser, Logger } from "./parser";
import * as Syntaxes from "./syntax";
import MonacoEditor from 'react-monaco-editor';
import * as Analysis from "./semantics";

type ICodeEditor = monaco.editor.ICodeEditor;

class Model {
	@observable windowWidth: number;
	@observable windowHeight: number;
}

// https://hediet.de/screenshots/2016_11_23_20_29_46_Webpack_App.png

var model = new Model();
model.windowWidth = window.innerWidth;
model.windowHeight = window.innerHeight;

window.onresize = function() {
	model.windowWidth = window.innerWidth;
	model.windowHeight = window.innerHeight;
};



function createViewFor(t: Syntaxes.Term, termContext: TermEvaluationViewContext): JSX.Element {
	if (t instanceof Syntaxes.Abstraction) return (<AbstractionView term={t} termContext={termContext} />);
	if (t instanceof Syntaxes.Application) return (<ApplicationView term={t} termContext={termContext} />);
	if (t instanceof Syntaxes.Variable) return (<VariableView term={t} termContext={termContext} />);
	if (t instanceof Syntaxes.ParenthesizedTerm) return (<ParenthesizedTermView term={t} termContext={termContext} />);

	throw "";
}

@observer
class VariableView extends React.Component<{ term: Syntaxes.Variable, termContext: TermEvaluationViewContext }, {}> {
	public render() {
		const wasArg = this.props.termContext.lastAnalysisResult && this.props.termContext.lastAnalysisResult.instantiations.some(i => i.newValue === this.props.term); 
		const isRedexArg = this.props.termContext.currentRedex && this.props.termContext.currentRedex.argumentTerm === this.props.term;
		const isRedexVar = this.props.termContext.currentAnalysisResult && this.props.termContext.currentAnalysisResult.instantiations.some(i => i.variable === this.props.term);
		return (<span className={cn("term", "variable", isRedexVar && "redexVar", isRedexArg && "redexArg", wasArg && "wasArg")}>{this.props.term.identifier.text}</span>);
	}
}

@observer
class ParenthesizedTermView extends React.Component<{ term: Syntaxes.ParenthesizedTerm, termContext: TermEvaluationViewContext }, {}> {
	public render() { 
		const wasArg = this.props.termContext.lastAnalysisResult && this.props.termContext.lastAnalysisResult.instantiations.some(i => i.newValue === this.props.term); 
		const isRedexArg = this.props.termContext.currentRedex && this.props.termContext.currentRedex.argumentTerm === this.props.term;
		return (<span className={cn("term", "parenthesizedTerm", isRedexArg && "redexArg", wasArg && "wasArg")}>({createViewFor(this.props.term.term, this.props.termContext)})</span>); 
	}
}

@observer
class ApplicationView extends React.Component<{ term: Syntaxes.Application, termContext: TermEvaluationViewContext }, {}> {
	public render() { 
		const wasArg = this.props.termContext.lastAnalysisResult && this.props.termContext.lastAnalysisResult.instantiations.some(i => i.newValue === this.props.term); 
		const isRedexArg = this.props.termContext.currentRedex && this.props.termContext.currentRedex.argumentTerm === this.props.term;
		return (<span className={cn("term", "application", Analysis.isRedex(this.props.term) && "redex", isRedexArg && "redexArg", wasArg && "wasArg")}>
				{createViewFor(this.props.term.functionTerm, this.props.termContext)}
				{createViewFor(this.props.term.argumentTerm, this.props.termContext)}
			</span>); 
		}
}

@observer
class AbstractionView extends React.Component<{ term: Syntaxes.Abstraction, termContext: TermEvaluationViewContext }, {}> {

	private clicked() {
		if (Analysis.isRedexAbstraction(this.props.term)) {
			const parent = Analysis.parentSkipParenthesizedTerm(this.props.term.parent as Syntaxes.Term) as Syntaxes.Application;
			this.props.termContext.reduceRedex(parent);
		}
	}

	private mouseEnteredLeft(entered: boolean) {
		if (!entered) {
			this.props.termContext.selectedRedex = null;
			return;
		}

		if (Analysis.isRedexAbstraction(this.props.term)) {
			const parent = Analysis.parentSkipParenthesizedTerm(this.props.term.parent as Syntaxes.Term) as Syntaxes.Application;
			this.props.termContext.selectedRedex = parent;
		}
	}

	public render() { 
		const wasArg = this.props.termContext.lastAnalysisResult && this.props.termContext.lastAnalysisResult.instantiations.some(i => i.newValue === this.props.term); 
		const isRedexArg = this.props.termContext.currentRedex && this.props.termContext.currentRedex.argumentTerm === this.props.term;
		const isCurrentRedex = this.props.termContext.currentRedex && Analysis.skipParenthesizedTerm(this.props.termContext.currentRedex.functionTerm) == this.props.term;
		const isRedexAbstraction = Analysis.isRedexAbstraction(this.props.term);
		return (
			<span className={cn("term", "abstraction", isRedexAbstraction && "redex", isRedexArg && "redexArg", isCurrentRedex && "currentRedex", wasArg && "wasArg")} >
				<span className="variableAndArrow">
					<span className="declaration variable" onClick={() => this.clicked()} onMouseEnter={() => this.mouseEnteredLeft(true)} onMouseLeave={() => this.mouseEnteredLeft(false)}>{this.props.term.variableDeclaration.variable.text}</span>
					<span className="arrow"> ⟹ </span>
				</span> 
				{createViewFor(this.props.term.term, this.props.termContext)}
			</span>
		); 
	}
}

class TermEvaluationViewContext {
	constructor(private readonly view: EvaluationView, private readonly idx: number, private term: Syntaxes.Term, 
		public preselectedRedex: Syntaxes.Application|null, public preselectedAnalysisResult: { newTerm: Syntaxes.Term, instantiations: Analysis.Instantiation[] }|null,
		public lastAnalysisResult: { newTerm: Syntaxes.Term, instantiations: Analysis.Instantiation[] }|null) {}


	@observable selectedRedex: Syntaxes.Application|null;

	@computed get currentAnalysisResult(): { newTerm: Syntaxes.Term, instantiations: Analysis.Instantiation[] }|null {
		if (!this.selectedRedex) return this.preselectedAnalysisResult;

		return Analysis.reduce(this.term, this.selectedRedex);
	}

	@computed get currentRedex(): Syntaxes.Application|null {
		if (this.selectedRedex) return this.selectedRedex;
		return this.preselectedRedex;
	}

	public reduceRedex(redex: Syntaxes.Application) {
		this.view.reduceRedex(redex, this.idx);
	}
}

@observer
class EvaluationView extends React.Component<{ term: Syntaxes.Term, onHeightUpdate?: () => void, onRemove: () => void }, {}> {
	@observable private terms: { term: Syntaxes.Term, selectedRedex: Syntaxes.Application|null, step: { newTerm: Syntaxes.Term, instantiations: Analysis.Instantiation[] }|null }[] = [];

	constructor(props: any) { 
		super(props);
		this.terms.push({ term: this.props.term, selectedRedex: null, step: null });
	}

	public reduceRedex(redex: Syntaxes.Application, termIdx: number) {
		this.terms.length = termIdx + 1;

		const t = this.terms[termIdx];

		const { instantiations, newTerm } = Analysis.reduce(t.term, redex);
		t.selectedRedex = redex;
		t.step = { instantiations, newTerm };

		this.terms.push({ term: newTerm, selectedRedex: null, step: null });
	}

	private componentDidMount() {
		if (this.props.onHeightUpdate) this.props.onHeightUpdate();
	}

	private componentDidUpdate() {
		if (this.props.onHeightUpdate) this.props.onHeightUpdate();
	}

	private removeStep(idx: number) {
		if (idx === 0) this.props.onRemove();
		this.terms.splice(idx);
	}

	public render() {
		return (
			<div className="evaluationView">
				{this.terms.map((t, idx) => {
						const prevStep = idx == 0 ? null : this.terms[idx - 1].step;
						return (
							<div className="evaluationStep">
								<button onClick={() => this.removeStep(idx)}>X</button> 
								{ createViewFor(t.term, new TermEvaluationViewContext(this, idx, t.term, t.selectedRedex, t.step, prevStep )) }
							</div>
						);
					}
				)}
			</div>
		);
	}
}



class RunWidgetUI extends React.Component<{ term: Syntaxes.Term, editor: ICodeEditor }, {}> {
	public render() {
		return (
			<div className="run-widget" >
				<button onClick={() => this.onClick()}>Run</button>
			</div>
		);
	}

	private onClick() {
		var e = this.props.editor;
		var term = this.props.term;
		var pos = e.getModel().getPositionAt(term.getEndPos());

		var d = document.createElement("div");

		var zone = { afterLineNumber: pos.lineNumber, 
				domNode: d, heightInPx: 0, suppressMouseDown: false, id: -1 };

		ReactDOM.render(<EvaluationView term={term} onRemove={() => { 
			e.changeViewZones((accessor) => {
				accessor.removeZone(zone.id);
			});
		}} 
		onHeightUpdate={() => {
			setTimeout(() => {
				if (!d.childNodes[0]) return; 

				zone.heightInPx = d.childNodes[0].offsetHeight + 20; // margin
				e.changeViewZones((accessor) => {
					if (zone.id !== -1)
						accessor.layoutZone(zone.id);
				});
			}, 0);

		}} />, d);
		d.style.zIndex = "1";

		e.changeViewZones((accessor) => {
			zone.id = accessor.addZone(zone);
		});
	}
}

class RunWidget implements monaco.editor.IContentWidget {
	
	private div: HTMLElement;
	constructor(private id: number, private pos: monaco.IPosition, term: Syntaxes.Term, editor: ICodeEditor) {
		this.div = document.createElement("div");
		ReactDOM.render(<RunWidgetUI term={term} editor={editor} />, this.div);
	}

	public getId(): string {
		return "run" + this.id;
	}

	public getDomNode(): HTMLElement {
		return this.div;
	}

	public getPosition(): monaco.editor.IContentWidgetPosition {
		return { position: this.pos, preference: [ monaco.editor.ContentWidgetPositionPreference.EXACT ] };
	}
}

@observer
class GUI extends React.Component<{}, {}> {


	private editor: monaco.editor.IEditor;

	private editorDidMount(editor: monaco.editor.IEditor) {

		this.editor = editor;
		var m = editor.getModel() as monaco.editor.IModel;

		autorun(() => {
			model.windowWidth + model.windowHeight;
			editor.layout();
		});

		this.onChange();
	}

	private widgets: RunWidget[] = [];

	private onChange() {
		var m = this.editor.getModel() as monaco.editor.IModel;
		var logger = new Logger();
		var doc = Parser.parseDocument(m.getValue(), logger);

		const editor = this.editor as monaco.editor.ICodeEditor;

		const markers: monaco.editor.IMarkerData[] = [];
		for (var err of logger.entries) {
			const pos = m.getPositionAt(err.startPos);
			const end = m.getPositionAt(err.endPos);
			
			markers.push({ code: "error", 
				startLineNumber: pos.lineNumber, startColumn: pos.column, 
				endLineNumber: end.lineNumber, endColumn: end.column, 
				message: err.message, severity: monaco.Severity.Error, source: "lambda" });
		}

		monaco.editor.setModelMarkers(m, "lambda", markers);

		for (var w of this.widgets)
			editor.removeContentWidget(w);

		this.widgets = [];

		let i = 0;
		for (var mb of doc.members.nodes) {
			if (mb instanceof Syntaxes.TermDocumentMember) {
				i++;
				const endPos = mb.getEndPos();

				var div = document.createElement("div");
				div.innerText = "run";

				const p = m.getPositionAt(endPos);
				const w = new RunWidget(i, p, mb.term, editor);
				this.widgets.push(w);
				editor.addContentWidget(w);
			}
		}
	}

	render() {
		return (
			<div className="editor">
				<MonacoEditor
					defaultValue={`
true = x => y => x;
false = x => y => y;

(x => x x) (x => x x x);

(a => (b => a) (x => a) a) (c => d) (c => f);

`}
					width="100%"
					height="100%"
					language="lambda"
					editorDidMount={this.editorDidMount.bind(this)}
					onChange={this.onChange.bind(this)}
				/>
			</div>
		);
	}
}

var target = document.createElement("div");
ReactDOM.render(<div><DevTools /><GUI /></div>, target);
document.body.appendChild(target);

