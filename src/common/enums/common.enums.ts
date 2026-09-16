export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

/** How a request's branch scope was determined, for auditing 403s. */
export enum BranchScopeSource {
  ROUTE_PARAM = 'route_param',
  QUERY = 'query',
  BODY = 'body',
  ACTOR_DEFAULT = 'actor_default',
}

export enum NotificationAudience {
  CUSTOMER = 'customer',
  STAFF = 'staff',
}
