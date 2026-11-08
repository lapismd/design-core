import { expect, test, type Page } from "@playwright/test";
import { waitForVisualStoryFinished } from "@lapismd/storybook-addon-visual-delta/playwright";

const storyId = "workspace-components-kanban-board--full-board";

async function openStory(page: Page, id: string): Promise<void> {
  await page.goto(`/iframe.html?id=${id}&viewMode=story`);
  await page.waitForLoadState("domcontentloaded");
  await waitForVisualStoryFinished(page, id, 45_000);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

async function dragWithPause(
  page: Page,
  source: { x: number; y: number },
  target: { x: number; y: number },
): Promise<void> {
  await page.mouse.move(source.x, source.y);
  await page.mouse.down();
  await page.mouse.move(target.x, target.y, { steps: 12 });
  // Give dnd-kit one more motion frame so its collision detection settles
  // on the destination before release.
  await page.mouse.move(target.x + 1, target.y);
  await page.waitForTimeout(150);
}

test.describe("Kanban board real pointer behavior", () => {
  test("dragging a card onto another column moves it and expands the target", async ({
    page,
  }) => {
    await openStory(page, storyId);

    const backlog = page.getByRole("group", { name: "Backlog", exact: true });
    const inProgress = page.getByRole("group", {
      name: "In Progress",
      exact: true,
    });

    const card = backlog.getByRole("button", {
      name: /Open card: Draft the release announcement/,
    });
    await expect(card).toBeVisible();
    await expect(inProgress).toHaveClass(/is-collapsed/);

    const sourceBounds = await card.boundingBox();
    const targetBounds = await inProgress.boundingBox();
    expect(sourceBounds).not.toBeNull();
    expect(targetBounds).not.toBeNull();

    await dragWithPause(
      page,
      {
        x: sourceBounds!.x + sourceBounds!.width / 2,
        y: sourceBounds!.y + sourceBounds!.height / 2,
      },
      {
        x: targetBounds!.x + targetBounds!.width / 2,
        y: targetBounds!.y + targetBounds!.height / 2,
      },
    );

    // While hovering, the destination column shows its drop-target paint and
    // the dragged card renders in the drag overlay.
    await expect(inProgress).toHaveClass(/is-drop-target/);
    const ghost = page.locator(".kanban-card--overlay");
    await expect(ghost).toBeVisible();

    // The drag ghost must match the legacy Fizzy overlay card exactly:
    // 18rem fixed width, 0.3rem radius, px-4/py-3 padding, ring-1 black/10
    // plus the 0 12px 32px drop shadow, and the reference typography.
    const ghostStyles = await ghost.evaluate((el) => {
      const cs = getComputedStyle(el);
      const status = el.querySelector(".kanban-card-overlay-status");
      const title = el.querySelector(".kanban-card-overlay-title");
      const statusCs = status ? getComputedStyle(status) : null;
      const titleCs = title ? getComputedStyle(title) : null;
      return {
        width: cs.width,
        minWidth: cs.minWidth,
        maxWidth: cs.maxWidth,
        borderRadius: cs.borderRadius,
        padding: cs.padding,
        boxShadow: cs.boxShadow,
        pointerEvents: cs.pointerEvents,
        statusFont: statusCs
          ? `${statusCs.fontSize} ${statusCs.fontWeight} ${statusCs.textTransform} ${statusCs.opacity}`
          : null,
        titleFont: titleCs
          ? `${titleCs.fontSize} ${titleCs.fontWeight} ${titleCs.lineHeight} ${titleCs.marginTop}`
          : null,
      };
    });
    expect(ghostStyles.width).toBe("288px");
    expect(ghostStyles.minWidth).toBe("288px");
    expect(ghostStyles.maxWidth).toBe("288px");
    expect(ghostStyles.borderRadius).toBe("4.8px");
    expect(ghostStyles.padding).toBe("12px 16px");
    expect(ghostStyles.pointerEvents).toBe("none");
    expect(ghostStyles.boxShadow).toContain(
      "rgba(0, 0, 0, 0.1) 0px 0px 0px 1px",
    );
    expect(ghostStyles.boxShadow).toContain(
      "rgba(17, 24, 39, 0.18) 0px 12px 32px",
    );
    expect(ghostStyles.statusFont).toBe("11.2px 900 uppercase 0.7");
    expect(ghostStyles.titleFont).toBe("16px 900 20px 4px");
    await expect(ghost).toContainText("Draft the release announcement");

    await page.mouse.up();

    await expect(
      inProgress.getByRole("button", {
        name: /Open card: Draft the release announcement/,
      }),
    ).toBeVisible();
    await expect(
      backlog.getByRole("button", {
        name: /Open card: Draft the release announcement/,
      }),
    ).toHaveCount(0);
    await expect(inProgress).toHaveClass(/is-expanded/);
    await expect(page.locator("output.sr-only")).toHaveText(
      "Moved Draft the release announcement to In Progress",
    );
    // dnd-kit's own live region announces the completed drop.
    await expect(page.locator("#dnd-kit-announcement-0")).toContainText(
      "was dropped",
    );
  });
});
