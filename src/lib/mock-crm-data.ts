import rawCustomers from "../../data/customers_extracted.json";

export interface MockCustomer {
  id: string;
  rank?: string | number;
  businessName: string;
  contactPerson: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  birthday: string | null;
  assignedSale: string;
  tier: "STANDARD" | "WHOLESALE" | "VIP";
  status: "ACTIVE" | "AT_RISK" | "INACTIVE";
  notes: string | null;
  profit?: number;
  aov?: number;
  cycleDays?: number;
  firstPurchase?: string | null;
  lastPurchase?: string | null;
  rev2024?: number;
  orders2024?: number;
  rev2025?: number;
  orders2025?: number;
  rev2026?: number;
  orders2026?: number;
  totalSpent?: number;
  totalPaid?: number;
  debtAmount?: number;
  orderCount?: number;
  lastOrderDate?: string | null;
  lastContactDate?: string | null;
  growth25vs24?: number | null;
  growth26vs25?: number | null;
  createdAt: string;
  updatedAt: string;
  orders: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: "PAID" | "PARTIAL" | "UNPAID" | "OVERDUE";
    dueDate: string;
    saleRep: string;
    notes?: string | null;
    createdAt: string;
    items?: {
      id: string;
      productId: string;
      productName: string;
      sku: string;
      quantity: number;
      unitPrice: number;
    }[];
  }[];
  quotes: {
    id: string;
    quoteNumber: string;
    totalAmount: number;
    validUntil: string;
    status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED";
    notes?: string | null;
    createdAt: string;
    items?: {
      id: string;
      productId: string;
      productName: string;
      quantity: number;
      unitPrice: number;
      discount: number;
    }[];
  }[];
  smsLogs: {
    id: string;
    toPhone: string;
    fromPhone: string;
    content: string;
    type: "PROMOTION" | "BIRTHDAY" | "AR_REMINDER" | "FOLLOW_UP";
    status: string;
    createdAt: string;
  }[];
  churnSurveys: {
    id: string;
    customerId?: string;
    analysisMonth: string;
    dropPercent: number;
    reason: "HIGH_INVENTORY_REMAINING" | "PRICE_COMPETITION" | "PRODUCT_QUALITY_FEEDBACK" | "DELIVERY_DELAY" | "STORE_TEMPORARILY_CLOSED" | "OTHER";
    saleNotes: string | null;
    actionPlan: string | null;
    saleRep: string;
    isResolved: boolean;
    createdAt: string;
  }[];
}

export interface MockLead {
  id: string;
  salonName: string;
  ownerName: string | null;
  phone: string;
  city: string | null;
  state: string | null;
  address: string | null;
  googleReviewCount: number | null;
  rating: number | null;
  icpScore: number;
  personalizedHook: string | null;
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "CONVERTED" | "REJECTED";
  assignedSale: string | null;
  createdAt: string;
  updatedAt: string;
}

// 100% authentic customers imported directly from CUSTOMER FOR SALE.xlsx
export const initialMockCustomers: MockCustomer[] = (rawCustomers as any[]) as MockCustomer[];

export const initialMockLeads: MockLead[] = [];

let mockCustomersStore: MockCustomer[] = [...initialMockCustomers];
let mockLeadsStore: MockLead[] = [...initialMockLeads];

export function getMockCustomers(): MockCustomer[] {
  return mockCustomersStore;
}

export function getMockCustomerById(id: string): MockCustomer | undefined {
  return mockCustomersStore.find((c) => c.id === id);
}

export function addMockCustomer(c: any): MockCustomer {
  const newCust: MockCustomer = {
    id: `cus-${Date.now()}`,
    businessName: c.businessName || "New Salon Account",
    contactPerson: c.contactPerson || "Manager",
    phone: c.phone || "+10000000000",
    email: c.email || null,
    address: c.address || null,
    city: c.city || "Houston",
    state: c.state || "TX",
    zipCode: c.zipCode || "77036",
    birthday: c.birthday || null,
    assignedSale: c.assignedSale || "admin",
    tier: c.tier || "STANDARD",
    status: c.status || "ACTIVE",
    notes: c.notes || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    orders: [],
    quotes: [],
    smsLogs: [],
    churnSurveys: [],
  };
  mockCustomersStore.unshift(newCust);
  return newCust;
}

export function updateMockCustomer(id: string, updates: Partial<MockCustomer>): MockCustomer | null {
  const idx = mockCustomersStore.findIndex((c) => c.id === id);
  if (idx !== -1) {
    mockCustomersStore[idx] = {
      ...mockCustomersStore[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return mockCustomersStore[idx];
  }
  return null;
}

export function deleteMockCustomer(id: string): boolean {
  const initialLength = mockCustomersStore.length;
  mockCustomersStore = mockCustomersStore.filter((c) => c.id !== id);
  return mockCustomersStore.length < initialLength;
}

export function getMockLeads(): MockLead[] {
  return mockLeadsStore;
}

export function addMockLead(lead: Omit<MockLead, "id" | "createdAt" | "updatedAt">): MockLead {
  const newLead: MockLead = {
    ...lead,
    id: `lead-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockLeadsStore.unshift(newLead);
  return newLead;
}

export function updateMockLead(id: string, updates: Partial<MockLead>): MockLead | null {
  const idx = mockLeadsStore.findIndex((l) => l.id === id);
  if (idx !== -1) {
    mockLeadsStore[idx] = {
      ...mockLeadsStore[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return mockLeadsStore[idx];
  }
  return null;
}

export function addMockSmsLog(
  customerId: string,
  log: {
    toPhone: string;
    fromPhone: string;
    content: string;
    type: "PROMOTION" | "BIRTHDAY" | "AR_REMINDER" | "FOLLOW_UP";
    status?: string;
  }
) {
  const cust = mockCustomersStore.find((c) => c.id === customerId);
  if (cust) {
    const newLog = {
      id: `sms-${Date.now()}`,
      toPhone: log.toPhone,
      fromPhone: log.fromPhone,
      content: log.content,
      type: log.type,
      status: log.status || "SENT",
      createdAt: new Date().toISOString(),
    };
    if (!cust.smsLogs) cust.smsLogs = [];
    cust.smsLogs.unshift(newLog);
    return newLog;
  }
  return null;
}

export function addMockChurnSurvey(
  customerId: string,
  survey: {
    analysisMonth: string;
    dropPercent: number;
    reason: "HIGH_INVENTORY_REMAINING" | "PRICE_COMPETITION" | "PRODUCT_QUALITY_FEEDBACK" | "DELIVERY_DELAY" | "STORE_TEMPORARILY_CLOSED" | "OTHER";
    saleNotes?: string;
    actionPlan?: string;
    saleRep: string;
  }
) {
  const cust = mockCustomersStore.find((c) => c.id === customerId);
  if (cust) {
    const newSurvey = {
      id: `cs-${Date.now()}`,
      customerId,
      analysisMonth: survey.analysisMonth,
      dropPercent: survey.dropPercent,
      reason: survey.reason,
      saleNotes: survey.saleNotes || null,
      actionPlan: survey.actionPlan || null,
      saleRep: survey.saleRep,
      isResolved: false,
      createdAt: new Date().toISOString(),
    };
    if (!cust.churnSurveys) cust.churnSurveys = [];
    cust.churnSurveys.unshift(newSurvey);
    cust.status = "AT_RISK";
    return newSurvey;
  }
  return null;
}
