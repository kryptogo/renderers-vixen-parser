# @codama/renderers-vixen-parser

## Unreleased

### Patch Changes

#### Fix `render()` return type to match `@codama/renderers-core` API

The `render()` function now returns `{ content: string }` instead of a plain `string`.

**Why this change was needed:**

The `@codama/renderers-core` package expects render map values to be objects with a `content` property (the `BaseFragment` type):

```typescript
// BaseFragment type from @codama/renderers-core
export type BaseFragment = Readonly<{ content: string }>;
```

The `writeRenderMap` function destructures this property when writing files:

```typescript
// From @codama/renderers-core
function writeRenderMap(renderMap, basePath) {
  renderMap.forEach(({ content }, relativePath) => {
    writeFile(joinPath(basePath, relativePath), content);
  });
}
```

The official `@codama/renderers-rust` package follows this pattern correctly:

```typescript
// From @codama/renderers-rust
addToRenderMap(renders, "path.rs", {
  content: render("template.njk", context)
});
```

However, `@codama/renderers-vixen-parser` was passing raw strings:

```typescript
// Before (incorrect)
addToRenderMap(renderMap, "path.rs", render(...))  // render() returned string
```

**Solution:**

Modified `render()` to return `{ content: string }` directly:

```typescript
// After (correct)
export const render = (...): { content: string } => {
  return { content: env.render(template, context) };
};
```

#### Add `tupleTypeNode` support in Rust transform functions

Added support for `tupleTypeNode` in `getInnerDefinedTypeTransform` and `getInnerDefinedTypeTransformForEnumVariant` functions.

**Why this change was needed:**

This is not a version compatibility issue — it's an incomplete implementation in `@codama/renderers-vixen-parser`. The codebase had inconsistent `tupleTypeNode` support:

| Feature | `tupleTypeNode` Support |
| ------- | ----------------------- |
| `visitTupleType` (proto generation) | ✅ Supported |
| `getInnerDefinedTypeTransform` (Rust transform) | ❌ Missing |
| `getInnerDefinedTypeTransformForEnumVariant` (Rust transform) | ❌ Missing |

The Rust transform functions only handled `structTypeNode` and `enumTypeNode`:

```typescript
// Before (incomplete)
if (definedType.type.kind === 'structTypeNode') {
  return `Some(self.${outerTypeName}.into_proto())`;
} else if (definedType.type.kind === 'enumTypeNode') {
  // ...
} else {
  throw new Error(`Defined type ${fieldTypeName} is not a struct or enum`);
  // ❌ tupleTypeNode was not handled
}
```

This caused errors when processing tuple types like `OptionBool` from the pumpswap IDL:

```text
Error: Defined type optionBool is not a struct or enum
```

**Solution:**

Added `tupleTypeNode` handling to both transform functions:

```typescript
// After (complete)
} else if (definedType.type.kind === 'tupleTypeNode') {
  // Tuple structs also use into_proto()
  return `Some(self.${outerTypeName}.into_proto())`;
}
```

## 1.2.8

### Patch Changes

- [#26](https://github.com/codama-idl/renderers-vixen-parser/pull/26) [`ea6aaa9`](https://github.com/codama-idl/renderers-vixen-parser/commit/ea6aaa90565431a162ca5ad903cb025f42f3273c) Thanks [@CanardMandarin](https://github.com/CanardMandarin)! - - Fix IDL bytes type conversion

- [#33](https://github.com/codama-idl/renderers-vixen-parser/pull/33) [`600a593`](https://github.com/codama-idl/renderers-vixen-parser/commit/600a593ae78e65de540e115e41dfe77488d3f306) Thanks [@CanardMandarin](https://github.com/CanardMandarin)! - - Add HashMap values conversion when needed

## 1.2.7

### Patch Changes

- [#19](https://github.com/codama-idl/renderers-vixen-parser/pull/19) [`bf44e1f`](https://github.com/codama-idl/renderers-vixen-parser/commit/bf44e1f12bacabf709482d5973e83855399b0438) Thanks [@CanardMandarin](https://github.com/CanardMandarin)! - - Fix broken protobuf generation for `hashMap` fields in IDL.

- [#24](https://github.com/codama-idl/renderers-vixen-parser/pull/24) [`6659519`](https://github.com/codama-idl/renderers-vixen-parser/commit/665951981a2f548b3af34a428130922da46be26c) Thanks [@CanardMandarin](https://github.com/CanardMandarin)! - - Fix broken protobuf generation for optional vectors in IDL.

- [#12](https://github.com/codama-idl/renderers-vixen-parser/pull/12) [`c4f51cd`](https://github.com/codama-idl/renderers-vixen-parser/commit/c4f51cdf3fb2b55b4def6dca8639f83c86be7aa8) Thanks [@kespinola](https://github.com/kespinola)! - - Resolve build error regarding missing static lifetime on `id` method
    - Expand generator support to `i8` and `i16`

## 1.2.6

### Patch Changes

- [#8](https://github.com/codama-idl/renderers-vixen-parser/pull/8) [`eeb61ec`](https://github.com/codama-idl/renderers-vixen-parser/commit/eeb61ec35475991c1128c6bb3affcaf9bd51ae57) Thanks [@lorisleiva](https://github.com/lorisleiva)! - Bump Codama
