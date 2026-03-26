# Contract: Current Design Workspace

**Date**: 2026-03-26  
**Feature**: Replace Legacy Design System With a Full UI Overhaul

## Purpose

Define the minimum ownership and clarity requirements for the `design/` workspace during the redesign.

## Ownership Contract

1. The top-level `design/` folder is the authoritative workspace for current design-definition artifacts used by this feature.
2. The workspace must clearly distinguish current design sources from legacy or reference-only artifacts.
3. A collaborator must be able to identify the current design-system materials without reading application internals first.

## Required Content Domains

The current design workspace MUST communicate:

- visual direction and interaction intent
- color, typography, spacing, surface, and state conventions
- expectations for shared shell and primary-route composition
- relationship between current design artifacts and runtime implementation
- status of any retained legacy references

## Naming Contract

1. Current design-system concepts must use one canonical naming scheme across the active artifacts.
2. Legacy artifact names may remain, but their status must be explicit.
3. Historical mockups or prose documents must not be mistaken for the active source of truth.

## Documentation Contract

1. The workspace must explain which artifacts are current and which are legacy/reference-only.
2. If a legacy artifact remains, it must state why it still exists and how it should be interpreted.

## Failure Conditions

The contract is violated if:

- multiple `design/` artifacts appear equally authoritative for the current redesign
- a legacy mock or design document can reasonably be mistaken for the active source of truth
- the workspace does not explain how the current design system maps to implementation ownership
