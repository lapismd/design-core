import React, { useMemo, type CSSProperties, type ReactNode } from "react";
import { addons, type HashEntry } from "storybook/manager-api";
import { styled } from "storybook/theming";
import {
  getTagParts,
  getTagPrefix,
  getTagSuffix,
  matchTags,
  type Badge,
  type BadgeOrBadgeFn,
  type TagBadgeParameters,
} from "storybook-addon-tag-badges/manager-helpers";

/**
 * Storybook paints StatusButton as a flex sibling of the leaf link inside
 * `.sidebar-item` (already `position: relative`). Tag chips are pinned to that
 * row so they stay in one column whether or not a status glyph is present —
 * no status-store detection / margin guessing.
 */
const STATUS_SLOT_PX = 28;
/** Clearance between tag chips and the status glyph (avoids status shadow bleed). */
const STATUS_GAP_PX = 8;
const TAG_SLOT_PX = 18;
const COL_GAP_PX = 6;
const TRAILING_RESERVE_PX = TAG_SLOT_PX + COL_GAP_PX + STATUS_GAP_PX + STATUS_SLOT_PX;

const Row = styled.div({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  alignItems: "center",
  width: "100%",
  minWidth: 0,
  // Keep the story name clear of the absolute tag column + status band.
  paddingRight: TRAILING_RESERVE_PX,
  boxSizing: "border-box",
});

const Label = styled.div({
  display: "flex",
  alignItems: "center",
  minHeight: 19,
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

/**
 * Avatar-style overlap, anchored to the sidebar item’s trailing edge (just
 * left of the status slot).
 */
const Stack = styled.div(({ theme }) => ({
  position: "absolute",
  right: STATUS_SLOT_PX + STATUS_GAP_PX,
  top: "50%",
  transform: "translateY(-50%)",
  display: "inline-flex",
  flexDirection: "row",
  alignItems: "center",
  height: TAG_SLOT_PX,
  // Match sidebar chrome so the ring reads as a cutout, not a halo.
  ["--tag-stack-ring" as string]:
    theme.base === "dark" ? theme.background.content : theme.background.app,
}));

const Chip = styled.div(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: TAG_SLOT_PX,
  height: TAG_SLOT_PX,
  minWidth: TAG_SLOT_PX,
  padding: 0,
  borderRadius: "50%",
  fontSize: 11,
  lineHeight: 1,
  fontWeight: 700,
  color: "#ffffff",
  boxSizing: "border-box",
  // Avatar group ring (`ring-background` analogue).
  boxShadow: `0 0 0 1.5px var(--tag-stack-ring, ${theme.background.app})`,
  position: "relative",
  "&:not(:first-of-type)": {
    marginLeft: -6,
  },
}));

type ResolvedBadge = {
  tag: string;
  badge: Badge;
};

function resolveBadge(
  badge: BadgeOrBadgeFn,
  entry: HashEntry,
  tag: string,
): Badge {
  return typeof badge === "function"
    ? badge({
        context: "sidebar",
        entry,
        getTagParts,
        getTagPrefix,
        getTagSuffix,
        tag,
      })
    : badge;
}

function sidebarAllowsType(
  display: TagBadgeParameters[number]["display"],
  type: HashEntry["type"],
): boolean {
  const sidebar = display?.sidebar;
  if (sidebar == null) {
    return (
      type === "story" ||
      type === "docs" ||
      type === "component" ||
      type === "group"
    );
  }
  const conditions = Array.isArray(sidebar) ? sidebar : [sidebar];
  return conditions.some((condition) => {
    if (condition === true) return true;
    if (condition === false) return false;
    if (typeof condition === "string") return condition === type;
    if (typeof condition === "object" && condition != null) {
      return condition.type === type;
    }
    return false;
  });
}

/** All matching badges in config order (not just the first). */
export function collectSidebarBadges(item: HashEntry): ResolvedBadge[] {
  if (
    item.type !== "story" &&
    item.type !== "docs" &&
    item.type !== "component" &&
    item.type !== "group"
  ) {
    return [];
  }
  const parameters = (addons.getConfig().tagBadges ?? []) as TagBadgeParameters;
  const tags = item.tags ?? [];
  const out: ResolvedBadge[] = [];

  for (const config of parameters) {
    if (!sidebarAllowsType(config.display, item.type)) continue;
    for (const tag of matchTags(tags, config.tags)) {
      if (out.some((entry) => entry.tag === tag)) continue;
      out.push({
        tag,
        badge: resolveBadge(config.badge, item, tag),
      });
    }
  }
  return out;
}

function StackedSidebarLabel({ item }: { item: HashEntry }) {
  const badges = useMemo(() => collectSidebarBadges(item), [item]);
  const title = badges
    .map((entry) => {
      const label =
        typeof entry.badge.tooltip === "string"
          ? entry.badge.tooltip
          : entry.badge.text;
      return label;
    })
    .join(" · ");

  return React.createElement(
    Row,
    null,
    React.createElement(Label, null, item.name),
    badges.length
      ? React.createElement(
          Stack,
          { title: title || undefined, "aria-label": title || undefined },
          ...badges.map((entry, index) => {
            const style = {
              ...(typeof entry.badge.style === "object" &&
              entry.badge.style != null
                ? entry.badge.style
                : {}),
              zIndex: badges.length - index,
            } as CSSProperties;
            return React.createElement(
              Chip,
              {
                key: entry.tag,
                style,
                "data-tag": entry.tag,
              },
              entry.badge.text,
            );
          }),
        )
      : null,
  );
}

/**
 * Replaces the tag-badges addon's single-badge `renderLabel` so multiple
 * matching tags stack like an avatar group (e.g. Approved + Upstream).
 */
export function stackedRenderLabel(item: HashEntry): ReactNode | undefined {
  if (
    item.type !== "story" &&
    item.type !== "group" &&
    item.type !== "docs" &&
    item.type !== "component"
  ) {
    return undefined;
  }
  return React.createElement(StackedSidebarLabel, { item });
}
