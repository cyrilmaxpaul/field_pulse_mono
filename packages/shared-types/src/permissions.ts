export const PERMISSION_CATALOG = [
  { key: "inspection.read", description: "View inspections" },
  { key: "inspection.create", description: "Create inspections" },
  { key: "inspection.update", description: "Edit inspection responses" },
  { key: "inspection.submit", description: "Submit inspections" },
  { key: "inspection.review", description: "Review submitted inspections" },
  { key: "inspection.approve", description: "Approve or request rework" },
  { key: "site.manage", description: "Create, edit, and archive sites" },
  { key: "template.manage", description: "Create, edit, publish, and archive inspection templates" },
  { key: "user.manage", description: "Manage users and roles" },
  { key: "report.read", description: "View reports and analytics" },
  { key: "audit.read", description: "View audit log" },
] as const;

export type PermissionKey = (typeof PERMISSION_CATALOG)[number]["key"];
