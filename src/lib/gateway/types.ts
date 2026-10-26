export type Role = "admin" | "operator" | "viewer";
export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  approved: number;
  active: number;
  status: string;
  created_at: string;
  grants: string;
  credential_ids: string;
  page_permissions: string;
  sections: string[];
  components: string[];
};
export type Credential = {
  id: number;
  label: string;
  kind: "admin" | "app";
  app_origin: string | null;
  created_at: string;
};
export type ActivityRow = {
  id: number;
  name: string;
  action: string;
  target: string;
  status: number;
  created_at: string;
};
