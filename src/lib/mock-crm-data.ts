export interface MockCustomer {
  id: string;
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

// Initial Mock Customers (Top Nail Salons & Supply Stores in Texas)
export const initialMockCustomers: MockCustomer[] = [
  {
    id: "cus-001",
    businessName: "Venetian Nail Spa - Galleria Houston",
    contactPerson: "Jennifer Tran (Chị Thảo)",
    phone: "+17135550192",
    email: "thao.tran@venetianhouston.com",
    address: "5015 Westheimer Rd, Ste 2200",
    city: "Houston",
    state: "TX",
    zipCode: "77056",
    birthday: "1984-06-18T00:00:00.000Z",
    assignedSale: "hanna",
    tier: "VIP",
    status: "ACTIVE",
    notes: "Tiệm 32 ghế sang trọng khu Galleria, ưu tiên cọ Kolinsky Z-Brushes #14 và cọ Ombre. Nhập hàng đều mỗi 2 tuần.",
    createdAt: "2024-01-15T08:30:00.000Z",
    updatedAt: "2026-10-15T10:00:00.000Z",
    orders: [
      {
        id: "ord-101",
        orderNumber: "JKI-ORD-2026-088",
        totalAmount: 3450.0,
        paidAmount: 3450.0,
        paymentStatus: "PAID",
        dueDate: "2026-10-25T00:00:00.000Z",
        saleRep: "hanna",
        notes: "Giao hỏa tốc tới chi nhánh Galleria",
        createdAt: "2026-10-10T09:15:00.000Z",
        items: [
          { id: "oi-1", productId: "p-1", productName: "Z-Kolinsky Master Acrylic Brush #14", sku: "ZK-14-GLD", quantity: 30, unitPrice: 65.0 },
          { id: "oi-2", productId: "p-2", productName: "Z-Ombre Precision Blending Brush", sku: "ZO-08-SLV", quantity: 50, unitPrice: 30.0 }
        ]
      },
      {
        id: "ord-102",
        orderNumber: "JKI-ORD-2026-042",
        totalAmount: 2800.0,
        paidAmount: 2800.0,
        paymentStatus: "PAID",
        dueDate: "2026-09-20T00:00:00.000Z",
        saleRep: "hanna",
        createdAt: "2026-09-08T14:30:00.000Z",
        items: [
          { id: "oi-3", productId: "p-3", productName: "Z-Fine Liner 3D Gel Art Brush Set", sku: "ZL-SET-3", quantity: 40, unitPrice: 45.0 },
          { id: "oi-4", productId: "p-1", productName: "Z-Kolinsky Master Acrylic Brush #14", sku: "ZK-14-GLD", quantity: 15, unitPrice: 66.66 }
        ]
      },
      {
        id: "ord-103",
        orderNumber: "JKI-ORD-2026-015",
        totalAmount: 4120.0,
        paidAmount: 4120.0,
        paymentStatus: "PAID",
        dueDate: "2026-08-15T00:00:00.000Z",
        saleRep: "hanna",
        createdAt: "2026-08-01T11:00:00.000Z",
        items: [
          { id: "oi-5", productId: "p-1", productName: "Z-Kolinsky Master Acrylic Brush #14", sku: "ZK-14-GLD", quantity: 50, unitPrice: 65.0 },
          { id: "oi-6", productId: "p-2", productName: "Z-Ombre Precision Blending Brush", sku: "ZO-08-SLV", quantity: 29, unitPrice: 30.0 }
        ]
      }
    ],
    quotes: [
      {
        id: "quo-201",
        quoteNumber: "JKI-QUO-2026-104",
        totalAmount: 5200.0,
        validUntil: "2026-11-15T00:00:00.000Z",
        status: "SENT",
        notes: "Gói cọ khuyến mãi mùa Lễ Tạ Ơn & Giáng Sinh 2026",
        createdAt: "2026-10-18T16:00:00.000Z",
        items: [
          { id: "qi-1", productId: "p-1", productName: "Z-Kolinsky Master Acrylic Brush #14", quantity: 60, unitPrice: 62.0, discount: 5.0 },
          { id: "qi-2", productId: "p-4", productName: "Z-Diamond Oval Builder Gel Brush #8", quantity: 40, unitPrice: 37.0, discount: 0.0 }
        ]
      }
    ],
    smsLogs: [
      {
        id: "sms-301",
        toPhone: "+17135550192",
        fromPhone: "+17133306165",
        content: "JKIOCEAN: Chị Thảo ơi, lô cọ Z-Kolinsky #14 đợt mới vừa cập bến kho Houston. Em giữ trước cho tiệm 30 cây giá VIP nhé!",
        type: "PROMOTION",
        status: "SENT",
        createdAt: "2026-10-18T09:45:00.000Z"
      },
      {
        id: "sms-302",
        toPhone: "+17135550192",
        fromPhone: "+17133306165",
        content: "JKIOCEAN kính chúc chị Jennifer Tran sinh nhật vui vẻ, hạnh phúc và tiệm Venetian Nail Spa ngày càng hồng phát!",
        type: "BIRTHDAY",
        status: "SENT",
        createdAt: "2026-06-18T08:00:00.000Z"
      }
    ],
    churnSurveys: []
  },
  {
    id: "cus-002",
    businessName: "Milano Nail Spa - The Woodlands",
    contactPerson: "David Nguyen (Anh Dũng)",
    phone: "+18325550481",
    email: "woodlands@milanonails.com",
    address: "19075 I-45 South, Suite 115",
    city: "The Woodlands",
    state: "TX",
    zipCode: "77385",
    birthday: "1979-11-04T00:00:00.000Z",
    assignedSale: "johnny",
    tier: "WHOLESALE",
    status: "ACTIVE",
    notes: "Chủ chuỗi Milano 3 tiệm khu North Houston. Mua số lượng lớn cọ đắp bột và cọ vẽ nét.",
    createdAt: "2024-03-20T10:00:00.000Z",
    updatedAt: "2026-10-12T15:20:00.000Z",
    orders: [
      {
        id: "ord-104",
        orderNumber: "JKI-ORD-2026-079",
        totalAmount: 1950.0,
        paidAmount: 1950.0,
        paymentStatus: "PAID",
        dueDate: "2026-10-05T00:00:00.000Z",
        saleRep: "johnny",
        createdAt: "2026-09-28T10:00:00.000Z",
        items: [
          { id: "oi-7", productId: "p-1", productName: "Z-Kolinsky Master Acrylic Brush #14", sku: "ZK-14-GLD", quantity: 30, unitPrice: 65.0 }
        ]
      }
    ],
    quotes: [
      {
        id: "quo-202",
        quoteNumber: "JKI-QUO-2026-095",
        totalAmount: 3800.0,
        validUntil: "2026-10-31T00:00:00.000Z",
        status: "ACCEPTED",
        createdAt: "2026-09-25T14:00:00.000Z"
      }
    ],
    smsLogs: [
      {
        id: "sms-303",
        toPhone: "+18325550481",
        fromPhone: "+17133306165",
        content: "Anh Dũng ơi, đơn hàng cọ Z-Brushes đã giao thành công tại The Woodlands lúc 2:30 PM hôm nay qua UPS tracking #1Z99999. Cần hỗ trợ thêm anh nhắn em nhé!",
        type: "FOLLOW_UP",
        status: "SENT",
        createdAt: "2026-09-30T14:40:00.000Z"
      }
    ],
    churnSurveys: []
  },
  {
    id: "cus-003",
    businessName: "Bellaire Glamour Nails & Supply",
    contactPerson: "Kelly Vu (Chị Kim)",
    phone: "+17135550833",
    email: "kelly.vu@bellaireglamour.com",
    address: "9889 Bellaire Blvd, Ste 108",
    city: "Houston",
    state: "TX",
    zipCode: "77036",
    birthday: "1988-03-22T00:00:00.000Z",
    assignedSale: "admin",
    tier: "WHOLESALE",
    status: "AT_RISK",
    notes: "Khu Asiatown Bellaire. Đang có dấu hiệu giảm đơn tháng vừa rồi do tồn kho đợt hè còn nhiều và có đối thủ chào giá cạnh tranh.",
    createdAt: "2023-11-10T09:00:00.000Z",
    updatedAt: "2026-10-18T11:00:00.000Z",
    orders: [
      {
        id: "ord-105",
        orderNumber: "JKI-ORD-2026-022",
        totalAmount: 1100.0,
        paidAmount: 600.0,
        paymentStatus: "PARTIAL",
        dueDate: "2026-09-15T00:00:00.000Z",
        saleRep: "admin",
        notes: "Còn nợ $500 chuyển sang kỳ sau",
        createdAt: "2026-08-20T10:30:00.000Z",
        items: [
          { id: "oi-8", productId: "p-2", productName: "Z-Ombre Precision Blending Brush", sku: "ZO-08-SLV", quantity: 20, unitPrice: 30.0 },
          { id: "oi-9", productId: "p-3", productName: "Z-Fine Liner 3D Gel Art Brush Set", sku: "ZL-SET-3", quantity: 10, unitPrice: 50.0 }
        ]
      }
    ],
    quotes: [],
    smsLogs: [
      {
        id: "sms-304",
        toPhone: "+17135550833",
        fromPhone: "+17133306165",
        content: "JKIOCEAN xin chào chị Kim. Tiệm mình còn nợ $500 đơn hàng đợt 20/08, chị sắp xếp thanh toán qua Zelle/Check giúp tụi em nhé ạ. Em cảm ơn chị!",
        type: "AR_REMINDER",
        status: "SENT",
        createdAt: "2026-09-25T10:00:00.000Z"
      }
    ],
    churnSurveys: [
      {
        id: "cs-401",
        customerId: "cus-003",
        analysisMonth: "2026-09",
        dropPercent: -58.5,
        reason: "PRICE_COMPETITION",
        saleNotes: "Tiệm nhận được chào giá cọ Trung Quốc giá rẻ hơn 15%. Tuy nhiên chất lượng lông cọ kém hơn lông Kolinsky JKI.",
        actionPlan: "Đã cử Sale ghé tiệm tặng mẫu thử Z-Brushes mới, áp dụng chiết khấu bậc thang 8% cho đơn 50 cây.",
        saleRep: "admin",
        isResolved: false,
        createdAt: "2026-10-02T16:00:00.000Z"
      }
    ]
  },
  {
    id: "cus-004",
    businessName: "Austin Sunset Luxury Nail Bar",
    contactPerson: "Michael Le (Anh Minh)",
    phone: "+15125550917",
    email: "minh.le@sunsetaustinnails.com",
    address: "2200 S Congress Ave",
    city: "Austin",
    state: "TX",
    zipCode: "78704",
    birthday: "1982-08-14T00:00:00.000Z",
    assignedSale: "hanna",
    tier: "STANDARD",
    status: "ACTIVE",
    notes: "Tiệm phong cách Organic khu South Congress, thợ yêu cầu cọ gel cao cấp và dung dịch rửa cọ thân thiện môi trường.",
    createdAt: "2024-05-12T13:00:00.000Z",
    updatedAt: "2026-10-14T10:00:00.000Z",
    orders: [
      {
        id: "ord-106",
        orderNumber: "JKI-ORD-2026-085",
        totalAmount: 1450.0,
        paidAmount: 1450.0,
        paymentStatus: "PAID",
        dueDate: "2026-10-18T00:00:00.000Z",
        saleRep: "hanna",
        createdAt: "2026-10-04T15:00:00.000Z"
      }
    ],
    quotes: [],
    smsLogs: [],
    churnSurveys: []
  },
  {
    id: "cus-005",
    businessName: "Dallas Star Nails & Academy",
    contactPerson: "Nancy Hoang (Cô Nancy)",
    phone: "+12145550349",
    email: "nancy@dallasstarnails.com",
    address: "11445 Emerald St",
    city: "Dallas",
    state: "TX",
    zipCode: "75229",
    birthday: "1975-12-05T00:00:00.000Z",
    assignedSale: "johnny",
    tier: "VIP",
    status: "ACTIVE",
    notes: "Có trung tâm đào tạo thợ nail với hơn 60 học viên mỗi khóa. Thường xuyên lấy trọn bộ Kit cọ học viên Z-Brushes.",
    createdAt: "2023-08-01T08:00:00.000Z",
    updatedAt: "2026-10-16T17:00:00.000Z",
    orders: [
      {
        id: "ord-107",
        orderNumber: "JKI-ORD-2026-091",
        totalAmount: 6200.0,
        paidAmount: 6200.0,
        paymentStatus: "PAID",
        dueDate: "2026-10-20T00:00:00.000Z",
        saleRep: "johnny",
        createdAt: "2026-10-12T10:30:00.000Z"
      },
      {
        id: "ord-108",
        orderNumber: "JKI-ORD-2026-061",
        totalAmount: 5800.0,
        paidAmount: 5800.0,
        paymentStatus: "PAID",
        dueDate: "2026-09-10T00:00:00.000Z",
        saleRep: "johnny",
        createdAt: "2026-08-25T11:00:00.000Z"
      }
    ],
    quotes: [
      {
        id: "quo-203",
        quoteNumber: "JKI-QUO-2026-109",
        totalAmount: 7500.0,
        validUntil: "2026-11-20T00:00:00.000Z",
        status: "SENT",
        notes: "Gói Kit cọ 100 bộ cho khóa học viên tháng 11/2026",
        createdAt: "2026-10-17T09:00:00.000Z"
      }
    ],
    smsLogs: [
      {
        id: "sms-305",
        toPhone: "+12145550349",
        fromPhone: "+17133306165",
        content: "JKIOCEAN: Cô Nancy ơi, báo giá 100 bộ Kit cọ học viên đợt tháng 11 em đã gửi qua email nancy@dallasstarnails.com và Zalo rồi ạ. Cô xem giúp con nhé!",
        type: "FOLLOW_UP",
        status: "SENT",
        createdAt: "2026-10-17T09:10:00.000Z"
      }
    ],
    churnSurveys: []
  }
];

// Initial Mock Leads (High-potential Texas & Sunbelt Salons)
export const initialMockLeads: MockLead[] = [
  {
    id: "lead-001",
    salonName: "Crystal Luxe Nail Lounge",
    ownerName: "Sarah Dang",
    phone: "+18325550711",
    city: "Katy",
    state: "TX",
    address: "24419 Katy Fwy",
    googleReviewCount: 248,
    rating: 4.8,
    icpScore: 92,
    personalizedHook: "Tiệm 24 bàn tại Katy Fwy với 248 đánh giá 4.8 sao. Khách chuộng dịch vụ Ombre & Acrylic cao cấp. Rất thích hợp chào bộ cọ Kolinsky Master #14 kèm chính sách giá sỉ đợt Tết.",
    status: "QUALIFIED",
    assignedSale: "hanna",
    createdAt: "2026-10-14T08:00:00.000Z",
    updatedAt: "2026-10-18T14:30:00.000Z"
  },
  {
    id: "lead-002",
    salonName: "Sugar Land Elegant Nails & Bar",
    ownerName: "Tony Truong",
    phone: "+12815550264",
    city: "Sugar Land",
    state: "TX",
    address: "16535 Southwest Fwy",
    googleReviewCount: 310,
    rating: 4.9,
    icpScore: 88,
    personalizedHook: "Vị trí đắc địa First Colony Sugar Land, lượng khách cực đông. Chủ tiệm đang tìm nguồn cung cấp cọ đắp bột ổn định không bị rụng lông.",
    status: "CONTACTED",
    assignedSale: "hanna",
    createdAt: "2026-10-15T11:20:00.000Z",
    updatedAt: "2026-10-17T16:00:00.000Z"
  },
  {
    id: "lead-003",
    salonName: "San Antonio Pearl Nail Sanctuary",
    ownerName: "Vivian Phan",
    phone: "+12105550639",
    city: "San Antonio",
    state: "TX",
    address: "312 Pearl Pkwy",
    googleReviewCount: 185,
    rating: 4.7,
    icpScore: 85,
    personalizedHook: "Tiệm upscale tại Pearl District San Antonio. Khách hàng chi trả cao, thợ thích dùng cọ cán kim loại Z-Brushes chống ăn mòn acetone.",
    status: "NEW",
    assignedSale: "johnny",
    createdAt: "2026-10-17T09:00:00.000Z",
    updatedAt: "2026-10-17T09:00:00.000Z"
  },
  {
    id: "lead-004",
    salonName: "Pearland Golden Touch Nails",
    ownerName: "Henry Dinh",
    phone: "+17135550998",
    city: "Pearland",
    state: "TX",
    address: "2803 Business Center Dr",
    googleReviewCount: 94,
    rating: 4.3,
    icpScore: 68,
    personalizedHook: "Tiệm tầm trung 10 thợ, thường lấy phụ liệu từ supply địa phương. Có thể thuyết phục bằng chương trình dùng thử 14 ngày không ưng hoàn tiền.",
    status: "NEW",
    assignedSale: "admin",
    createdAt: "2026-10-18T13:45:00.000Z",
    updatedAt: "2026-10-18T13:45:00.000Z"
  },
  {
    id: "lead-005",
    salonName: "Plano Legacy West Nails Bar",
    ownerName: "Christina Vu",
    phone: "+19725550183",
    city: "Plano",
    state: "TX",
    address: "7400 Windrose Ave",
    googleReviewCount: 420,
    rating: 4.9,
    icpScore: 95,
    personalizedHook: "Top 1 tiệm Nails tại Legacy West Dallas. Đội ngũ hơn 35 thợ nail tay nghề cao. Đang mở rộng thêm 2 chi nhánh mới ở Frisco.",
    status: "QUALIFIED",
    assignedSale: "johnny",
    createdAt: "2026-10-12T10:00:00.000Z",
    updatedAt: "2026-10-16T15:00:00.000Z"
  },
  {
    id: "lead-006",
    salonName: "Midland Texas Oil Country Nails",
    ownerName: "Brian Do",
    phone: "+14325550412",
    city: "Midland",
    state: "TX",
    address: "4400 N Midland Dr",
    googleReviewCount: 65,
    rating: 4.1,
    icpScore: 54,
    personalizedHook: "Khu vực Tây Texas, phí ship cao hơn Houston. Cần chào gói combo miễn phí vận chuyển cho đơn từ $500.",
    status: "CONTACTED",
    assignedSale: "admin",
    createdAt: "2026-10-16T14:00:00.000Z",
    updatedAt: "2026-10-18T11:00:00.000Z"
  }
];

// In-Memory store for runtime fallback when DB connection is pending
let globalCustomerStore: MockCustomer[] = [...initialMockCustomers];
let globalLeadStore: MockLead[] = [...initialMockLeads];

export function getMockCustomers(): MockCustomer[] {
  return globalCustomerStore;
}

export function getMockCustomerById(id: string): MockCustomer | undefined {
  return globalCustomerStore.find((c) => c.id === id);
}

export function addMockCustomer(customer: Partial<MockCustomer>): MockCustomer {
  const newCus: MockCustomer = {
    id: customer.id || `cus-${Date.now()}`,
    businessName: customer.businessName || "New Salon",
    contactPerson: customer.contactPerson || "Chủ Tiệm",
    phone: customer.phone || "+10000000000",
    email: customer.email || null,
    address: customer.address || null,
    city: customer.city || "Houston",
    state: customer.state || "TX",
    zipCode: customer.zipCode || null,
    birthday: customer.birthday || null,
    assignedSale: customer.assignedSale || "admin",
    tier: customer.tier || "STANDARD",
    status: customer.status || "ACTIVE",
    notes: customer.notes || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    orders: customer.orders || [],
    quotes: customer.quotes || [],
    smsLogs: customer.smsLogs || [],
    churnSurveys: customer.churnSurveys || [],
  };
  globalCustomerStore.unshift(newCus);
  return newCus;
}

export function updateMockCustomer(id: string, updates: Partial<MockCustomer>): MockCustomer | null {
  const idx = globalCustomerStore.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  globalCustomerStore[idx] = {
    ...globalCustomerStore[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return globalCustomerStore[idx];
}

export function getMockLeads(): MockLead[] {
  return globalLeadStore;
}

export function addMockLead(lead: Partial<MockLead>): MockLead {
  const newLead: MockLead = {
    id: lead.id || `lead-${Date.now()}`,
    salonName: lead.salonName || "New Salon Lead",
    ownerName: lead.ownerName || null,
    phone: lead.phone || "+10000000000",
    city: lead.city || "Houston",
    state: lead.state || "TX",
    address: lead.address || null,
    googleReviewCount: lead.googleReviewCount ?? 0,
    rating: lead.rating ?? 4.5,
    icpScore: lead.icpScore ?? 75,
    personalizedHook: lead.personalizedHook || null,
    status: lead.status || "NEW",
    assignedSale: lead.assignedSale || "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  globalLeadStore.unshift(newLead);
  return newLead;
}

export function updateMockLead(id: string, updates: Partial<MockLead>): MockLead | null {
  const idx = globalLeadStore.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  globalLeadStore[idx] = {
    ...globalLeadStore[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return globalLeadStore[idx];
}

export function addMockSmsLog(customerId: string | null, toPhone: string, content: string, type: "PROMOTION" | "BIRTHDAY" | "AR_REMINDER" | "FOLLOW_UP" = "FOLLOW_UP") {
  const newLog = {
    id: `sms-${Date.now()}`,
    toPhone,
    fromPhone: "+17133306165",
    content,
    type,
    status: "SENT",
    createdAt: new Date().toISOString(),
  };

  if (customerId) {
    const cus = globalCustomerStore.find((c) => c.id === customerId);
    if (cus) {
      if (!cus.smsLogs) cus.smsLogs = [];
      cus.smsLogs.unshift(newLog);
    }
  }
  return newLog;
}
