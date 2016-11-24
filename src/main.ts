
import { Parser, Logger } from "./parser";

var logger = new Logger();
var doc = Parser.parseDocument("a => b => a) b; a => b; (c)", logger);

console.log(doc.members.nodes);
console.log(doc.toString());

