# Tool Call container width and fixed disclosure icons

Enclosing change uurqlmls; DC-AI-015. The public tool-width token preserves the
42rem default while allowing explicit full-container presentation. Disclosure
icons no longer shrink beside long retained titles; status and exact call
identity are unchanged.

Before: the source layout story failed 1/1, measuring 672px against its 800px
container. The live consumer measured a 672px group in a 988px body and a first
call chevron only 4.40625px wide by 14px high. Source regression covers wide and
narrow containers, grouped and single calls, fixed chevrons and keyboard detail
expansion. The three directly affected ToolCalls families pass 10/10 in a fresh
runner. The live consumer now measures 798/798px with every disclosure icon
14x14px; its affected story families pass 11/11. Wider source qualification is
recorded in [shared chat qualification](shared-chat-qualification.md).
Visual baselines and publication are separate and have not been requested.
