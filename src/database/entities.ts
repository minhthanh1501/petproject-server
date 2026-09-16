import { Area } from '../modules/areas/entities/area.entity.js';
import { Booking } from '../modules/bookings/entities/booking.entity.js';
import { Booth } from '../modules/booths/entities/booth.entity.js';
import { BoothRequest } from '../modules/booth-requests/entities/booth-request.entity.js';
import { BoothSession } from '../modules/booth-sessions/entities/booth-session.entity.js';
import { Branch } from '../modules/branches/entities/branch.entity.js';
import { BranchCapacitySnapshot } from '../modules/branches/entities/branch-capacity-snapshot.entity.js';
import { Category } from '../modules/categories/entities/category.entity.js';
import { CustomerWarning } from '../modules/customer-warnings/entities/customer-warning.entity.js';
import { Invoice } from '../modules/invoices/entities/invoice.entity.js';
import { InvoiceCounter } from '../modules/invoices/entities/invoice-counter.entity.js';
import { MenuItem } from '../modules/menu-items/entities/menu-item.entity.js';
import { Membership } from '../modules/memberships/entities/membership.entity.js';
import { MembershipUsage } from '../modules/memberships/entities/membership-usage.entity.js';
import { Notification } from '../modules/notifications/entities/notification.entity.js';
import { OrderItem } from '../modules/order-items/entities/order-item.entity.js';
import { Payment } from '../modules/payments/entities/payment.entity.js';
import { Permission } from '../modules/permissions/entities/permission.entity.js';
import { PricingPlan } from '../modules/pricing-plans/entities/pricing-plan.entity.js';
import { RefreshToken } from '../modules/auth/entities/refresh-token.entity.js';
import { Role } from '../modules/roles/entities/role.entity.js';
import { RolePermission } from '../modules/role-permissions/entities/role-permission.entity.js';
import { SessionExtension } from '../modules/booth-sessions/entities/session-extension.entity.js';
import { User } from '../modules/users/entities/user.entity.js';
import { UserRole } from '../modules/user-roles/entities/user-role.entity.js';

/**
 * Explicit list, with autoLoadEntities OFF.
 *
 * autoLoadEntities only works for Nest; the TypeORM CLI would still need its own
 * list, and two lists is how entity sets drift. forFeature stays in every module
 * because that is what provides the DI tokens - it is not the same job.
 */
export const ALL_ENTITIES = [
  Area,
  Booking,
  Booth,
  BoothRequest,
  BoothSession,
  Branch,
  BranchCapacitySnapshot,
  Category,
  CustomerWarning,
  Invoice,
  InvoiceCounter,
  MenuItem,
  Membership,
  MembershipUsage,
  Notification,
  OrderItem,
  Payment,
  Permission,
  PricingPlan,
  RefreshToken,
  Role,
  RolePermission,
  SessionExtension,
  User,
  UserRole,
];
