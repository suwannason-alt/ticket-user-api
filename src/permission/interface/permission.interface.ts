export interface IAccess {
  view: boolean;
  insert: boolean;
  update: boolean;
  delete: boolean;
}

export enum EAction {
  view = 'view',
  insert = 'insert',
  update = 'update',
  delete = 'delete',
}

export enum EAdminFeature {
  CATEGORY = 'Category namagement',
  GROUP = 'Group management',
  ROLE = 'Role management',
  USER = 'User management',
  COMPANY = 'Company management',
}

export enum ETicketFeature {
  TICKET = 'Ticket',
  ASSIGNMENT = 'Assignment',
}

export interface IAllowAction {
  feature: EAdminFeature;
  action: EAction;
}
