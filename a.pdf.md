<!--------------- PAGE 1 ---------------->
<!--------------- SECTION 1 --------------->
5/28/26, 4:30 PM Untitled

# Action Stubs Generator

This folder contains the new AST-based server action stubs generator. It is intended to live beside the legacy GenerateActionStubs.ts implementation without replacing or modifying it.

## What It Does

The generator scans backend .action.ts files, reads real @Action({...}) decorators, and creates the frontend actions-manifest.ts file used by useServerActions and useAction. Unlike the legacy generator, it does not require /// BEGIN ACTION SCHEMA / /// END ACTION SCHEMA placeholder blocks. It extracts the action metadata from TypeScript code using the TypeScript compiler API. Supported in this first version: Multiple @Action classes in the same .action.ts file. Decorators with name, inputSchema, and outputSchema object-literal properties. Shorthand schema properties such as @Action({ name: 'echo', inputSchema, outputSchema }). Same-file exported schema constants. Same-file schema reuse such as export const CreateOutputSchema = GetOutputSchema. Repeatable CLI include and exclude globs.

## Default Behavior

By default, the generator only scans example actions:

src/modules/actions/examples/**/*.action.ts This keeps the generated frontend manifest close to the current legacy output unless additional folders are explicitly included.

## Usage

about:blank 1/4
<!--------------- PAGE 2 ---------------->
|5/28/26, 4:30 PM|||Untitled After the backend has been built, run the compiled generator entrypoint directly:||
|---|---|---|---|---|
|||node dist/modules/actions/generator/index.js node dist/modules/actions/generator/index.js --include To include examples and ontology actions together: node dist/modules/actions/generator/index.js --include|To include another action folder, pass one or more --include globs. Globs are relative to packages/be : "src/modules/actions/ontology/**/*.action.ts" "src/modules/actions/examples/**/*.action.ts"||
||To exclude a subset:|node dist/modules/actions/generator/index.js --include|"src/modules/actions/**/*.action.ts"| --exclude|
|||The generated file is written to: packages/fe/src/services/server-actions/actions-manifest.ts External imports are still injected from: packages/fe/src/services/server-actions/actions-manifest.imports.ts Expected Action Shape|A supported action file should export the schema constants used by the decorator in the same file:||
|export|type||ListEntitiesInputType = InferFromSchema<typeof ListEntitiesInputSchema>;||
|export|const||ListEntitiesInputSchema = T.Object({ontologyId: T.Number({minimum: 1})});||
|about:blank||||2/4|
<!--------------- PAGE 3 ---------------->
|5/28/26, 4:30 PM|||Untitled|
|---|---|---|---|
|export|type|ListEntitiesOutputType = InferFromSchema<typeof|ListEntitiesOutputSchema>;|
|export })|const @Action({|ListEntitiesOutputSchema = T.Array(T.Object({id: T.Number(), name: T.String()})); name: 'ontology.entity.list', inputSchema: ListEntitiesInputSchema, outputSchema: ListEntitiesOutputSchema,||
|export|class|ListEntitiesAction extends Current Limitations This version resolves schemas only inside the same .action.ts file. If a schema initializer uses a local|BaseAction<ListEntitiesInputType, ListEntitiesOutputType> {|
|||imported symbol, the generator fails with a clear error instead of generating an unsafe manifest.||
||DateSchema validation is clean. Validation|Allowed external/runtime symbols include the TypeBox alias T, plus the generated manifest helpers and FileSchema. Domain symbols that are already frontend-safe can still be provided through actions-manifest.imports.ts when the generated schema code references them. The legacy GenerateActionStubs.ts file and the existing actions-stubs script are intentionally left unchanged. A separate script can be added later, for example actions-stubs:new, once package Focused tests live beside the generator: packages/be/src/modules/actions/generator/index.spec.ts Once packages/be/package.json is valid JSON, run:||
|about:blank|||3/4|
<!--------------- PAGE 4 ---------------->
5/28/26, 4:30 PM Untitled

npm run test --workspace=be -- generator/index.spec.ts --runInBand

about:blank 4/4