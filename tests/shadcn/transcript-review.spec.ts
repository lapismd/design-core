import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

async function open(page: Page, scenario: string) {
  const id = `chat-transcript--${scenario}`;
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await waitForVisualStoryFinished(page, id);
  await expect(page.locator('[data-ui-component="transcript"]')).toBeVisible();
}

test("sent-context disclosure precedes the prompt and preserves unknown delivery", async ({
  page,
}) => {
  await open(page, "full-conversation-with-context-tools-and-replies");
  const prompt = page.locator('[data-chat-item="delta-0"]');
  const context = prompt.getByRole("button", {
    name: "Context delivery unknown",
    exact: true,
  });
  await expect(context).toBeVisible();
  await expect(context).toHaveAttribute("aria-expanded", "false");
  await context.click();
  await expect(
    prompt.getByRole("region", {
      name: "Application context for this message",
      exact: true,
    }),
  ).toBeVisible();
  expect(
    await prompt.evaluate((el) => {
      const context = el.querySelector('[data-ui-component="sent-context"]')!;
      const message = el.querySelector(".ui-transcript-message")!;
      return !!(
        context.compareDocumentPosition(message) &
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    }),
  ).toBe(true);
  await expect(prompt).toContainText(
    "Demonstration context; delivery is not captured in this recording.",
  );
});

test("busy-agent queues and footer retain host-owned cancellation and stop state", async ({
  page,
}) => {
  await open(page, "busy-agent-and-queued-messages");
  const queue = page.getByRole("region", { name: "Queued messages" });
  await expect(queue).toBeVisible();
  await expect(queue.getByRole("article")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Queue message", exact: true })
    .click();
  await expect(queue.getByRole("article")).toHaveCount(2);
  await expect(
    page.getByRole("textbox", { name: "Message", exact: true }),
  ).toHaveText("");
  await queue
    .getByRole("button", {
      name: "Cancel queued message for Assistant",
      exact: true,
    })
    .first()
    .click();
  await expect(queue.getByText("Assistant · Cancelling…")).toBeVisible();
  await expect(queue.getByRole("article")).toHaveCount(2);
  await expect(
    queue
      .getByRole("button", {
        name: "Cancel queued message for Assistant",
        exact: true,
      })
      .first(),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Stop agent", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Stopping agent", exact: true }),
  ).toBeDisabled();
  await expect(queue.getByRole("article")).toHaveCount(2);
});

test("footer actions and controls stay outside the transcript scroll body", async ({
  page,
}) => {
  await open(page, "continuous-document");
  const footer = page.locator('[data-ui-component="transcript-footer"]');
  const before = await footer.boundingBox();
  await page
    .locator('.ui-transcript-viewport > [data-ui-part="scroll-area-viewport"]')
    .evaluate((el) => (el.scrollTop = el.scrollHeight));
  const after = await footer.boundingBox();
  expect(Math.abs(after!.y - before!.y)).toBeLessThan(1);
  await page
    .getByRole("button", { name: "Attach context", exact: true })
    .click();
  await expect(page.getByTestId("transcript-result")).toHaveText(
    "Host context action requested",
  );
  await page.getByRole("button", { name: "Choose model", exact: true }).click();
  await page.getByRole("menuitem", { name: "Fast model", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Choose model", exact: true }),
  ).toHaveText("Fast model");
});

test("an idle agent offers Send even with a persistent stop callback", async ({
  page,
}) => {
  await open(page, "busy-agent-and-queued-messages");
  await expect(
    page.getByRole("button", { name: "Queue message", exact: true }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Mark agent idle", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Send message", exact: true }),
  ).toBeEnabled();
  await expect(
    page
      .getByRole("button", { name: "Send message", exact: true })
      .locator("svg"),
  ).toHaveClass(/lucide-send-horizontal/);
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.getByTestId("transcript-result")).toHaveText(
    "Message submitted",
  );
  await expect(
    page.getByRole("region", { name: "Queued messages" }).getByRole("article"),
  ).toHaveCount(1);
});

test("full document footer transitions between running, queueing and acknowledged idle", async ({
  page,
}) => {
  await open(page, "full-conversation-with-context-tools-and-replies");
  const input = page.getByRole("textbox", { name: "Message", exact: true });
  const stop = page.getByRole("button", { name: "Stop agent", exact: true });
  const send = page.getByRole("button", { name: "Send message", exact: true });
  const queue = page.getByRole("button", {
    name: "Queue message",
    exact: true,
  });
  await expect(stop.locator("svg")).toHaveClass(/lucide-square/);
  await input.fill("Queue this while running.");
  await expect(queue).toBeEnabled();
  await expect(queue.locator("svg")).toHaveClass(/lucide-arrow-up/);
  await queue.click();
  await expect(input).toBeEmpty();
  await expect(stop).toBeEnabled();
  await stop.click();
  await expect(send).toBeDisabled();
  await expect(send.locator("svg")).toHaveClass(/lucide-send-horizontal/);
  await expect(page.getByTestId("transcript-result")).toHaveText(
    "Agent stopped",
  );
  await input.fill("Start the next response.");
  await expect(send).toBeEnabled();
  await send.click();
  await expect(input).toBeEmpty();
  await expect(stop).toBeEnabled();
  await input.fill("Another follow-up while running.");
  await expect(queue.locator("svg")).toHaveClass(/lucide-arrow-up/);
  await expect(queue).toBeEnabled();
});

test("quoted list rows retain compact spacing and the host foreground", async ({
  page,
}) => {
  await open(page, "quoted-lists-and-typography");
  const quote = page.locator(".ui-transcript-comment-quote").first();
  await quote.scrollIntoViewIfNeeded();
  const items = quote.locator("li");
  await expect(items).toHaveCount(2);
  const layout = await items.evaluateAll((nodes) =>
    nodes.map((el) => {
      const css = getComputedStyle(el);
      return {
        y: el.getBoundingClientRect().y,
        height: el.getBoundingClientRect().height,
        leading: parseFloat(css.lineHeight),
        margin: css.marginBlockStart,
        padding: css.paddingBlockStart,
        whiteSpace: css.whiteSpace,
      };
    }),
  );
  expect(layout[1]!.y - layout[0]!.y).toBeLessThanOrEqual(
    layout[0]!.leading + 1,
  );
  expect(layout[0]!.padding).toBe("0px");
  expect(layout[0]!.whiteSpace).toBe("normal");
});

test("unavailable-source banners share curved top and bottom status presentation", async ({
  page,
}) => {
  for (const [story, position, tone] of [
    ["changed-source-retains-quote", "top", "warning"],
    ["unavailable-status-below", "bottom", "error"],
  ]) {
    await open(page, story!);
    const status = page
      .locator(
        '.ui-transcript-comment-area > [data-ui-component="composer-status-banner"]',
      )
      .first();
    await expect(status).toHaveAttribute("data-position", position!);
    await expect(status).toHaveAttribute("data-status", tone!);
    await expect(status).toContainText(
      "Original content unavailable or changed.",
    );
    const corners = await status.evaluate((el) => {
      const css = getComputedStyle(el);
      return {
        top: css.borderTopLeftRadius,
        bottom: css.borderBottomLeftRadius,
      };
    });
    expect(position === "top" ? corners.top : corners.bottom).not.toBe("0px");
  }
});

test("external controllers retain message reaction callbacks and author popover actions", async ({
  page,
}) => {
  await open(page, "message-reactions-and-author-profiles");
  const reader = page.getByRole("textbox", {
    name: "Implementation summary",
    exact: true,
  });
  await reader.hover();
  await page
    .getByRole("button", {
      name: "Add reaction to Implementation summary",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "React with thumbs up", exact: true })
    .click();
  const reaction = page.getByRole("button", {
    name: "1 reaction with 👍",
    exact: true,
  });
  await expect(reaction).toHaveAttribute("aria-pressed", "true");
  await reaction.click();
  await expect(reaction).toHaveCount(0);
  await reader.hover();
  await page
    .getByRole("button", {
      name: "Add reaction to Implementation summary",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "React with Project spark", exact: true })
    .click();
  const custom = page.getByRole("button", {
    name: "1 reaction with Project spark",
    exact: true,
  });
  await expect(custom).toHaveAttribute("aria-pressed", "true");
  await expect(custom.locator("img")).toHaveAttribute(
    "src",
    /^data:image\/svg\+xml/,
  );
  await custom.click();
  await expect(custom).toHaveCount(0);
  const author = page
    .getByRole("button", { name: "About Alex Morgan", exact: true })
    .first();
  await author.focus();
  await page.keyboard.press("Enter");
  const details = page.getByRole("dialog", {
    name: "About Alex Morgan",
    exact: true,
  });
  await expect(details).toBeVisible();
  await expect(details).toContainText("Project maintainer");
  await details
    .getByRole("button", { name: "View profile", exact: true })
    .click();
  await expect(details).toHaveCount(0);
  await expect(author).toBeFocused();
  await expect(page.getByTestId("transcript-result")).toHaveText(
    "Profile: Alex Morgan",
  );
  await page.keyboard.press("Enter");
  await expect(details).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(details).toHaveCount(0);
  await expect(author).toBeFocused();
});

test("unknown queue outcomes remain visible after a host review request", async ({
  page,
}) => {
  await open(page, "queue-needs-attention");
  await page
    .getByRole("button", {
      name: "Check message status for Assistant",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Assistant · Delivery needs attention"),
  ).toBeVisible();
  await expect(
    page.getByText("The host has not confirmed delivery."),
  ).toBeVisible();
  await expect(page.getByTestId("transcript-result")).toHaveText(
    "Status review requested; delivery remains unknown",
  );
});

test("recorded session preserves grouped tools, XML context and linked agent replies", async ({
  page,
}) => {
  await open(page, "full-conversation-with-context-tools-and-replies");
  await expect(page.locator('[data-chat-item="delta-0"]')).toContainText(
    "Would like to extend",
  );
  expect(
    await page.locator(".ui-transcript-tool-summary").count(),
  ).toBeGreaterThan(0);
  await expect(
    page.locator(".ui-transcript-tool-summary > svg").first(),
  ).toBeVisible();
  const group = page.locator(".ui-transcript-tool-summary").first();
  await group.click();
  const rows = page.locator(".ui-transcript-tool-group-content").first();
  await expect(rows).toHaveCSS("row-gap", "4px");
  await expect(
    rows.locator(".ui-transcript-tool-trigger > svg").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Agent response · Review screen-only bedtime action",
      exact: true,
    }),
  ).toHaveAttribute("aria-expanded", "true");
  const context = page.getByRole("button", { name: /^<subagent-completion / });
  await expect(context).toBeVisible();
  await context.click();
  await expect(
    page.getByText("No actionable regressions found in the current changes.", {
      exact: true,
    }),
  ).toBeVisible();
  const reply = page.locator(
    '[data-chat-item="demo-review:permissions/reply"]',
  );
  await reply.scrollIntoViewIfNeeded();
  await expect(reply).toContainText("Simulated reply");
  await expect(reply).toContainText("Demo review");
});

test("collapsed files show the last comment and expansion restores the discussion", async ({
  page,
}) => {
  await open(page, "full-conversation-with-context-tools-and-replies");
  const edit = page.locator('[data-chat-item="delta-19/group"]');
  const file = edit.locator(".ui-transcript-tool-file").first();
  await file
    .getByRole("button", {
      name: "Hide captured file Sources/BedtimeCore/Schedule.swift",
      exact: true,
    })
    .click();
  const discussion = file.locator('[data-thread-id="demo-review:action"]');
  await expect(discussion.locator("[data-comment-id]")).toHaveCount(1);
  await expect(discussion).toContainText("keep the existing shutdown default");
  await expect(discussion).not.toContainText(
    "keep screen blocking separate from shutdown",
  );
  await file
    .getByRole("button", {
      name: "Show captured file Sources/BedtimeCore/Schedule.swift",
      exact: true,
    })
    .click();
  await expect(discussion.locator("[data-comment-id]")).toHaveCount(2);
  await expect(discussion).toContainText(
    "keep screen blocking separate from shutdown",
  );
  await expect(discussion).toContainText("keep the existing shutdown default");
  await edit
    .getByRole("button", {
      name: "Hide details for Applied 6 edits across 6 files",
      exact: true,
    })
    .click();
  await expect(
    edit.locator('[data-thread-id="demo-review:action"] [data-comment-id]'),
  ).toHaveCount(1);
  await expect(
    edit.locator('[data-thread-id="demo-review:action"]'),
  ).toContainText("keep the existing shutdown default");
  await page.getByRole("button", { name: "Classic", exact: true }).click();
  await expect(
    edit.locator('[data-thread-id="demo-review:action"] [data-comment-id]'),
  ).toHaveCount(1);
});

test("nested file and thinking disclosures have distinct leading icons", async ({
  page,
}) => {
  await open(page, "full-conversation-with-context-tools-and-replies");
  const file = page
    .locator('[data-chat-item="delta-19/group"] .ui-transcript-file-trigger')
    .first();
  await expect(file.locator(":scope > svg")).toBeVisible();
  const thinking = page
    .locator('[data-kind="reasoning"] .ui-transcript-context-trigger')
    .first();
  await expect(thinking.locator(":scope > svg")).toBeVisible();
  const firstElement = await file.evaluate(
    (element) => element.firstElementChild?.tagName,
  );
  expect(firstElement).toBe("svg");
  await expect(thinking.locator(":scope > svg")).toHaveAttribute(
    "aria-hidden",
    "true",
  );
});

test("recorded agent context is visible by default in the full transcript", async ({
  page,
}) => {
  await open(page, "full-conversation-with-context-tools-and-replies");
  const context = page.getByRole("button", { name: /^<subagent-completion / });
  await expect(context).toBeVisible();
  await context.click();
  await expect(
    page.getByText("No actionable regressions found in the current changes.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page
      .locator("[data-prompt-element] strong")
      .filter({ hasText: "Policy gating:" }),
  ).toBeVisible();
});
