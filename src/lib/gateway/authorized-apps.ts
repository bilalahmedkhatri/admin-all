export type AuthorizedApp = {
  id: number;
  name: string;
  owner_user_id: number;
  allowed_origin: string;
  allowed_endpoints: string[];
  is_active: boolean;
  is_approved: boolean;
};
export type GatewayOwner = {
  id: number;
  email: string;
  is_active: boolean;
  api_access_enabled: boolean;
};
export type AppsCatalog = {
  apps: AuthorizedApp[];
  owners: GatewayOwner[];
  endpoints: string[];
};
