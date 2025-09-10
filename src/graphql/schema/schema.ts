import { graphql } from "graphql";

const typeDefs = `#graphql

type Mutation {

  # Auth
  signup(input: SignupInput!): SignupResponse!
  login(loginIdentifier: String!, password: String!): LoginUser!
  verifyEmailOtp(email: String!, otp: String!): UserWithoutPassword!
  resendEmailOTP(email: String!): ResendEmailOtpResponse!
  verifyOrderOtp(email: String!, otp: String!): VerifyOtpResponse!
  verifyEmailUpdateOtp(email: String!, otp: String!): UserWithoutPassword!
  verifyPasswordResetOtp(
    email: String!
    otp: String!
  ): VerifyResetPasswordOtpResponse!

  # Admin
  updateUserOrderStatus(
    orderId: String!
    newStatus: OrderStatus!
  ): UpdateUserOrderStatusResponse!
  initiateRefundOrder(orderId: String!): RefundOrderResponse!
  confirmRefundOrder(orderId: String!): RefundOrderResponse!

  # User
  updateUserRole(userId: ID!, newRole: Role!): UserWithoutPassword!
  deactivateUser(userId: ID!): User!
  activateUser(userId: ID!): User!
  banUser(userId: ID!): UserWithoutPassword!
  updateUserProfile(input: UpdateUserProfileInput): UserWithoutPassword!
  updateUserEmail(input: UpdateUserEmailInput!): UserWithoutPassword!
  updatePassword(
    currentPassword: String!
    newPassword: String!
  ): PasswordUpdateResponse!
  verifyResetPasswordOtp(
    email: String!
    otp: String!
  ): VerifyResetPasswordOtpResponse!
  initiateResetPassword(email: String!): InitiateResetPasswordResponse!
  resetPassword(
    email: String!
    newPassword: String!
    reenterPassword: String!
  ): ResetPasswordResponse!
  deleteAccount(email: String!, password: String!): DeleteAccountResponse!

  # Product
  addProduct(productInput: ProductInput!): Product!
  uploadBulkProductsJSON(file: Upload!): BulkProductResponse!
  updateProduct(id: Int!, input: UpdateProductInput): Product!
  removeProduct(id: Int!): RemoveProductResponse!

  # Category
  addCategory(categoryInput: CategoryInput!): AddCategoryResponse!
  uploadBulkCategoriesJSON(file: Upload!): BulkCategoryResponse!
  updateCategory(
    slug: String!
    categoryInput: UpdateCategoryInput!
  ): UpdateCategoryResponse!
  removeCategory(slug: String!): RemoveCategoryResponse!

  # Cart
  addToCart(input: AddToCartInput!): AddCartResponse!
  updateUserCart(productId: Int!, quantity: Int!): UpdateCartResponse!
  removeCartItem(productId: Int!): RemoveCartResponse!
  clearCartItems: ClearCartResponse!

  # Order
  placeOrder(input: PlaceOrderInput!): PlaceOrderResponse!
  placeOrderFromCart(
    paymentMethod: PaymentMethod!
    shippingAddress: ShippingAddressInput!
  ): PlaceOrderResponse!
  cancelOrder(orderId: String!, reason: String!): CancelOrderResponse!
  returnOrder(orderId: String!, reason: String!): ReturnOrderResponse!

  # Banner
  addBanner(
    imageUrl: String!
    title: String
    description: String
  ): Banner!

  updateBanner(
    id: ID!
    imageUrl: String
    title: String
    description: String
    isActive: Boolean
  ): Banner

  deleteBanner(id: ID!): Boolean!
}

type Query {

  ping: Boolean!

  # Users
  getCurrentUser: UserWithoutPassword!
  getUser(username: String, email: String, userId: String): UserWithoutPassword!
  getUsers: [UserWithoutPassword!]!
  getUserById(id: ID!): UserWithoutPassword!
  getUsersByRole(role: Role!): [UserWithoutPassword!]!
  getAdminUsers: [UserWithoutPassword!]!
  getUsersByStatus(isActive: Boolean!): [UserWithoutPassword!]
  getAdmin(adminId: ID, name: String, email: String, username: String): User!
  getDeactivatedUsers: [UserWithoutPassword!]!
  getActiveUsers: [UserWithoutPassword!]!
  getBannedUsers: [UserWithoutPassword!]!

  # Products
  getAllProducts(limit: Int, skip: Int): FetchProductsResponse!
  getProductById(id: Int!): Product!
  getProductsByIds(ids: [Int!]!): [Product]
  searchProducts(query: String!, limit: Int, skip: Int): FetchProductsResponse!

  # Categories
  getCategories: [Category!]!
  getProductsByCategory(categorySlug: String!): FetchProductsResponse!
  searchByCategory(categorySlug: String!): [Category!]

  # Cart
  getUserCart: UserCart!

  # Order
  getAllUserOrder: [UserOrder!]!
  getOrderById(orderId: String!): UserOrder
  getOrderStatus(orderId: String!): GetOrderStatusResponse
  getUserOrderByStatus(status: OrderStatus!): [UserOrder!]!

  # Admin order actions
  getAllOrdersAdmin: [UserOrder]
  getAllOrderByStatusAdmin(status: String!): [UserOrder!]
  getAdminDashboardStats: AdminDashboardStats!

  # Banner
  getAllBanners: [Banner!]!
  getBannerById(id: String!): Banner!
}

type LoginUser {
  id: ID!
  username: String!
  email: String!
  role: Role!
  token: String!
}

input SignupInput {
  name: String!
  username: String!
  email: String!
  address: String!
  phone: String!
  country: String!
  state: String!
  city: String!
  zipCode: String!
  password: String!
}

type SignupResponse {
  message: String!
  success: Boolean!
}

type ResendEmailOtpResponse {
  message: String!
  success: Boolean!
}

type VerifyResetPasswordOtpResponse {
  success: Boolean!
  message: String!
}

# Define individual product in the cart
type CartProduct {
  productId: Int!
  quantity: Int!
  createdAt: String!
  updatedAt: String
}

type UserCart {
  id: String
  userId: String!
  products: [CartProduct!]!
  totalItems: Int!
  maxLimit: Int!
}

type AddCartResponse {
  message: String!
  success: Boolean!
  cart: UserCart!
}

input AddToCartInput {
  productId: Int!
  quantity: Int
}

type UpdateCartResponse {
  message: String!
  success: Boolean!
  cart: UserCart!
}

type RemoveCartResponse {
  message: String!
  success: Boolean!
}

type ClearCartResponse {
  message: String!
  success: Boolean!
}

type Category {
  slug: String!
  name: String!
  thumbnail: String
}

input CategoryInput {
  slug: String!
  name: String!
  thumbnail: String
}

input UpdateCategoryInput {
  slug: String
  name: String
}

type AddCategoryResponse {
  success: Boolean!
  message: String!
  name: String
}

type RemoveCategoryResponse {
  success: Boolean!
  message: String!
  name: String
}

type BulkCategoryResponse {
  success: Boolean!
  message: String!
  total: Int!
}

type UpdateCategoryResponse {
  success: Boolean!
  message: String!
  name: String
}

scalar Upload

enum Role {
  user
  admin
}

enum PaymentMethod {
  Cash_on_Delivery
  Card
  UPI
  NetBanking
}

enum PaymentStatus {
  Pending
  Paid
  Failed
  Refunded
}

enum OrderStatus {
  Processing
  Packed
  Shipped
  Delivered
  Cancelled
}

# ----------------- INPUT TYPES -----------------

input PlaceOrderInput {
  products: [OrderedProductInput!]!
  shippingAddress: ShippingAddressInput!
  paymentMethod: PaymentMethod!
  totalAmount: Float!
}

input OrderedProductInput {
  externalProductId: Int!
  title: String!
  thumbnail: String
  priceAtPurchase: Float!
  quantity: Int!
  totalPrice: Float!
  returnPolicy: String!
  returnExpiresAt: String
}

input ShippingAddressInput {
  name: String!
  email: String!
  phone: String!
  address: String!
  city: String!
  isVerified: Boolean
  state: String!
  zipCode: String!
  country: String!
}

# ----------------- ENUMS -----------------

enum PaymentMethod {
  Cash_on_Delivery
  Card
  UPI
  NetBanking
}

enum PaymentStatus {
  Pending
  Paid
  Failed
  Refunded
}

enum OrderStatus {
  Processing
  Packed
  Shipped
  Out_for_Delivery
  Delivered
  Cancelled
  Returned
  Refunded
}

# ----------------- OUTPUT TYPES -----------------

type OrderedProduct {
  externalProductId: Int!
  title: String!
  thumbnail: String
  priceAtPurchase: Float!
  quantity: Int!
  totalPrice: Float!
  returnPolicy: String!
  returnExpiresAt: String
}

type ShippingAddress {
  name: String!
  email: String!
  phone: String!
  isVerified: Boolean!
  address: String!
  city: String!
  state: String!
  zipCode: String!
  country: String!
}

type CanceledOrder {
  canceledAt: String
  canceledOrderReason: String
}

type ReturnedOrder {
  returnedAt: String
  returnedOrderReason: String
}

type UserOrder {
  id: String!
  userId: String!
  products: [OrderedProduct!]!
  shippingAddress: ShippingAddress!
  paymentMethod: PaymentMethod!
  paymentStatus: PaymentStatus!
  orderStatus: OrderStatus!
  totalAmount: Float!
  placedAt: String!
  cancelledOrder: CanceledOrder
  packedAt: String
  shippedAt: String
  outForDeliveryAt: String
  deliveredAt: String
  returnedOrder: ReturnedOrder
  refundAt: String
}

# ----------------- MUTATION RESPONSES -----------------

type PlaceOrderResponse {
  message: String!
  success: Boolean!
}

type VerifyOtpResponse {
  message: String!
  success: Boolean!
}

type CancelOrderResponse {
  message: String!
  success: Boolean!
}

type ReturnOrderResponse {
  message: String!
  success: Boolean!
}

type OrderStatusResponse {
  message: String!
  success: Boolean!
}

type ProductStatus {
  externalProductId: Int!
  title: String!
  thumbnail: String
  priceAtPurchase: Float!
  quantity: Int!
  totalPrice: Float!
  returnPolicy: String!
}

type GetOrderStatusResponse {
  orderStatus: OrderStatus!
  products: [ProductStatus!]!
}

type Product {
  id: Int!
  title: String
  description: String
  category: String
  price: Float
  discountPercentage: Float
  rating: Float
  stock: Int
  tags: [String]
  brand: String
  weight: Float
  dimensions: Dimensions
  warrantyInformation: String
  shippingInformation: String
  availabilityStatus: String
  reviews: [Review]
  returnPolicy: String
  minimumOrderQuantity: Int
  meta: Meta
  images: [String]
  thumbnail: String
}

type Dimensions {
  width: Float
  height: Float
  depth: Float
}

type Review {
  rating: Float
  comment: String
  date: String
  reviewerName: String
  reviewerEmail: String
}

type Meta {
  createdAt: String
  updatedAt: String
  barcode: String
  qrCode: String
}

type FetchProductsResponse {
  products: [Product!]!
  total: Int!
  skip: Int!
  limit: Int!
}

input ProductInput {
  title: String!
  description: String!
  category: String!
  price: Float!
  discountPercentage: Float!
  rating: Float!
  stock: Int!
  tags: [String!]!
  brand: String!
  weight: Float!
  dimensions: DimensionsInput!
  warrantyInformation: String!
  shippingInformation: String!
  availabilityStatus: String!
  returnPolicy: String!
  minimumOrderQuantity: Int!
  meta: MetaInput!
  images: [String!]!
  thumbnail: String!
}

input UpdateProductInput {
  title: String
  description: String
  category: String
  price: Float
  discountPercentage: Float
  rating: Float
  stock: Int
  tags: [String!]
  brand: String
  weight: Float
  dimensions: UpdateDimensionsInput
  warrantyInformation: String
  availabilityStatus: String
  returnPolicy: String
  minimumOrderQuantity: Int
  meta: UpdateMetaInput
  images: [String!]
  thumbnail: String
}

input DimensionsInput {
  width: Float!
  height: Float!
  depth: Float!
}

input ReviewInput {
  rating: Float!
  comment: String!
  date: String!
  reviewerName: String!
  reviewerEmail: String!
}

input MetaInput {
  createdAt: String!
  updatedAt: String!
  barcode: String!
  qrCode: String!
}

input UpdateDimensionsInput {
  width: Float
  height: Float
  depth: Float
}

input UpdateReviewInput {
  rating: Float
  comment: String
  date: String
  reviewerName: String
  reviewerEmail: String
}

input UpdateMetaInput {
  createdAt: String
  updatedAt: String
  barcode: String
  qrCode: String
}

type RemoveProductResponse {
  success: Boolean!
  message: String!
}

scalar Upload

type BulkProductResponse {
  success: Boolean!
  message: String!
  total: Int
}

type User {
  userId: ID!
  name: String!
  username: String!
  email: String!
  address: String!
  phone: String!
  country: String
  state: String
  city: String
  zipCode: String
  role: Role!
  userOrderHistory: [UserOrderHistory]
  password: String!
  emailVerified: Boolean!
  isActive: Boolean!
  isBanned: Boolean!
  createdAt: String
  updatedAt: String
  updatedBy: ID
}

type UserWithoutPassword {
  userId: ID!
  name: String!
  username: String!
  email: String!
  address: String!
  phone: String!
  country: String
  state: String
  city: String
  zipCode: String
  role: Role!
  emailVerified: Boolean!
  userOrderHistory: [UserOrderHistory]
  isActive: Boolean!
  isBanned: Boolean!
  createdAt: String
  updatedAt: String
  updatedBy: ID
}

type UserOrderHistory {
  orderId: Int!
  placedAt: String!
}

input UpdateUserProfileInput {
  name: String
  address: String
  phone: String
  username: String
  country: String
  state: String
  city: String
  zipCode: String
}

type PasswordUpdateResponse {
  success: Boolean!
  message: String!
}

type InitiateResetPasswordResponse {
  success: Boolean!
  message: String!
}

type VerifyResetPasswordOtpResponse {
  success: Boolean!
  message: String!
}

type ResetPasswordResponse {
  success: Boolean!
  message: String!
}

type DeleteAccountResponse {
  success: Boolean!
  message: String!
}

type UpdateUserOrderStatusResponse {
  success: Boolean!
  message: String!
}

type RefundOrderResponse {
  success: Boolean!
  message: String!
}

type AdminDashboardStats {
  totalOrders: Int!
  totalRevenue: Float!
  cancelledOrders: Int!
  returnedOrders: Int!
  totalProducts: Int!
  totalCategories: Int!
  totalUsers: Int!
  activeUsers: Int!
  bannedUsers: Int!
  deactivatedUsers: Int!
}

input UpdateUserEmailInput {
  email: String!
}

type Banner {
  id: ID!
  imageUrl: String!
  title: String
  description: String
  isActive: Boolean!
  createdAt: String!
}
`;

export default typeDefs;