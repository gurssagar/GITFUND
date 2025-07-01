// Simple in-memory mock database for testing
export const db = {
  select: () => ({
    from: () =>
      Promise.resolve([
        {
          id: 1,
          projectName: "Test Project",
          Contributor_id: "TEST123",
          issue: "Test issue",
        },
      ]),
  }),
  insert: () => ({
    values: () => Promise.resolve({ success: true }),
  }),
};
