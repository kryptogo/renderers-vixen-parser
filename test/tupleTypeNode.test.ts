import {
    accountNode,
    camelCase,
    definedTypeNode,
    rootNode,
    structFieldTypeNode,
    structTypeNode,
    tupleTypeNode,
    booleanTypeNode,
    numberTypeNode,
    definedTypeLinkNode,
} from '@codama/nodes';
import { getFromRenderMap } from '@codama/renderers-core';
import { visit } from '@codama/visitors-core';
import { describe, expect, test } from 'vitest';

import { getRenderMapVisitor } from '../src';
import { codeContains } from './_setup';

describe('tupleTypeNode support', () => {
    test('it renders accounts with tuple type fields', () => {
        // Given a program with a tuple type (like OptionBool from pumpswap)
        const node = rootNode({
            accounts: [
                accountNode({
                    name: 'pool',
                    data: structTypeNode([
                        structFieldTypeNode({
                            name: 'trackVolume',
                            type: definedTypeLinkNode('optionBool'),
                        }),
                    ]),
                }),
            ],
            definedTypes: [
                definedTypeNode({
                    name: 'optionBool',
                    type: tupleTypeNode([
                        booleanTypeNode(numberTypeNode('u8')),
                    ]),
                }),
            ],
            docs: [],
            errors: [],
            instructions: [],
            kind: 'programNode',
            name: camelCase('pumpAmm'),
            origin: 'anchor',
            pdas: [],
            publicKey: 'pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA',
            version: '0.0.0',
        });

        // When we render it
        const renderMap = visit(
            node,
            getRenderMapVisitor({
                projectFolder: 'test',
                projectName: 'pump-amm',
            }),
        );

        // Then tuple type should be handled correctly
        codeContains(getFromRenderMap(renderMap, 'src/generated_parser/accounts_parser.rs').content, [
            'Pool(Pool)',
            'track_volume',
        ]);

        // Proto should also be generated correctly
        const protoContent = getFromRenderMap(renderMap, 'proto/pump_amm.proto').content;
        codeContains(protoContent, [
            'message OptionBool',
            'bool field_0',
        ]);

        // Proto should NOT contain invalid "pub type" syntax (Rust syntax, not proto3)
        expect(protoContent).not.toContain('pub type');

        // IntoProto implementation should be generated for tuple types
        codeContains(getFromRenderMap(renderMap, 'src/generated_parser/proto_helpers.rs').content, [
            'impl IntoProto<proto_def::OptionBool> for OptionBool',
            'field_0:',
        ]);
    });
});
