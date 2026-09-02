export const ROUTES = {
  HOME: "/",
  SHOP: "/shop",
  BESTSELLERS: "/bestsellers",
  NEW_ARRIVALS: "/new-arrivals",
  CATEGORY: (slug: string) => `/categories/${slug}`,
  PRODUCT: (slug: string) => `/products/${slug}`,
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDERS: "/orders",
  ORDER_DETAIL: (id: string) => `/orders/${id}`,
  PROFILE: "/profile",
  PROFILE_TAB: (tab: "account" | "orders" | "addresses" | "security") =>
    `/profile?tab=${tab}`,
  LOGIN: "/login",
  REGISTER: "/register",
  ABOUT: "/about",
  CONTACT: "/contact",
  FAQS: "/faqs",
  PRIVACY: "/privacy",
  TERMS: "/terms",
  SHIPPING: "/shipping",
  REFUND: "/refund",
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    PRODUCTS: "/admin/products",
    CATEGORIES: "/admin/categories",
    ORDERS: "/admin/orders",
    ADMINS: "/admin/admins",
    CUSTOMERS: "/admin/customers",
    REVIEWS: "/admin/reviews",
    /** @deprecated Use ADMIN.CUSTOMERS */
    USERS: "/admin/customers",
  },
} as const;

export const CART_STORAGE_KEY = "gifwoods-cart";
