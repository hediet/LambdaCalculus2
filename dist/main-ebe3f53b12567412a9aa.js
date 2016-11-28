webpackJsonp([0,2],{

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
	    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	    return c > 3 && r && Object.defineProperty(target, key, r), r;
	};
	var React = __webpack_require__(1);
	var ReactDOM = __webpack_require__(32);
	var cn = __webpack_require__(178);
	var mobx_1 = __webpack_require__(179);
	var mobx_react_1 = __webpack_require__(180);
	var mobx_react_devtools_1 = __webpack_require__(181);
	__webpack_require__(182);
	var parser_1 = __webpack_require__(186);
	var Syntaxes = __webpack_require__(188);
	var react_monaco_editor_1 = __webpack_require__(189);
	var Analysis = __webpack_require__(190);
	var Model = (function () {
	    function Model() {
	    }
	    __decorate([
	        mobx_1.observable
	    ], Model.prototype, "windowWidth", void 0);
	    __decorate([
	        mobx_1.observable
	    ], Model.prototype, "windowHeight", void 0);
	    return Model;
	}());
	// https://hediet.de/screenshots/2016_11_23_20_29_46_Webpack_App.png
	var model = new Model();
	model.windowWidth = window.innerWidth;
	model.windowHeight = window.innerHeight;
	window.onresize = function () {
	    model.windowWidth = window.innerWidth;
	    model.windowHeight = window.innerHeight;
	};
	function createViewFor(t, termContext) {
	    if (t instanceof Syntaxes.Abstraction)
	        return (React.createElement(AbstractionView, {term: t, termContext: termContext}));
	    if (t instanceof Syntaxes.Application)
	        return (React.createElement(ApplicationView, {term: t, termContext: termContext}));
	    if (t instanceof Syntaxes.Variable)
	        return (React.createElement(VariableView, {term: t, termContext: termContext}));
	    if (t instanceof Syntaxes.ParenthesizedTerm)
	        return (React.createElement(ParenthesizedTermView, {term: t, termContext: termContext}));
	    throw "";
	}
	var VariableView = (function (_super) {
	    __extends(VariableView, _super);
	    function VariableView() {
	        _super.apply(this, arguments);
	    }
	    VariableView.prototype.render = function () {
	        var _this = this;
	        var wasArg = this.props.termContext.lastAnalysisResult && this.props.termContext.lastAnalysisResult.instantiations.some(function (i) { return i.newValue === _this.props.term; });
	        var isRedexArg = this.props.termContext.currentRedex && this.props.termContext.currentRedex.argumentTerm === this.props.term;
	        var isRedexVar = this.props.termContext.currentAnalysisResult && this.props.termContext.currentAnalysisResult.instantiations.some(function (i) { return i.variable === _this.props.term; });
	        return (React.createElement("span", {className: cn("term", "variable", isRedexVar && "redexVar", isRedexArg && "redexArg", wasArg && "wasArg")}, this.props.term.identifier.text));
	    };
	    VariableView = __decorate([
	        mobx_react_1.observer
	    ], VariableView);
	    return VariableView;
	}(React.Component));
	var ParenthesizedTermView = (function (_super) {
	    __extends(ParenthesizedTermView, _super);
	    function ParenthesizedTermView() {
	        _super.apply(this, arguments);
	    }
	    ParenthesizedTermView.prototype.render = function () {
	        var _this = this;
	        var wasArg = this.props.termContext.lastAnalysisResult && this.props.termContext.lastAnalysisResult.instantiations.some(function (i) { return i.newValue === _this.props.term; });
	        var isRedexArg = this.props.termContext.currentRedex && this.props.termContext.currentRedex.argumentTerm === this.props.term;
	        return (React.createElement("span", {className: cn("term", "parenthesizedTerm", isRedexArg && "redexArg", wasArg && "wasArg")}, 
	            "(", 
	            createViewFor(this.props.term.term, this.props.termContext), 
	            ")"));
	    };
	    ParenthesizedTermView = __decorate([
	        mobx_react_1.observer
	    ], ParenthesizedTermView);
	    return ParenthesizedTermView;
	}(React.Component));
	var ApplicationView = (function (_super) {
	    __extends(ApplicationView, _super);
	    function ApplicationView() {
	        _super.apply(this, arguments);
	    }
	    ApplicationView.prototype.render = function () {
	        var _this = this;
	        var wasArg = this.props.termContext.lastAnalysisResult && this.props.termContext.lastAnalysisResult.instantiations.some(function (i) { return i.newValue === _this.props.term; });
	        var isRedexArg = this.props.termContext.currentRedex && this.props.termContext.currentRedex.argumentTerm === this.props.term;
	        return (React.createElement("span", {className: cn("term", "application", Analysis.isRedex(this.props.term) && "redex", isRedexArg && "redexArg", wasArg && "wasArg")}, 
	            createViewFor(this.props.term.functionTerm, this.props.termContext), 
	            createViewFor(this.props.term.argumentTerm, this.props.termContext)));
	    };
	    ApplicationView = __decorate([
	        mobx_react_1.observer
	    ], ApplicationView);
	    return ApplicationView;
	}(React.Component));
	var AbstractionView = (function (_super) {
	    __extends(AbstractionView, _super);
	    function AbstractionView() {
	        _super.apply(this, arguments);
	    }
	    AbstractionView.prototype.clicked = function () {
	        if (Analysis.isRedexAbstraction(this.props.term)) {
	            var parent_1 = Analysis.parentSkipParenthesizedTerm(this.props.term.parent);
	            this.props.termContext.reduceRedex(parent_1);
	        }
	    };
	    AbstractionView.prototype.mouseEnteredLeft = function (entered) {
	        if (!entered) {
	            this.props.termContext.selectedRedex = null;
	            return;
	        }
	        if (Analysis.isRedexAbstraction(this.props.term)) {
	            var parent_2 = Analysis.parentSkipParenthesizedTerm(this.props.term.parent);
	            this.props.termContext.selectedRedex = parent_2;
	        }
	    };
	    AbstractionView.prototype.render = function () {
	        var _this = this;
	        var wasArg = this.props.termContext.lastAnalysisResult && this.props.termContext.lastAnalysisResult.instantiations.some(function (i) { return i.newValue === _this.props.term; });
	        var isRedexArg = this.props.termContext.currentRedex && this.props.termContext.currentRedex.argumentTerm === this.props.term;
	        var isCurrentRedex = this.props.termContext.currentRedex && Analysis.skipParenthesizedTerm(this.props.termContext.currentRedex.functionTerm) == this.props.term;
	        var isRedexAbstraction = Analysis.isRedexAbstraction(this.props.term);
	        return (React.createElement("span", {className: cn("term", "abstraction", isRedexAbstraction && "redex", isRedexArg && "redexArg", isCurrentRedex && "currentRedex", wasArg && "wasArg")}, 
	            React.createElement("span", {className: "variableAndArrow"}, 
	                React.createElement("span", {className: "declaration variable", onClick: function () { return _this.clicked(); }, onMouseEnter: function () { return _this.mouseEnteredLeft(true); }, onMouseLeave: function () { return _this.mouseEnteredLeft(false); }}, this.props.term.variableDeclaration.variable.text), 
	                React.createElement("span", {className: "arrow"}, " ⟹ ")), 
	            createViewFor(this.props.term.term, this.props.termContext)));
	    };
	    AbstractionView = __decorate([
	        mobx_react_1.observer
	    ], AbstractionView);
	    return AbstractionView;
	}(React.Component));
	var TermEvaluationViewContext = (function () {
	    function TermEvaluationViewContext(view, idx, term, preselectedRedex, preselectedAnalysisResult, lastAnalysisResult) {
	        this.view = view;
	        this.idx = idx;
	        this.term = term;
	        this.preselectedRedex = preselectedRedex;
	        this.preselectedAnalysisResult = preselectedAnalysisResult;
	        this.lastAnalysisResult = lastAnalysisResult;
	    }
	    Object.defineProperty(TermEvaluationViewContext.prototype, "currentAnalysisResult", {
	        get: function () {
	            if (!this.selectedRedex)
	                return this.preselectedAnalysisResult;
	            return Analysis.reduce(this.term, this.selectedRedex);
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(TermEvaluationViewContext.prototype, "currentRedex", {
	        get: function () {
	            if (this.selectedRedex)
	                return this.selectedRedex;
	            return this.preselectedRedex;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    TermEvaluationViewContext.prototype.reduceRedex = function (redex) {
	        this.view.reduceRedex(redex, this.idx);
	    };
	    __decorate([
	        mobx_1.observable
	    ], TermEvaluationViewContext.prototype, "selectedRedex", void 0);
	    __decorate([
	        mobx_1.computed
	    ], TermEvaluationViewContext.prototype, "currentAnalysisResult", null);
	    __decorate([
	        mobx_1.computed
	    ], TermEvaluationViewContext.prototype, "currentRedex", null);
	    return TermEvaluationViewContext;
	}());
	var EvaluationView = (function (_super) {
	    __extends(EvaluationView, _super);
	    function EvaluationView(props) {
	        _super.call(this, props);
	        this.terms = [];
	        this.terms.push({ term: this.props.term, selectedRedex: null, step: null });
	    }
	    EvaluationView.prototype.reduceRedex = function (redex, termIdx) {
	        this.terms.length = termIdx + 1;
	        var t = this.terms[termIdx];
	        var _a = Analysis.reduce(t.term, redex), instantiations = _a.instantiations, newTerm = _a.newTerm;
	        t.selectedRedex = redex;
	        t.step = { instantiations: instantiations, newTerm: newTerm };
	        this.terms.push({ term: newTerm, selectedRedex: null, step: null });
	    };
	    EvaluationView.prototype.componentDidMount = function () {
	        if (this.props.onHeightUpdate)
	            this.props.onHeightUpdate();
	    };
	    EvaluationView.prototype.componentDidUpdate = function () {
	        if (this.props.onHeightUpdate)
	            this.props.onHeightUpdate();
	    };
	    EvaluationView.prototype.removeStep = function (idx) {
	        if (idx === 0)
	            this.props.onRemove();
	        this.terms.splice(idx);
	    };
	    EvaluationView.prototype.render = function () {
	        var _this = this;
	        return (React.createElement("div", {className: "evaluationView"}, this.terms.map(function (t, idx) {
	            var prevStep = idx == 0 ? null : _this.terms[idx - 1].step;
	            return (React.createElement("div", {className: "evaluationStep"}, 
	                React.createElement("button", {onClick: function () { return _this.removeStep(idx); }}, "X"), 
	                createViewFor(t.term, new TermEvaluationViewContext(_this, idx, t.term, t.selectedRedex, t.step, prevStep))));
	        })));
	    };
	    __decorate([
	        mobx_1.observable
	    ], EvaluationView.prototype, "terms", void 0);
	    EvaluationView = __decorate([
	        mobx_react_1.observer
	    ], EvaluationView);
	    return EvaluationView;
	}(React.Component));
	var RunWidgetUI = (function (_super) {
	    __extends(RunWidgetUI, _super);
	    function RunWidgetUI() {
	        _super.apply(this, arguments);
	    }
	    RunWidgetUI.prototype.render = function () {
	        var _this = this;
	        return (React.createElement("div", {className: "run-widget"}, 
	            React.createElement("button", {onClick: function () { return _this.onClick(); }}, "Run")
	        ));
	    };
	    RunWidgetUI.prototype.onClick = function () {
	        var e = this.props.editor;
	        var term = this.props.term;
	        var pos = e.getModel().getPositionAt(term.getEndPos());
	        var d = document.createElement("div");
	        var zone = { afterLineNumber: pos.lineNumber,
	            domNode: d, heightInPx: 0, suppressMouseDown: false, id: -1 };
	        ReactDOM.render(React.createElement(EvaluationView, {term: term, onRemove: function () {
	            e.changeViewZones(function (accessor) {
	                accessor.removeZone(zone.id);
	            });
	        }, onHeightUpdate: function () {
	            setTimeout(function () {
	                if (!d.childNodes[0])
	                    return;
	                zone.heightInPx = d.childNodes[0].offsetHeight + 20; // margin
	                e.changeViewZones(function (accessor) {
	                    if (zone.id !== -1)
	                        accessor.layoutZone(zone.id);
	                });
	            }, 0);
	        }}), d);
	        d.style.zIndex = "1";
	        e.changeViewZones(function (accessor) {
	            zone.id = accessor.addZone(zone);
	        });
	    };
	    return RunWidgetUI;
	}(React.Component));
	var RunWidget = (function () {
	    function RunWidget(id, pos, term, editor) {
	        this.id = id;
	        this.pos = pos;
	        this.div = document.createElement("div");
	        ReactDOM.render(React.createElement(RunWidgetUI, {term: term, editor: editor}), this.div);
	    }
	    RunWidget.prototype.getId = function () {
	        return "run" + this.id;
	    };
	    RunWidget.prototype.getDomNode = function () {
	        return this.div;
	    };
	    RunWidget.prototype.getPosition = function () {
	        return { position: this.pos, preference: [monaco.editor.ContentWidgetPositionPreference.EXACT] };
	    };
	    return RunWidget;
	}());
	var GUI = (function (_super) {
	    __extends(GUI, _super);
	    function GUI() {
	        _super.apply(this, arguments);
	        this.widgets = [];
	    }
	    GUI.prototype.editorDidMount = function (editor) {
	        this.editor = editor;
	        var m = editor.getModel();
	        mobx_1.autorun(function () {
	            model.windowWidth + model.windowHeight;
	            editor.layout();
	        });
	        this.onChange();
	    };
	    GUI.prototype.onChange = function () {
	        var m = this.editor.getModel();
	        var logger = new parser_1.Logger();
	        var doc = parser_1.Parser.parseDocument(m.getValue(), logger);
	        var editor = this.editor;
	        var markers = [];
	        for (var _i = 0, _a = logger.entries; _i < _a.length; _i++) {
	            var err = _a[_i];
	            var pos = m.getPositionAt(err.startPos);
	            var end = m.getPositionAt(err.endPos);
	            markers.push({ code: "error",
	                startLineNumber: pos.lineNumber, startColumn: pos.column,
	                endLineNumber: end.lineNumber, endColumn: end.column,
	                message: err.message, severity: monaco.Severity.Error, source: "lambda" });
	        }
	        monaco.editor.setModelMarkers(m, "lambda", markers);
	        for (var _b = 0, _c = this.widgets; _b < _c.length; _b++) {
	            var w = _c[_b];
	            editor.removeContentWidget(w);
	        }
	        this.widgets = [];
	        var i = 0;
	        for (var _d = 0, _e = doc.members.nodes; _d < _e.length; _d++) {
	            var mb = _e[_d];
	            if (mb instanceof Syntaxes.TermDocumentMember) {
	                i++;
	                var endPos = mb.getEndPos();
	                var div = document.createElement("div");
	                div.innerText = "run";
	                var p = m.getPositionAt(endPos);
	                var w_1 = new RunWidget(i, p, mb.term, editor);
	                this.widgets.push(w_1);
	                editor.addContentWidget(w_1);
	            }
	        }
	    };
	    GUI.prototype.render = function () {
	        return (React.createElement("div", {className: "editor"}, 
	            React.createElement(react_monaco_editor_1.default, {defaultValue: "\n\n(t => f => f) ((y => (x => x x) (x => x x)) ((x => x) (x => x))) (t => f => f);\n\ny => (z => (x => x) (x => x) z) y;\n\n", width: "100%", height: "100%", language: "lambda", editorDidMount: this.editorDidMount.bind(this), onChange: this.onChange.bind(this)})
	        ));
	    };
	    GUI = __decorate([
	        mobx_react_1.observer
	    ], GUI);
	    return GUI;
	}(React.Component));
	var target = document.createElement("div");
	ReactDOM.render(React.createElement("div", null, 
	    React.createElement(mobx_react_devtools_1.default, null), 
	    React.createElement(GUI, null)), target);
	document.body.appendChild(target);


/***/ },

/***/ 182:
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(183);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(185)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./../node_modules/sass-loader/index.js!./style.scss", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./../node_modules/sass-loader/index.js!./style.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },

/***/ 183:
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(184)();
	// imports
	
	
	// module
	exports.push([module.id, "body {\n  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }\n\n.editor {\n  height: 800px;\n  padding: 10px; }\n\n.run-widget {\n  margin-left: 20px; }\n\n.term {\n  font-family: Courier New, Courier, monospace; }\n\n.variable {\n  color: blue; }\n\n.arrow {\n  margin-left: 3px;\n  margin-right: 3px; }\n\n.abstraction.redex > .variableAndArrow > .declaration.variable {\n  text-decoration: underline;\n  font-weight: bold;\n  padding: 1px;\n  padding-left: 3px;\n  padding-right: 3px;\n  border: 2px solid transparent;\n  cursor: pointer; }\n\n.abstraction.currentRedex {\n  border: 2px solid orange;\n  padding-top: 2px;\n  padding-bottom: 2px; }\n\n.abstraction.currentRedex > .variableAndArrow {\n  background-color: #ffdb99;\n  padding-top: 2px;\n  padding-bottom: 2px; }\n\n.evaluationView {\n  background-color: whitesmoke;\n  margin-top: 10px;\n  margin-bottom: 10px; }\n\n.variable {\n  padding: 1px;\n  padding-left: 3px;\n  padding-right: 3px; }\n\n.term {\n  border: solid transparent;\n  border-width: 0px 2px 0px 2px; }\n\n.redexVar {\n  background-color: #b8e2fc;\n  border: 2px solid blue;\n  cursor: pointer; }\n\n.redexArg {\n  background-color: #ffcccc;\n  border: 2px solid red;\n  cursor: pointer;\n  padding-top: 2px;\n  padding-bottom: 2px; }\n\n.evaluationStep {\n  padding: 10px; }\n\n.wasArg {\n  box-shadow: 0 0 0 7px rgba(0, 0, 0, 0.05); }\n", ""]);
	
	// exports


/***/ },

/***/ 186:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var typed_lexer_1 = __webpack_require__(187);
	var syntax_1 = __webpack_require__(188);
	var Syntaxes = __webpack_require__(188);
	function createLexerFor(input) {
	    return new LambdaLexerFactory().getLexerFor(input);
	}
	exports.createLexerFor = createLexerFor;
	var LambdaLexerFactory = (function (_super) {
	    __extends(LambdaLexerFactory, _super);
	    function LambdaLexerFactory() {
	        _super.call(this);
	        this.addSimpleRule("=>", syntax_1.TokenKind.FatArrow);
	        this.addSimpleRule("->", syntax_1.TokenKind.SmallArrow);
	        this.addSimpleRule("(", syntax_1.TokenKind.OpeningParen);
	        this.addSimpleRule(")", syntax_1.TokenKind.ClosingParen);
	        this.addSimpleRule(";", syntax_1.TokenKind.Semicolon);
	        this.addSimpleRule("=", syntax_1.TokenKind.Equals);
	        this.addSimpleRule(/\/\*.*\*\//, syntax_1.TokenKind.Comment);
	        this.addSimpleRule(/\/\/.*\n/, syntax_1.TokenKind.Comment);
	        this.addSimpleRule(/[a-zA-Z_][a-zA-Z0-9_]*/, syntax_1.TokenKind.Identifier);
	        this.addSimpleRule(/\s+/, syntax_1.TokenKind.WS);
	        this.addSimpleRule(/./, syntax_1.TokenKind.Invalid);
	    }
	    return LambdaLexerFactory;
	}(typed_lexer_1.LexerFactory));
	var Logger = (function () {
	    function Logger() {
	        this.entries = [];
	    }
	    Logger.prototype.logError = function (msg, startPos, endPos) {
	        this.entries.push({ message: msg, startPos: startPos, endPos: endPos });
	    };
	    return Logger;
	}());
	exports.Logger = Logger;
	function getLexerPos(lexer) {
	    return lexer.pos;
	}
	var Parser = (function () {
	    function Parser(input) {
	        this.input = input;
	    }
	    Parser.parseDocument = function (input, logger) {
	        var lexer = createLexerFor(input);
	        lexer.next();
	        return new Parser(input).parseDocumentLexer(lexer, logger);
	    };
	    Parser.prototype.parseDocumentLexer = function (lexer, logger) {
	        var nodes = new Syntaxes.SyntaxArray();
	        while (true) {
	            this.skipWs(lexer);
	            if (lexer.getCurToken() === undefined)
	                break;
	            var m = this.tryReadDefinitionMember(lexer, logger);
	            if (m === false)
	                m = this.readTermMember(lexer, logger);
	            nodes.nodes.push(m);
	        }
	        var lambdaDoc = new Syntaxes.LambdaDocument();
	        lambdaDoc.members = nodes;
	        lambdaDoc.setParents();
	        return lambdaDoc;
	    };
	    Parser.prototype.readTermMember = function (lexer, logger) {
	        var term = this.parseTerm(lexer, logger);
	        if (term instanceof Syntaxes.MissingTerm) {
	            var cur = lexer.getCur();
	            logger.logError("Unexpected token.", cur.startPos, cur.startPos + cur.length);
	            lexer.next();
	        }
	        this.skipWs(lexer);
	        var semicolonToken = getLexerPos(lexer);
	        if (lexer.getCurToken() === syntax_1.TokenKind.Semicolon) {
	            semicolonToken = lexer.getCur();
	            lexer.next();
	        }
	        else {
	            logger.logError("Semicolon is missing.", semicolonToken, semicolonToken);
	        }
	        var member = new Syntaxes.TermDocumentMember();
	        member.term = term;
	        member.semicolon = this.toToken(semicolonToken);
	        return member;
	    };
	    Parser.prototype.tryReadDefinitionMember = function (lexer, logger) {
	        if (lexer.getCurToken() === syntax_1.TokenKind.Identifier) {
	            var stack = [];
	            var identifier = lexer.getCur();
	            stack.push(identifier);
	            lexer.next();
	            stack.push.apply(stack, this.skipWs(lexer));
	            if (lexer.getCurToken() === syntax_1.TokenKind.Equals) {
	                var eqToken = lexer.getCur();
	                lexer.next();
	                this.skipWs(lexer);
	                var term = this.parseTerm(lexer, logger);
	                this.skipWs(lexer);
	                var semicolonToken = getLexerPos(lexer);
	                if (lexer.getCurToken() === syntax_1.TokenKind.Semicolon) {
	                    semicolonToken = lexer.getCur();
	                    lexer.next();
	                }
	                else {
	                    logger.logError("Semicolon is missing.", semicolonToken, semicolonToken);
	                }
	                var member = new Syntaxes.DefinitionMember();
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
	                (_a = lexer.getRestrained()).unshift.apply(_a, stack);
	                lexer.cur = first;
	                return false;
	            }
	        }
	        return false;
	        var _a;
	    };
	    Parser.prototype.toToken = function (token) {
	        if (typeof token === "number") {
	            var result_1 = new Syntaxes.Token();
	            result_1.kind = syntax_1.TokenKind.Missing;
	            result_1.startPos = token;
	            result_1.endPos = token;
	            result_1.text = "";
	            return result_1;
	        }
	        var result = new Syntaxes.Token();
	        result.kind = token.token;
	        result.startPos = token.startPos;
	        result.endPos = token.startPos + token.length;
	        result.text = this.input.substring(result.startPos, result.endPos);
	        return result;
	    };
	    Parser.prototype.skipWs = function (lexer) {
	        var result = [];
	        while (true) {
	            var cur = lexer.getCurToken();
	            if (cur !== syntax_1.TokenKind.WS && cur !== syntax_1.TokenKind.Comment)
	                return result;
	            result.push(lexer.getCur());
	            lexer.next();
	        }
	    };
	    Parser.prototype.parseTerm = function (lexer, logger) {
	        var lastTerm = undefined;
	        while (true) {
	            var term = this.parseTerm2(lexer, logger);
	            if (term === undefined)
	                break;
	            if (lastTerm === undefined) {
	                lastTerm = term;
	            }
	            else {
	                var app = new Syntaxes.Application();
	                app.functionTerm = lastTerm;
	                app.argumentTerm = term;
	                lastTerm = app;
	            }
	        }
	        if (lastTerm === undefined) {
	            var r = new Syntaxes.MissingTerm();
	            logger.logError("Term is missing.", getLexerPos(lexer), getLexerPos(lexer));
	            r.missingToken = this.toToken(getLexerPos(lexer));
	            return r;
	        }
	        return lastTerm;
	    };
	    Parser.prototype.parseTerm2 = function (lexer, logger) {
	        this.skipWs(lexer);
	        var kind = lexer.getCurToken();
	        switch (kind) {
	            case syntax_1.TokenKind.Identifier:
	                var identifierToken = lexer.getCur();
	                var identifier = this.toToken(identifierToken);
	                lexer.next();
	                this.skipWs(lexer);
	                var kind2 = lexer.getCurToken();
	                if (kind2 === syntax_1.TokenKind.FatArrow || kind2 === syntax_1.TokenKind.SmallArrow) {
	                    var arrowToken = lexer.getCur();
	                    lexer.next();
	                    var innerTerm = this.parseTerm(lexer, logger);
	                    var abstraction = new Syntaxes.Abstraction();
	                    var varDecl = new Syntaxes.VariableDeclaration();
	                    varDecl.variable = identifier;
	                    abstraction.variableDeclaration = varDecl;
	                    abstraction.arrow = this.toToken(arrowToken);
	                    abstraction.term = innerTerm;
	                    return abstraction;
	                }
	                var v = new Syntaxes.Variable();
	                v.identifier = identifier;
	                return v;
	            case syntax_1.TokenKind.OpeningParen: {
	                var openParenToken = lexer.getCur();
	                lexer.next();
	                var innerTerm = this.parseTerm(lexer, logger);
	                var closeParenToken = getLexerPos(lexer);
	                if (lexer.getCur().token === syntax_1.TokenKind.ClosingParen) {
	                    closeParenToken = lexer.getCur();
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
	    };
	    return Parser;
	}());
	exports.Parser = Parser;


/***/ },

/***/ 188:
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Syntax = (function () {
	    function Syntax() {
	    }
	    Syntax.prototype.getStartPos = function () {
	        if (this instanceof Token) {
	            return this.startPos;
	        }
	        var children = this.getChildren();
	        return children[0].getStartPos();
	    };
	    Syntax.prototype.getEndPos = function () {
	        if (this instanceof Token) {
	            return this.endPos;
	        }
	        var children = this.getChildren();
	        return children[children.length - 1].getEndPos();
	    };
	    Syntax.prototype.toString = function () {
	        if (this instanceof Token) {
	            return this.text;
	        }
	        return this.getChildren().map(function (c) { return c.toString(); }).join(" ");
	    };
	    Syntax.prototype.setParents = function () {
	        for (var _i = 0, _a = this.getChildren(); _i < _a.length; _i++) {
	            var c = _a[_i];
	            c.parent = this;
	            c.setParents();
	        }
	    };
	    return Syntax;
	}());
	exports.Syntax = Syntax;
	(function (TokenKind) {
	    TokenKind[TokenKind["FatArrow"] = 0] = "FatArrow";
	    TokenKind[TokenKind["SmallArrow"] = 1] = "SmallArrow";
	    TokenKind[TokenKind["OpeningParen"] = 2] = "OpeningParen";
	    TokenKind[TokenKind["ClosingParen"] = 3] = "ClosingParen";
	    TokenKind[TokenKind["Semicolon"] = 4] = "Semicolon";
	    TokenKind[TokenKind["Equals"] = 5] = "Equals";
	    TokenKind[TokenKind["WS"] = 6] = "WS";
	    TokenKind[TokenKind["Comment"] = 7] = "Comment";
	    TokenKind[TokenKind["Identifier"] = 8] = "Identifier";
	    TokenKind[TokenKind["Invalid"] = 9] = "Invalid";
	    TokenKind[TokenKind["Missing"] = 10] = "Missing";
	})(exports.TokenKind || (exports.TokenKind = {}));
	var TokenKind = exports.TokenKind;
	var Token = (function (_super) {
	    __extends(Token, _super);
	    function Token() {
	        _super.apply(this, arguments);
	    }
	    Token.prototype.getChildren = function () { return []; };
	    Token.prototype.clone = function () {
	        var r = new Token();
	        r.text = this.text;
	        r.kind = this.kind;
	        return r;
	    };
	    return Token;
	}(Syntax));
	exports.Token = Token;
	var SyntaxArray = (function (_super) {
	    __extends(SyntaxArray, _super);
	    function SyntaxArray() {
	        _super.apply(this, arguments);
	        this.nodes = [];
	    }
	    SyntaxArray.prototype.getChildren = function () { return this.nodes; };
	    return SyntaxArray;
	}(Syntax));
	exports.SyntaxArray = SyntaxArray;
	var LambdaDocument = (function (_super) {
	    __extends(LambdaDocument, _super);
	    function LambdaDocument() {
	        _super.apply(this, arguments);
	    }
	    LambdaDocument.prototype.getChildren = function () { return [this.members]; };
	    return LambdaDocument;
	}(Syntax));
	exports.LambdaDocument = LambdaDocument;
	var DocumentMember = (function (_super) {
	    __extends(DocumentMember, _super);
	    function DocumentMember() {
	        _super.apply(this, arguments);
	    }
	    return DocumentMember;
	}(Syntax));
	exports.DocumentMember = DocumentMember;
	// term;
	var TermDocumentMember = (function (_super) {
	    __extends(TermDocumentMember, _super);
	    function TermDocumentMember() {
	        _super.apply(this, arguments);
	    }
	    TermDocumentMember.prototype.getChildren = function () { return [this.term, this.semicolon]; };
	    return TermDocumentMember;
	}(DocumentMember));
	exports.TermDocumentMember = TermDocumentMember;
	// name = term;
	var DefinitionMember = (function (_super) {
	    __extends(DefinitionMember, _super);
	    function DefinitionMember() {
	        _super.apply(this, arguments);
	    }
	    DefinitionMember.prototype.getChildren = function () { return [this.name, this.equals, this.term, this.semicolon]; };
	    return DefinitionMember;
	}(DocumentMember));
	exports.DefinitionMember = DefinitionMember;
	var Term = (function (_super) {
	    __extends(Term, _super);
	    function Term() {
	        _super.apply(this, arguments);
	    }
	    return Term;
	}(Syntax));
	exports.Term = Term;
	// (term)
	var ParenthesizedTerm = (function (_super) {
	    __extends(ParenthesizedTerm, _super);
	    function ParenthesizedTerm() {
	        _super.apply(this, arguments);
	    }
	    ParenthesizedTerm.prototype.getChildren = function () { return [this.openingParen, this.term, this.closingParen]; };
	    return ParenthesizedTerm;
	}(Term));
	exports.ParenthesizedTerm = ParenthesizedTerm;
	// identifier
	var Variable = (function (_super) {
	    __extends(Variable, _super);
	    function Variable() {
	        _super.apply(this, arguments);
	    }
	    Variable.prototype.getChildren = function () { return [this.identifier]; };
	    return Variable;
	}(Term));
	exports.Variable = Variable;
	var VariableDeclaration = (function (_super) {
	    __extends(VariableDeclaration, _super);
	    function VariableDeclaration() {
	        _super.apply(this, arguments);
	    }
	    VariableDeclaration.prototype.getChildren = function () { return [this.variable]; };
	    return VariableDeclaration;
	}(Syntax));
	exports.VariableDeclaration = VariableDeclaration;
	// variable => term
	var Abstraction = (function (_super) {
	    __extends(Abstraction, _super);
	    function Abstraction() {
	        _super.apply(this, arguments);
	    }
	    Abstraction.prototype.getChildren = function () { return [this.variableDeclaration, this.arrow, this.term]; };
	    return Abstraction;
	}(Term));
	exports.Abstraction = Abstraction;
	// functionTerm argumentTerm
	var Application = (function (_super) {
	    __extends(Application, _super);
	    function Application() {
	        _super.apply(this, arguments);
	    }
	    Application.prototype.getChildren = function () { return [this.functionTerm, this.argumentTerm]; };
	    return Application;
	}(Term));
	exports.Application = Application;
	var MissingTerm = (function (_super) {
	    __extends(MissingTerm, _super);
	    function MissingTerm() {
	        _super.apply(this, arguments);
	    }
	    MissingTerm.prototype.getChildren = function () { return []; };
	    return MissingTerm;
	}(Term));
	exports.MissingTerm = MissingTerm;


/***/ },

/***/ 190:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var s = __webpack_require__(188);
	function getDeclaration(v) {
	    var t = v;
	    while (t instanceof s.Term) {
	        if (t instanceof s.Abstraction) {
	            if (t.variableDeclaration.variable.text === v.identifier.text)
	                return t.variableDeclaration;
	        }
	        t = t.parent;
	    }
	    return null;
	}
	exports.getDeclaration = getDeclaration;
	function getUsages(v) {
	}
	exports.getUsages = getUsages;
	function getDeclaredVarsInScope(term) {
	    var result;
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
	exports.getDeclaredVarsInScope = getDeclaredVarsInScope;
	function getAllRedexes(term) {
	    var r = [];
	    for (var _i = 0, _a = term.getChildren(); _i < _a.length; _i++) {
	        var c = _a[_i];
	        if (c instanceof s.Term)
	            r.push.apply(r, getAllRedexes(c));
	    }
	    if (isRedex(term)) {
	        r.push(term);
	    }
	    return r;
	}
	exports.getAllRedexes = getAllRedexes;
	function reduce(term, redex) {
	    var instantiations = [];
	    var newTerm = clone(term, function (t) {
	        if (t === redex) {
	            var redexFunc = skipParenthesizedTerm(redex.functionTerm);
	            return clone(redexFunc.term, function (t2) {
	                if ((t2 instanceof s.Variable) && getDeclaration(t2) === redexFunc.variableDeclaration) {
	                    var cloned = clone(redex.argumentTerm, function (t3) { return t3; });
	                    instantiations.push({ variable: t2, newValue: cloned });
	                    return cloned;
	                }
	                return t2;
	            });
	        }
	        return t;
	    });
	    newTerm.setParents();
	    return { newTerm: newTerm, instantiations: instantiations };
	}
	exports.reduce = reduce;
	function skipParenthesizedTerm(term) {
	    while (term instanceof s.ParenthesizedTerm) {
	        term = term.term;
	    }
	    return term;
	}
	exports.skipParenthesizedTerm = skipParenthesizedTerm;
	function parentSkipParenthesizedTerm(term) {
	    while (term instanceof s.ParenthesizedTerm) {
	        term = term.parent;
	    }
	    return term;
	}
	exports.parentSkipParenthesizedTerm = parentSkipParenthesizedTerm;
	function isRedex(term) {
	    return term instanceof s.Application && skipParenthesizedTerm(term.functionTerm) instanceof s.Abstraction;
	}
	exports.isRedex = isRedex;
	function isRedexAbstraction(term) {
	    if (!(term instanceof s.Abstraction))
	        return false;
	    var parent = parentSkipParenthesizedTerm(term.parent);
	    return parent instanceof s.Application && skipParenthesizedTerm(parent.functionTerm) === term;
	}
	exports.isRedexAbstraction = isRedexAbstraction;
	function clone(term, f) {
	    var term2 = f(term);
	    if (term2 !== term)
	        return term2;
	    if (term instanceof s.Variable) {
	        var v = new s.Variable();
	        v.identifier = term.identifier.clone();
	        return v;
	    }
	    else if (term instanceof s.Abstraction) {
	        var t = new s.Abstraction();
	        t.variableDeclaration = new s.VariableDeclaration();
	        t.variableDeclaration.variable = term.variableDeclaration.variable.clone();
	        t.arrow = term.arrow.clone();
	        t.term = clone(term.term, f);
	        return t;
	    }
	    else if (term instanceof s.Application) {
	        var t = new s.Application();
	        t.argumentTerm = clone(term.argumentTerm, f);
	        t.functionTerm = clone(term.functionTerm, f);
	        return t;
	    }
	    else if (term instanceof s.ParenthesizedTerm) {
	        var t = new s.ParenthesizedTerm();
	        t.openingParen = term.openingParen.clone();
	        t.term = clone(term.term, f);
	        t.closingParen = term.closingParen.clone();
	        return t;
	    }
	    throw "unsupported.";
	}
	exports.clone = clone;
	/*public getAllFreeVarsIn(term: s.Term): s.Variable[] {
	
	
	}*/


/***/ }

});
//# sourceMappingURL=main-ebe3f53b12567412a9aa.js.map