import ts, { factory } from "typescript";

function visitNodeAndChildren(
	node: ts.SourceFile,
	program: ts.Program,
	context: ts.TransformationContext,
): ts.SourceFile;
function visitNodeAndChildren(
	node: ts.Node,
	program: ts.Program,
	context: ts.TransformationContext,
): ts.Node | undefined;
function visitNodeAndChildren(
	node: ts.Node,
	program: ts.Program,
	context: ts.TransformationContext,
): ts.Node | undefined {
	return ts.visitEachChild(
		visitNode(node, program),
		(childNode) => visitNodeAndChildren(childNode, program, context),
		context,
	);
}

function visitNode(node: ts.SourceFile, program: ts.Program): ts.SourceFile;
function visitNode(node: ts.Node, program: ts.Program): ts.Node | undefined;
function visitNode(node: ts.Node, program: ts.Program): ts.Node | undefined {
	if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "env") {
		const [arg, orElse] = node.arguments;
		if (ts.isStringLiteral(arg)) {
			if (orElse && ts.isStringLiteral(orElse)) {
				return factory.createStringLiteral(process.env[arg.text]?.trim() ?? orElse.text ?? "");
			} else {
				const value = process.env[arg.text]?.trim();
				if (value !== undefined) {
					return factory.createStringLiteral(value);
				} else {
					return factory.createIdentifier("undefined");
				}
			}
		}
	}

    return node;
}

export default function transform(program: ts.Program) {
	return (context: ts.TransformationContext) => (file: ts.SourceFile) => visitNodeAndChildren(file, program, context);
}