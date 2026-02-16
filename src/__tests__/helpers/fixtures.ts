import { Secret } from "effect";
import type { EdlinkConfigData } from "../../config.js";

// ---------------------------------------------------------------------------
// Test configuration — plain EdlinkConfigData, no Layer needed
// ---------------------------------------------------------------------------

export const testConfig: EdlinkConfigData = {
  clientSecret: Secret.fromString("test-secret"),
  apiBaseUrl: "https://test.edlink.api",
  defaultMaxPages: 3,
};

// ---------------------------------------------------------------------------
// Assignment fixture — fully valid against the Assignment schema
// ---------------------------------------------------------------------------

export const assignmentFixture = {
  id: "asgn-001",
  title: "Week 3 Reading Response",
  description: "<p>Read chapter 3 and respond.</p>",
  description_plaintext: "Read chapter 3 and respond.",
  state: "open" as const,
  assignee_mode: "all" as const,
  assignee_ids: [],
  category_id: null,
  session_id: "session-001",
  grading_type: "points",
  max_attempts: 1,
  points_possible: 100,
  submission_types: ["online_text_entry"],
  attachments: [
    {
      type: "link" as const,
      url: "https://example.com/chapter3.pdf",
      title: "Chapter 3",
    },
  ],
  properties: {},
  display_date: null,
  due_date: "2026-03-01T23:59:59.000Z",
  start_date: "2026-02-15T00:00:00.000Z",
  end_date: null,
  created_date: "2026-02-10T12:00:00.000Z",
  updated_date: "2026-02-10T12:00:00.000Z",
};

/**
 * Build a second assignment fixture with a different ID and title
 * — useful for multi-item / paginated tests.
 */
export const assignmentFixture2 = {
  ...assignmentFixture,
  id: "asgn-002",
  title: "Week 4 Essay",
};

export const assignmentFixture3 = {
  ...assignmentFixture,
  id: "asgn-003",
  title: "Week 5 Lab Report",
};
