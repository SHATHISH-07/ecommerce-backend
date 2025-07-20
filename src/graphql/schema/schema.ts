const typeDefs = `#graphql

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

# Input type for sign-in
input SignupInput {
  name: String!
  username: String!
  email: String!
  address: String!
  phone: String!
  password: String!
}

# Input type for shipping address
input ShippingAddressInput {
  fullName: String!
  phone: String!
  addressLine: String!
  city: String!
  postalCode: String!
  country: String!
}

type Mutation {
  # Mutation for user signup
  signup(input: SignupInput!): User!

  # Mutation for user login
  login(
    loginIdentifier: String!
    password: String!
  ): LoginUser!

  # Cart Mutations
  addToCart(productId: Int!, quantity: Int!): UserCart!
  removeFromCart(productId: Int!): UserCart!
  updateCartItemQuantity(productId: Int!, quantity: Int!): UserCart!
  clearCart: UserCart!

  # Order Mutations
   placeOrder(shippingAddress: ShippingAddressInput!, paymentMethod: PaymentMethod!): UserOrder!

   placeIndividualOrder(productId: Int!, quantity: Int!, shippingAddress: ShippingAddressInput!, paymentMethod: PaymentMethod!): UserOrder!

   placeCartItemOrder(productId: Int!, shippingAddress: ShippingAddressInput!, 
   paymentMethod: PaymentMethod!): UserOrder!
   
   updateOrderStatus(orderId: ID!, newStatus: OrderStatus!): UserOrder!
   cancelOrder(orderId: ID!): UserOrder!
  
}

type Query {
  # User Queries
  getCurrentUser: UserWithoutPassword!
  getUser(username: String, email: String, name: String): UserWithoutPassword!
  getUsers: [UserWithoutPassword!]!
  getUserById(id: ID!): UserWithoutPassword!
  getUsersByRole(role: Role!): [UserWithoutPassword!]!

  # Product Queries
  getAllProducts(limit: Int, skip: Int): FetchProductsResponse!
  getProductById(id: Int!): Product!
  searchProducts(query: String!, limit: Int, skip: Int): FetchProductsResponse!

  # Category Queries
  getCategories: [Category!]!
  getProductsByCategory(categorySlug: String!): FetchProductsResponse!

  # Cart Queries
  getUserCart: UserCart!

  # Order Queries (optional if implemented)
  getUserOrders: [UserOrder!]!
  getOrderById(orderId: ID!): UserOrder!
}

type User {
  id: ID!
  name: String!
  username: String!
  email: String!
  address: String!
  phone: String!
  role: Role!
  password: String!
}

type UserWithoutPassword {
  id: ID!
  name: String!
  username: String!
  email: String!
  address: String!
  phone: String!
  role: Role!
}

type LoginUser {
  id: ID!
  username: String!
  email: String!
  role: Role!
  token: String!
}

type Product {
  id: Int!
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
  dimensions: Dimensions!
  warrantyInformation: String!
  shippingInformation: String!
  availabilityStatus: String!
  reviews: [Review!]!
  returnPolicy: String!
  minimumOrderQuantity: Int!
  meta: Meta!
  images: [String!]!
  thumbnail: String!
}

type Dimensions {
  width: Float!
  height: Float!
  depth: Float!
}

type Review {
  rating: Float!
  comment: String!
  date: String!
  reviewerName: String!
  reviewerEmail: String!
}

type Meta {
  createdAt: String!
  updatedAt: String!
  barcode: String!
  qrCode: String!
}

type FetchProductsResponse {
  products: [Product!]!
  total: Int!
  skip: Int!
  limit: Int!
}

type Category {
  slug: String!
  name: String!
  url: String!
}

type UserCart {
  id: ID!
  userId: ID!
  products: [CartItem!]!
  createdAt: String!
  updatedAt: String!
}

type CartItem {
  externalProductId: Int!
  title: String!
  thumbnail: String
  priceAtAddTime: Float!
  quantity: Int!
  addedAt: String
}

type OrderedProduct {
  externalProductId: Int!
  title: String!
  thumbnail: String
  priceAtPurchase: Float!
  quantity: Int!
  totalPrice: Float!
}

type ShippingAddress {
  fullName: String!
  phone: String!
  addressLine: String!
  city: String!
  postalCode: String!
  country: String!
}

type UserOrder {
  id: ID!
  userId: ID!
  products: [OrderedProduct!]!
  shippingAddress: ShippingAddress!
  paymentMethod: PaymentMethod!
  paymentStatus: PaymentStatus!
  orderStatus: OrderStatus!
  totalAmount: Float!
  placedAt: String!
  refundAt: String
}
`;

export default typeDefs;
