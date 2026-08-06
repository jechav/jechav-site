# Modal Padding Design

## Goal

Give the Prompt Modal a consistent 16px internal inset in both New Prompt
and Edit Prompt modes.

## Design

`apps/prompts/src/components/PromptModal.astro` provides the shared modal for
both modes. Update `.modal-inner` from asymmetric padding to `1rem`, which is
16px on every side. No markup, behavior, or responsive sizing changes are
needed.

## Validation

Run the Prompt Library test suite after the CSS-only change.
