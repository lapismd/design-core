# Tool Call hover inset

Enclosing change uurqlmls. DC-AI-015 adds the opt-in
`--ui-ai-chat-tool-trigger-padding-inline` token at the single/group trigger.
The zero default preserves existing call geometry. Status, details, exact
identity and per-call wrapper behavior remain unchanged.

Before, the jj-store row placed 8px outside the trigger, leaving the first icon
flush against its hover fill. The token puts the same inset inside the actual
hit surface. The source story measures icon-to-trigger spacing, checks its
stable position on hover and opens real details. All three directly affected
ToolCalls families pass 10/10 in a fresh runner, and the consumer's affected
families pass 11/11. Wider source qualification is recorded in
[shared chat qualification](shared-chat-qualification.md). Visual comparison,
baseline approval and publication remain separate.
