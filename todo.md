# Restaurant System TODO

## Phase 1: Database Schema & Seed Data
- [x] Design database schema (users, categories, menuItems, customizations, orders, orderItems, etc.)
- [x] Create Drizzle schema in drizzle/schema.ts
- [x] Run pnpm db:push to create tables
- [ ] Create seed data script with sample categories, menu items, and customizations

## Phase 2: tRPC Routers
- [x] Create menu router (list categories, list menu items, get menu item details)
- [x] Create orders router (create order, list user orders, get order details, update order status)
- [x] Create admin router (list all orders, update order status, assign rider)
- [x] Create kitchen router (list pending orders, update order status)
- [ ] Create rider router (list assigned deliveries, update delivery status)
- [ ] Create customizations router (list customization options and values)
- [x] Add database query helpers in server/db.ts

## Phase 3: Customer UI - Browse & Order
- [x] Create Home page with category list and featured items
- [x] Create Menu page with category filtering and menu items grid
- [x] Create MenuItem detail modal with customization options
- [ ] Create Cart page with item list, quantity controls, and price summary
- [x] Create Checkout page with delivery address form and payment method selection
- [x] Implement add to cart, remove from cart, update quantity functionality
- [x] Add toast notifications for user feedback

## Phase 4: Order Tracking UI
- [x] Create OrderTracking page showing order status with timeline
- [x] Display order items, delivery address, and total price
- [x] Show real-time status updates (pending → confirmed → preparing → ready → delivering → completed)
- [ ] Add estimated delivery time display
- [x] Create order history page for customers

## Phase 5: Admin Dashboard
- [x] Create Admin layout with sidebar navigation
- [x] Create Orders management page (list all orders, filter by status, view details)
- [ ] Create Menu management page (add/edit/delete menu items, upload images)
- [ ] Create Categories management page
- [ ] Create Customizations management page
- [ ] Create Riders management page (list riders, assign deliveries)
- [x] Add order status update functionality
- [ ] Add rider assignment functionality

## Phase 6: Kitchen & Rider Dashboards
- [x] Create Kitchen Dashboard showing pending orders
- [x] Add order preparation status update (preparing → ready)
- [ ] Create Rider Dashboard showing assigned deliveries
- [ ] Add delivery status tracking (picked up → on way → delivered)
- [ ] Add location tracking for riders (if needed)

## Phase 7: Testing & Refinement
- [x] Write unit tests for critical procedures
- [ ] Test order creation flow end-to-end
- [x] Test role-based access control
- [ ] Test real-time status updates
- [ ] Test payment method selection
- [ ] Test customization selection and pricing

## Phase 8: Deployment
- [ ] Build and deploy to Vercel
- [ ] Test all features on production
- [ ] Configure environment variables
- [ ] Monitor for errors and performance issues
