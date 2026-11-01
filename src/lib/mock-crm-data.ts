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

export const initialMockCustomers: MockCustomer[] = [
  {
    "id": "cus-001",
    "businessName": "A to Z Nail Supply",
    "contactPerson": "Andy Tran",
    "phone": "+1-832-555-0142",
    "email": "orders@atoznailsuppsupply.com",
    "address": "7211 Regency Square Blvd",
    "city": "Houston",
    "state": "TX",
    "zipCode": "77036",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Johnny Tran",
    "tier": "VIP",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $4,024.70",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-10-14T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-1-1",
        "orderNumber": "INV-202610-1000",
        "totalAmount": 7090.0,
        "paidAmount": 4963.0,
        "paymentStatus": "PARTIAL",
        "dueDate": "2026-10-16T00:00:00.000Z",
        "saleRep": "Johnny Tran",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-10-14T09:00:00.000Z",
        "items": [
          {
            "id": "oi-1-1",
            "productId": "ACC-001",
            "productName": "Nail Art Palette Heart Blue",
            "sku": "ACC-001",
            "quantity": 25,
            "unitPrice": 4.0
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-1",
        "quoteNumber": "QT-202610-2000",
        "totalAmount": 108.0,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "SENT",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-10-14T08:30:00.000Z",
        "items": [
          {
            "id": "qi-1-1",
            "productId": "ACC-001",
            "productName": "Nail Art Palette Heart Blue",
            "quantity": 30,
            "unitPrice": 4.0,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-1",
        "toPhone": "+1-832-555-0142",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Andy Tran (A to Z Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-10-14T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-002",
    "businessName": "Nails Warehouse",
    "contactPerson": "Linda Nguyen",
    "phone": "+1-713-555-0188",
    "email": "orders@nailswarehousupply.com",
    "address": "9889 Bellaire Blvd, Ste 210",
    "city": "Houston",
    "state": "TX",
    "zipCode": "77036",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Hanna Nguyen",
    "tier": "VIP",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $3,352.36",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-10-04T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-2-1",
        "orderNumber": "INV-202610-1001",
        "totalAmount": 935.0,
        "paidAmount": 935.0,
        "paymentStatus": "PAID",
        "dueDate": "2026-10-06T00:00:00.000Z",
        "saleRep": "Hanna Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-10-04T09:00:00.000Z",
        "items": [
          {
            "id": "oi-2-1",
            "productId": "ACC-002",
            "productName": "Nail Art Palette Square Blue",
            "sku": "ACC-002",
            "quantity": 25,
            "unitPrice": 4.0
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-2",
        "quoteNumber": "QT-202610-2001",
        "totalAmount": 108.0,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "ACCEPTED",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-10-04T08:30:00.000Z",
        "items": [
          {
            "id": "qi-2-1",
            "productId": "ACC-002",
            "productName": "Nail Art Palette Square Blue",
            "quantity": 30,
            "unitPrice": 4.0,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-2",
        "toPhone": "+1-713-555-0188",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Linda Nguyen (Nails Warehouse), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-10-04T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-003",
    "businessName": "Texas Beauty Nail Supply",
    "contactPerson": "David Le",
    "phone": "+1-214-555-0145",
    "email": "orders@texasbeautynsupply.com",
    "address": "3200 Preston Rd, Suite 12",
    "city": "Dallas",
    "state": "TX",
    "zipCode": "75240",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Alice Nguyen",
    "tier": "VIP",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $3,440.50",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-10-13T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-3-1",
        "orderNumber": "INV-202610-1002",
        "totalAmount": 3521.0,
        "paidAmount": 3521.0,
        "paymentStatus": "PAID",
        "dueDate": "2026-10-15T00:00:00.000Z",
        "saleRep": "Alice Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-10-13T09:00:00.000Z",
        "items": [
          {
            "id": "oi-3-1",
            "productId": "ACC-003",
            "productName": "Nail Art Palette Heart Pink",
            "sku": "ACC-003",
            "quantity": 25,
            "unitPrice": 4.0
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-3",
        "quoteNumber": "QT-202610-2002",
        "totalAmount": 108.0,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "SENT",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-10-13T08:30:00.000Z",
        "items": [
          {
            "id": "qi-3-1",
            "productId": "ACC-003",
            "productName": "Nail Art Palette Heart Pink",
            "quantity": 30,
            "unitPrice": 4.0,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-3",
        "toPhone": "+1-214-555-0145",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi David Le (Texas Beauty Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-10-13T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-004",
    "businessName": "Monaco Nail Supply",
    "contactPerson": "Tina Tran",
    "phone": "+1-512-555-0199",
    "email": "orders@monaconailsusupply.com",
    "address": "11200 Lakeline Mall Dr",
    "city": "Austin",
    "state": "TX",
    "zipCode": "78717",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Johnny Tran",
    "tier": "VIP",
    "status": "AT_RISK",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $3,181.74",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-03-16T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-4-1",
        "orderNumber": "INV-202610-1003",
        "totalAmount": 1336.0,
        "paidAmount": 734.8,
        "paymentStatus": "OVERDUE",
        "dueDate": "2026-03-18T00:00:00.000Z",
        "saleRep": "Johnny Tran",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-03-16T09:00:00.000Z",
        "items": [
          {
            "id": "oi-4-1",
            "productId": "ACC-004",
            "productName": "Nail Art Palette Square Pink",
            "sku": "ACC-004",
            "quantity": 25,
            "unitPrice": 4.0
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-4",
        "quoteNumber": "QT-202610-2003",
        "totalAmount": 108.0,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "ACCEPTED",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-03-16T08:30:00.000Z",
        "items": [
          {
            "id": "qi-4-1",
            "productId": "ACC-004",
            "productName": "Nail Art Palette Square Pink",
            "quantity": 30,
            "unitPrice": 4.0,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-4",
        "toPhone": "+1-512-555-0199",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Tina Tran (Monaco Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-03-16T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-005",
    "businessName": "Invogue Nail Supply",
    "contactPerson": "Kevin Vu",
    "phone": "+1-210-555-0123",
    "email": "orders@invoguenailssupply.com",
    "address": "17503 La Cantera Pkwy",
    "city": "San Antonio",
    "state": "TX",
    "zipCode": "78257",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Hanna Nguyen",
    "tier": "VIP",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $2,191.82",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-05-27T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-5-1",
        "orderNumber": "INV-202610-1004",
        "totalAmount": 1828.01,
        "paidAmount": 1279.61,
        "paymentStatus": "PARTIAL",
        "dueDate": "2026-05-29T00:00:00.000Z",
        "saleRep": "Hanna Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-05-27T09:00:00.000Z",
        "items": [
          {
            "id": "oi-5-1",
            "productId": "ACC-005",
            "productName": "Small Art Nail Palette Butterfly",
            "sku": "ACC-005",
            "quantity": 25,
            "unitPrice": 2.5
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-5",
        "quoteNumber": "QT-202610-2004",
        "totalAmount": 67.5,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "SENT",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-05-27T08:30:00.000Z",
        "items": [
          {
            "id": "qi-5-1",
            "productId": "ACC-005",
            "productName": "Small Art Nail Palette Butterfly",
            "quantity": 30,
            "unitPrice": 2.5,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-5",
        "toPhone": "+1-210-555-0123",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Kevin Vu (Invogue Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-05-27T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-006",
    "businessName": "Sunny Nail Supply - Milwaukee",
    "contactPerson": "Jenny Hoang",
    "phone": "+1-414-555-0812",
    "email": "orders@sunnynailsupsupply.com",
    "address": "4820 W Loomis Rd",
    "city": "Milwaukee",
    "state": "WI",
    "zipCode": "53220",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Alice Nguyen",
    "tier": "VIP",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $3,347.64",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-09-16T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-6-1",
        "orderNumber": "INV-202610-1005",
        "totalAmount": 3177.5,
        "paidAmount": 0.0,
        "paymentStatus": "UNPAID",
        "dueDate": "2026-09-18T00:00:00.000Z",
        "saleRep": "Alice Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-09-16T09:00:00.000Z",
        "items": [
          {
            "id": "oi-6-1",
            "productId": "ACC-006",
            "productName": "Small Art Nail Palette Flower",
            "sku": "ACC-006",
            "quantity": 25,
            "unitPrice": 2.5
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-6",
        "quoteNumber": "QT-202610-2005",
        "totalAmount": 67.5,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "ACCEPTED",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-09-16T08:30:00.000Z",
        "items": [
          {
            "id": "qi-6-1",
            "productId": "ACC-006",
            "productName": "Small Art Nail Palette Flower",
            "quantity": 30,
            "unitPrice": 2.5,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-6",
        "toPhone": "+1-414-555-0812",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Jenny Hoang (Sunny Nail Supply - Milwaukee), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-09-16T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-007",
    "businessName": "Nailmark inc",
    "contactPerson": "Brian Pham",
    "phone": "+1-407-555-0391",
    "email": "orders@nailmarkincsupply.com",
    "address": "5140 W Colonial Dr",
    "city": "Orlando",
    "state": "FL",
    "zipCode": "32808",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Johnny Tran",
    "tier": "VIP",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $3,263.10",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-10-19T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-7-1",
        "orderNumber": "INV-202610-1006",
        "totalAmount": 5956.5,
        "paidAmount": 5956.5,
        "paymentStatus": "PAID",
        "dueDate": "2026-10-21T00:00:00.000Z",
        "saleRep": "Johnny Tran",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-10-19T09:00:00.000Z",
        "items": [
          {
            "id": "oi-7-1",
            "productId": "ACC-007",
            "productName": "Small Art Nail Palette Half Moon",
            "sku": "ACC-007",
            "quantity": 25,
            "unitPrice": 2.5
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-7",
        "quoteNumber": "QT-202610-2006",
        "totalAmount": 67.5,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "SENT",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-10-19T08:30:00.000Z",
        "items": [
          {
            "id": "qi-7-1",
            "productId": "ACC-007",
            "productName": "Small Art Nail Palette Half Moon",
            "quantity": 30,
            "unitPrice": 2.5,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-7",
        "toPhone": "+1-407-555-0391",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Brian Pham (Nailmark inc), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-10-19T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-008",
    "businessName": "Beauty Direct",
    "contactPerson": "Helen Do",
    "phone": "+1-208-555-0211",
    "email": "orders@beautydirectsupply.com",
    "address": "8420 W Fairview Ave",
    "city": "Boise",
    "state": "ID",
    "zipCode": "83704",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Hanna Nguyen",
    "tier": "VIP",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $3,512.92",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-09-29T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-8-1",
        "orderNumber": "INV-202610-1007",
        "totalAmount": 3006.0,
        "paidAmount": 3006.0,
        "paymentStatus": "PAID",
        "dueDate": "2026-10-01T00:00:00.000Z",
        "saleRep": "Hanna Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-09-29T09:00:00.000Z",
        "items": [
          {
            "id": "oi-8-1",
            "productId": "ACC-008",
            "productName": "Nail Art White Glitter Flower Palette",
            "sku": "ACC-008",
            "quantity": 25,
            "unitPrice": 4.0
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-8",
        "quoteNumber": "QT-202610-2007",
        "totalAmount": 108.0,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "ACCEPTED",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-09-29T08:30:00.000Z",
        "items": [
          {
            "id": "qi-8-1",
            "productId": "ACC-008",
            "productName": "Nail Art White Glitter Flower Palette",
            "quantity": 30,
            "unitPrice": 4.0,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-8",
        "toPhone": "+1-208-555-0211",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Helen Do (Beauty Direct), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-09-29T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-009",
    "businessName": "M2M Nail Supply",
    "contactPerson": "Sarah Vo",
    "phone": "+1-714-555-0943",
    "email": "orders@m2mnailsupplsupply.com",
    "address": "9522 Bolsa Ave",
    "city": "Westminster",
    "state": "CA",
    "zipCode": "92683",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Alice Nguyen",
    "tier": "WHOLESALE",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $1,513.30",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-10-04T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-9-1",
        "orderNumber": "INV-202610-1008",
        "totalAmount": 1365.5,
        "paidAmount": 955.85,
        "paymentStatus": "PARTIAL",
        "dueDate": "2026-10-06T00:00:00.000Z",
        "saleRep": "Alice Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-10-04T09:00:00.000Z",
        "items": [
          {
            "id": "oi-9-1",
            "productId": "ACC-009",
            "productName": "Foot File Pink",
            "sku": "ACC-009",
            "quantity": 25,
            "unitPrice": 4.5
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-9",
        "quoteNumber": "QT-202610-2008",
        "totalAmount": 121.5,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "SENT",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-10-04T08:30:00.000Z",
        "items": [
          {
            "id": "qi-9-1",
            "productId": "ACC-009",
            "productName": "Foot File Pink",
            "quantity": 30,
            "unitPrice": 4.5,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-9",
        "toPhone": "+1-714-555-0943",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Sarah Vo (M2M Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-10-04T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-010",
    "businessName": "Hollywood Beauty Supply",
    "contactPerson": "Michael Dang",
    "phone": "+1-408-555-0761",
    "email": "orders@hollywoodbeasupply.com",
    "address": "1111 Story Rd, Ste 102",
    "city": "San Jose",
    "state": "CA",
    "zipCode": "95122",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Johnny Tran",
    "tier": "VIP",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $3,021.03",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-10-1",
        "orderNumber": "INV-202610-1009",
        "totalAmount": 3563.65,
        "paidAmount": 3563.65,
        "paymentStatus": "PAID",
        "dueDate": "2026-09-24T00:00:00.000Z",
        "saleRep": "Johnny Tran",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-09-22T09:00:00.000Z",
        "items": [
          {
            "id": "oi-10-1",
            "productId": "ACC-010",
            "productName": "Foot File Black",
            "sku": "ACC-010",
            "quantity": 25,
            "unitPrice": 4.5
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-10",
        "quoteNumber": "QT-202610-2009",
        "totalAmount": 121.5,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "ACCEPTED",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-09-22T08:30:00.000Z",
        "items": [
          {
            "id": "qi-10-1",
            "productId": "ACC-010",
            "productName": "Foot File Black",
            "quantity": 30,
            "unitPrice": 4.5,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-10",
        "toPhone": "+1-408-555-0761",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Michael Dang (Hollywood Beauty Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-09-22T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-011",
    "businessName": "Boise Nail Supply",
    "contactPerson": "Nancy Truong",
    "phone": "+1-832-555-0456",
    "email": "orders@boisenailsupsupply.com",
    "address": "10613 Bellaire Blvd, Ste A",
    "city": "Houston",
    "state": "TX",
    "zipCode": "77072",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Hanna Nguyen",
    "tier": "WHOLESALE",
    "status": "AT_RISK",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $2,800.70",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-02-06T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-11-1",
        "orderNumber": "INV-202610-1010",
        "totalAmount": 1337.5,
        "paidAmount": 735.62,
        "paymentStatus": "OVERDUE",
        "dueDate": "2026-02-08T00:00:00.000Z",
        "saleRep": "Hanna Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-02-06T09:00:00.000Z",
        "items": [
          {
            "id": "oi-11-1",
            "productId": "ACC-011",
            "productName": "Big Blade",
            "sku": "ACC-011",
            "quantity": 25,
            "unitPrice": 3.0
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-11",
        "quoteNumber": "QT-202610-2010",
        "totalAmount": 81.0,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "SENT",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-02-06T08:30:00.000Z",
        "items": [
          {
            "id": "qi-11-1",
            "productId": "ACC-011",
            "productName": "Big Blade",
            "quantity": 30,
            "unitPrice": 3.0,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-11",
        "toPhone": "+1-832-555-0456",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Nancy Truong (Boise Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-02-06T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-012",
    "businessName": "Orlando Nail Supply",
    "contactPerson": "Steven Nguyen",
    "phone": "+1-713-555-0824",
    "email": "orders@orlandonailssupply.com",
    "address": "12140 Gulf Fwy",
    "city": "Houston",
    "state": "TX",
    "zipCode": "77034",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Alice Nguyen",
    "tier": "WHOLESALE",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $2,577.32",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-10-13T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-12-1",
        "orderNumber": "INV-202610-1011",
        "totalAmount": 2155.0,
        "paidAmount": 2155.0,
        "paymentStatus": "PAID",
        "dueDate": "2026-10-15T00:00:00.000Z",
        "saleRep": "Alice Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-10-13T09:00:00.000Z",
        "items": [
          {
            "id": "oi-12-1",
            "productId": "ACC-012",
            "productName": "Small Blade",
            "sku": "ACC-012",
            "quantity": 25,
            "unitPrice": 3.0
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-12",
        "quoteNumber": "QT-202610-2011",
        "totalAmount": 81.0,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "ACCEPTED",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-10-13T08:30:00.000Z",
        "items": [
          {
            "id": "qi-12-1",
            "productId": "ACC-012",
            "productName": "Small Blade",
            "quantity": 30,
            "unitPrice": 3.0,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-12",
        "toPhone": "+1-713-555-0824",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Steven Nguyen (Orlando Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-10-13T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-013",
    "businessName": "Jasmine Nail Supply",
    "contactPerson": "Jessica Le",
    "phone": "+1-281-555-0378",
    "email": "orders@jasminenailssupply.com",
    "address": "2000 Willowbrook Mall",
    "city": "Houston",
    "state": "TX",
    "zipCode": "77064",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Johnny Tran",
    "tier": "WHOLESALE",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $1,854.20",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-08-25T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-13-1",
        "orderNumber": "INV-202610-1012",
        "totalAmount": 1950.0,
        "paidAmount": 1365.0,
        "paymentStatus": "PARTIAL",
        "dueDate": "2026-08-27T00:00:00.000Z",
        "saleRep": "Johnny Tran",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-08-25T09:00:00.000Z",
        "items": [
          {
            "id": "oi-13-1",
            "productId": "ACC-013",
            "productName": "Big/ Small Blade",
            "sku": "ACC-013",
            "quantity": 25,
            "unitPrice": 3.0
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-13",
        "quoteNumber": "QT-202610-2012",
        "totalAmount": 81.0,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "SENT",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-08-25T08:30:00.000Z",
        "items": [
          {
            "id": "qi-13-1",
            "productId": "ACC-013",
            "productName": "Big/ Small Blade",
            "quantity": 30,
            "unitPrice": 3.0,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-13",
        "toPhone": "+1-281-555-0378",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Jessica Le (Jasmine Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-08-25T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-014",
    "businessName": "Naty Nail Supply",
    "contactPerson": "Peter Dinh",
    "phone": "+1-714-555-0639",
    "email": "orders@natynailsuppsupply.com",
    "address": "14361 Euclid St",
    "city": "Garden Grove",
    "state": "CA",
    "zipCode": "92843",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Hanna Nguyen",
    "tier": "WHOLESALE",
    "status": "AT_RISK",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $1,687.00",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-02-02T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-14-1",
        "orderNumber": "INV-202610-1013",
        "totalAmount": 786.25,
        "paidAmount": 432.44,
        "paymentStatus": "OVERDUE",
        "dueDate": "2026-02-04T00:00:00.000Z",
        "saleRep": "Hanna Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-02-02T09:00:00.000Z",
        "items": [
          {
            "id": "oi-14-1",
            "productId": "ACC-014",
            "productName": "Nail Brush Blue",
            "sku": "ACC-014",
            "quantity": 25,
            "unitPrice": 0.85
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-14",
        "quoteNumber": "QT-202610-2013",
        "totalAmount": 22.95,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "ACCEPTED",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-02-02T08:30:00.000Z",
        "items": [
          {
            "id": "qi-14-1",
            "productId": "ACC-014",
            "productName": "Nail Brush Blue",
            "quantity": 30,
            "unitPrice": 0.85,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-14",
        "toPhone": "+1-714-555-0639",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Peter Dinh (Naty Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-02-02T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-015",
    "businessName": "Inail Supply",
    "contactPerson": "Rachel Huynh",
    "phone": "+1-817-555-0482",
    "email": "orders@inailsupplysupply.com",
    "address": "3811 S Cooper St",
    "city": "Arlington",
    "state": "TX",
    "zipCode": "76015",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Alice Nguyen",
    "tier": "WHOLESALE",
    "status": "AT_RISK",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $1,215.30",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-03-25T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-15-1",
        "orderNumber": "INV-202610-1014",
        "totalAmount": 1966.5,
        "paidAmount": 1081.57,
        "paymentStatus": "OVERDUE",
        "dueDate": "2026-03-27T00:00:00.000Z",
        "saleRep": "Alice Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-03-25T09:00:00.000Z",
        "items": [
          {
            "id": "oi-15-1",
            "productId": "ACC-015",
            "productName": "Nail Brush Pink",
            "sku": "ACC-015",
            "quantity": 25,
            "unitPrice": 0.85
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-15",
        "quoteNumber": "QT-202610-2014",
        "totalAmount": 22.95,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "SENT",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-03-25T08:30:00.000Z",
        "items": [
          {
            "id": "qi-15-1",
            "productId": "ACC-015",
            "productName": "Nail Brush Pink",
            "quantity": 30,
            "unitPrice": 0.85,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-15",
        "toPhone": "+1-817-555-0482",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Rachel Huynh (Inail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-03-25T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-016",
    "businessName": "Cindy Hair Nail Supply",
    "contactPerson": "Tommy Ta",
    "phone": "+1-281-555-0917",
    "email": "orders@cindyhairnaisupply.com",
    "address": "23501 Cinco Ranch Blvd",
    "city": "Katy",
    "state": "TX",
    "zipCode": "77494",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Johnny Tran",
    "tier": "WHOLESALE",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $1,160.04",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-12-08T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-16-1",
        "orderNumber": "INV-202610-1015",
        "totalAmount": 484.0,
        "paidAmount": 0.0,
        "paymentStatus": "UNPAID",
        "dueDate": "2026-12-10T00:00:00.000Z",
        "saleRep": "Johnny Tran",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-12-08T09:00:00.000Z",
        "items": [
          {
            "id": "oi-16-1",
            "productId": "ACC-016",
            "productName": "Spider gel tool $",
            "sku": "ACC-016",
            "quantity": 25,
            "unitPrice": 15.0
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-16",
        "quoteNumber": "QT-202610-2015",
        "totalAmount": 405.0,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "ACCEPTED",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-12-08T08:30:00.000Z",
        "items": [
          {
            "id": "qi-16-1",
            "productId": "ACC-016",
            "productName": "Spider gel tool $",
            "quantity": 30,
            "unitPrice": 15.0,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-16",
        "toPhone": "+1-281-555-0917",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Tommy Ta (Cindy Hair Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-12-08T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-017",
    "businessName": "Golden Sun Nail Supply",
    "contactPerson": "Andy Tran",
    "phone": "+1-832-555-0142",
    "email": "orders@goldensunnaisupply.com",
    "address": "7211 Regency Square Blvd",
    "city": "Houston",
    "state": "TX",
    "zipCode": "77036",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Hanna Nguyen",
    "tier": "WHOLESALE",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $1,884.53",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-09-02T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-17-1",
        "orderNumber": "INV-202610-1016",
        "totalAmount": 2050.0,
        "paidAmount": 1435.0,
        "paymentStatus": "PARTIAL",
        "dueDate": "2026-09-04T00:00:00.000Z",
        "saleRep": "Hanna Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-09-02T09:00:00.000Z",
        "items": [
          {
            "id": "oi-17-1",
            "productId": "ACC-017",
            "productName": "Dotting Tool Set 5 Set Pieces",
            "sku": "ACC-017",
            "quantity": 25,
            "unitPrice": 4.0
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-17",
        "quoteNumber": "QT-202610-2016",
        "totalAmount": 108.0,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "SENT",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-09-02T08:30:00.000Z",
        "items": [
          {
            "id": "qi-17-1",
            "productId": "ACC-017",
            "productName": "Dotting Tool Set 5 Set Pieces",
            "quantity": 30,
            "unitPrice": 4.0,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-17",
        "toPhone": "+1-832-555-0142",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Andy Tran (Golden Sun Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-09-02T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-018",
    "businessName": "Elegant Nail Supply",
    "contactPerson": "Linda Nguyen",
    "phone": "+1-713-555-0188",
    "email": "orders@elegantnailssupply.com",
    "address": "9889 Bellaire Blvd, Ste 210",
    "city": "Houston",
    "state": "TX",
    "zipCode": "77036",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Alice Nguyen",
    "tier": "WHOLESALE",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $1,719.25",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-08-04T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-18-1",
        "orderNumber": "INV-202610-1017",
        "totalAmount": 2370.0,
        "paidAmount": 2370.0,
        "paymentStatus": "PAID",
        "dueDate": "2026-08-06T00:00:00.000Z",
        "saleRep": "Alice Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-08-04T09:00:00.000Z",
        "items": [
          {
            "id": "oi-18-1",
            "productId": "ACC-018",
            "productName": "Dotting Circle Tool",
            "sku": "ACC-018",
            "quantity": 25,
            "unitPrice": 3.5
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-18",
        "quoteNumber": "QT-202610-2017",
        "totalAmount": 94.5,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "ACCEPTED",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-08-04T08:30:00.000Z",
        "items": [
          {
            "id": "qi-18-1",
            "productId": "ACC-018",
            "productName": "Dotting Circle Tool",
            "quantity": 30,
            "unitPrice": 3.5,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-18",
        "toPhone": "+1-713-555-0188",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Linda Nguyen (Elegant Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-08-04T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-019",
    "businessName": "1 Stop Nail Supply",
    "contactPerson": "David Le",
    "phone": "+1-214-555-0145",
    "email": "orders@1stopnailsupsupply.com",
    "address": "3200 Preston Rd, Suite 12",
    "city": "Dallas",
    "state": "TX",
    "zipCode": "75240",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Johnny Tran",
    "tier": "WHOLESALE",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $1,321.60",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-12-10T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-19-1",
        "orderNumber": "INV-202610-1018",
        "totalAmount": 2975.0,
        "paidAmount": 2975.0,
        "paymentStatus": "PAID",
        "dueDate": "2026-12-12T00:00:00.000Z",
        "saleRep": "Johnny Tran",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-12-10T09:00:00.000Z",
        "items": [
          {
            "id": "oi-19-1",
            "productId": "ACC-019",
            "productName": "Diamond Pick Up Blue",
            "sku": "ACC-019",
            "quantity": 25,
            "unitPrice": 3.75
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-19",
        "quoteNumber": "QT-202610-2018",
        "totalAmount": 101.25,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "SENT",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-12-10T08:30:00.000Z",
        "items": [
          {
            "id": "qi-19-1",
            "productId": "ACC-019",
            "productName": "Diamond Pick Up Blue",
            "quantity": 30,
            "unitPrice": 3.75,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-19",
        "toPhone": "+1-214-555-0145",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi David Le (1 Stop Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-12-10T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-020",
    "businessName": "Diamond Nail Supply",
    "contactPerson": "Tina Tran",
    "phone": "+1-512-555-0199",
    "email": "orders@diamondnailssupply.com",
    "address": "11200 Lakeline Mall Dr",
    "city": "Austin",
    "state": "TX",
    "zipCode": "78717",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Hanna Nguyen",
    "tier": "WHOLESALE",
    "status": "AT_RISK",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $1,418.48",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-03-31T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-20-1",
        "orderNumber": "INV-202610-1019",
        "totalAmount": 536.0,
        "paidAmount": 294.8,
        "paymentStatus": "OVERDUE",
        "dueDate": "2026-04-02T00:00:00.000Z",
        "saleRep": "Hanna Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-03-31T09:00:00.000Z",
        "items": [
          {
            "id": "oi-20-1",
            "productId": "ACC-020",
            "productName": "Diamond Pick Up Red",
            "sku": "ACC-020",
            "quantity": 25,
            "unitPrice": 3.75
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-20",
        "quoteNumber": "QT-202610-2019",
        "totalAmount": 101.25,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "ACCEPTED",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-03-31T08:30:00.000Z",
        "items": [
          {
            "id": "qi-20-1",
            "productId": "ACC-020",
            "productName": "Diamond Pick Up Red",
            "quantity": 30,
            "unitPrice": 3.75,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-20",
        "toPhone": "+1-512-555-0199",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Tina Tran (Diamond Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-03-31T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-021",
    "businessName": "Rosie Tech School",
    "contactPerson": "Kevin Vu",
    "phone": "+1-210-555-0123",
    "email": "orders@rosietechschsupply.com",
    "address": "17503 La Cantera Pkwy",
    "city": "San Antonio",
    "state": "TX",
    "zipCode": "78257",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Alice Nguyen",
    "tier": "WHOLESALE",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $903.56",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-06-24T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-21-1",
        "orderNumber": "INV-202610-1020",
        "totalAmount": 424.2,
        "paidAmount": 296.94,
        "paymentStatus": "PARTIAL",
        "dueDate": "2026-06-26T00:00:00.000Z",
        "saleRep": "Alice Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-06-24T09:00:00.000Z",
        "items": [
          {
            "id": "oi-21-1",
            "productId": "ACC-021",
            "productName": "D iamond P icker W ith D otting Black Out of stock",
            "sku": "ACC-021",
            "quantity": 25,
            "unitPrice": 3.75
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-21",
        "quoteNumber": "QT-202610-2020",
        "totalAmount": 101.25,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "SENT",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-06-24T08:30:00.000Z",
        "items": [
          {
            "id": "qi-21-1",
            "productId": "ACC-021",
            "productName": "D iamond P icker W ith D otting Black Out of stock",
            "quantity": 30,
            "unitPrice": 3.75,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-21",
        "toPhone": "+1-210-555-0123",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Kevin Vu (Rosie Tech School), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-06-24T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-022",
    "businessName": "T Spa Nail Supply",
    "contactPerson": "Jenny Hoang",
    "phone": "+1-414-555-0812",
    "email": "orders@tspanailsuppsupply.com",
    "address": "4820 W Loomis Rd",
    "city": "Milwaukee",
    "state": "WI",
    "zipCode": "53220",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Johnny Tran",
    "tier": "WHOLESALE",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $300.00",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-06-02T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-22-1",
        "orderNumber": "INV-202610-1021",
        "totalAmount": 510.0,
        "paidAmount": 510.0,
        "paymentStatus": "PAID",
        "dueDate": "2026-06-04T00:00:00.000Z",
        "saleRep": "Johnny Tran",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-06-02T09:00:00.000Z",
        "items": [
          {
            "id": "oi-22-1",
            "productId": "ACC-022",
            "productName": "D iamond P icker W ith D otting Pink",
            "sku": "ACC-022",
            "quantity": 25,
            "unitPrice": 3.75
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-22",
        "quoteNumber": "QT-202610-2021",
        "totalAmount": 101.25,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "ACCEPTED",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-06-02T08:30:00.000Z",
        "items": [
          {
            "id": "qi-22-1",
            "productId": "ACC-022",
            "productName": "D iamond P icker W ith D otting Pink",
            "quantity": 30,
            "unitPrice": 3.75,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-22",
        "toPhone": "+1-414-555-0812",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Jenny Hoang (T Spa Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-06-02T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-023",
    "businessName": "Tgel Nail Supply",
    "contactPerson": "Brian Pham",
    "phone": "+1-407-555-0391",
    "email": "orders@tgelnailsuppsupply.com",
    "address": "5140 W Colonial Dr",
    "city": "Orlando",
    "state": "FL",
    "zipCode": "32808",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Hanna Nguyen",
    "tier": "WHOLESALE",
    "status": "AT_RISK",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $1,075.00",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-03-16T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-23-1",
        "orderNumber": "INV-202610-1022",
        "totalAmount": 1950.0,
        "paidAmount": 1072.5,
        "paymentStatus": "OVERDUE",
        "dueDate": "2026-03-18T00:00:00.000Z",
        "saleRep": "Hanna Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-03-16T09:00:00.000Z",
        "items": [
          {
            "id": "oi-23-1",
            "productId": "ACC-023",
            "productName": "S ilicon P en S ingle White",
            "sku": "ACC-023",
            "quantity": 25,
            "unitPrice": 2.5
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-23",
        "quoteNumber": "QT-202610-2022",
        "totalAmount": 67.5,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "SENT",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-03-16T08:30:00.000Z",
        "items": [
          {
            "id": "qi-23-1",
            "productId": "ACC-023",
            "productName": "S ilicon P en S ingle White",
            "quantity": 30,
            "unitPrice": 2.5,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-23",
        "toPhone": "+1-407-555-0391",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Brian Pham (Tgel Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-03-16T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-024",
    "businessName": "Nail Supply Avenue",
    "contactPerson": "Helen Do",
    "phone": "+1-208-555-0211",
    "email": "orders@nailsupplyavsupply.com",
    "address": "8420 W Fairview Ave",
    "city": "Boise",
    "state": "ID",
    "zipCode": "83704",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Alice Nguyen",
    "tier": "WHOLESALE",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $855.50",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-09-29T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-24-1",
        "orderNumber": "INV-202610-1023",
        "totalAmount": 1449.5,
        "paidAmount": 1449.5,
        "paymentStatus": "PAID",
        "dueDate": "2026-10-01T00:00:00.000Z",
        "saleRep": "Alice Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-09-29T09:00:00.000Z",
        "items": [
          {
            "id": "oi-24-1",
            "productId": "ACC-024",
            "productName": "Silicon Pen Set - 3D Design . 25",
            "sku": "ACC-024",
            "quantity": 25,
            "unitPrice": 4.0
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-24",
        "quoteNumber": "QT-202610-2023",
        "totalAmount": 108.0,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "ACCEPTED",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-09-29T08:30:00.000Z",
        "items": [
          {
            "id": "qi-24-1",
            "productId": "ACC-024",
            "productName": "Silicon Pen Set - 3D Design . 25",
            "quantity": 30,
            "unitPrice": 4.0,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-24",
        "toPhone": "+1-208-555-0211",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Helen Do (Nail Supply Avenue), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-09-29T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-025",
    "businessName": "COCONUT - Nail & Beauty Supply",
    "contactPerson": "Sarah Vo",
    "phone": "+1-714-555-0943",
    "email": "orders@coconutnailbsupply.com",
    "address": "9522 Bolsa Ave",
    "city": "Westminster",
    "state": "CA",
    "zipCode": "92683",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Johnny Tran",
    "tier": "WHOLESALE",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $638.80",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-08-26T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-25-1",
        "orderNumber": "INV-202610-1024",
        "totalAmount": 1298.0,
        "paidAmount": 908.6,
        "paymentStatus": "PARTIAL",
        "dueDate": "2026-08-28T00:00:00.000Z",
        "saleRep": "Johnny Tran",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-08-26T09:00:00.000Z",
        "items": [
          {
            "id": "oi-25-1",
            "productId": "ACC-025",
            "productName": "Nail Chrome Silicon – Pink",
            "sku": "ACC-025",
            "quantity": 25,
            "unitPrice": 2.25
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-25",
        "quoteNumber": "QT-202610-2024",
        "totalAmount": 60.75,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "SENT",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-08-26T08:30:00.000Z",
        "items": [
          {
            "id": "qi-25-1",
            "productId": "ACC-025",
            "productName": "Nail Chrome Silicon – Pink",
            "quantity": 30,
            "unitPrice": 2.25,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-25",
        "toPhone": "+1-714-555-0943",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Sarah Vo (COCONUT - Nail & Beauty Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-08-26T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-026",
    "businessName": "NT Nail Supply",
    "contactPerson": "Michael Dang",
    "phone": "+1-408-555-0761",
    "email": "orders@ntnailsupplysupply.com",
    "address": "1111 Story Rd, Ste 102",
    "city": "San Jose",
    "state": "CA",
    "zipCode": "95122",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Hanna Nguyen",
    "tier": "STANDARD",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $910.92",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-08-05T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-26-1",
        "orderNumber": "INV-202610-1025",
        "totalAmount": 435.0,
        "paidAmount": 0.0,
        "paymentStatus": "UNPAID",
        "dueDate": "2026-08-07T00:00:00.000Z",
        "saleRep": "Hanna Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-08-05T09:00:00.000Z",
        "items": [
          {
            "id": "oi-26-1",
            "productId": "ACC-026",
            "productName": "Nail Chrome Silicon – Black",
            "sku": "ACC-026",
            "quantity": 25,
            "unitPrice": 2.25
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-26",
        "quoteNumber": "QT-202610-2025",
        "totalAmount": 60.75,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "ACCEPTED",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-08-05T08:30:00.000Z",
        "items": [
          {
            "id": "qi-26-1",
            "productId": "ACC-026",
            "productName": "Nail Chrome Silicon – Black",
            "quantity": 30,
            "unitPrice": 2.25,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-26",
        "toPhone": "+1-408-555-0761",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Michael Dang (NT Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-08-05T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-027",
    "businessName": "Seneca Nail Supply",
    "contactPerson": "Nancy Truong",
    "phone": "+1-832-555-0456",
    "email": "orders@senecanailsusupply.com",
    "address": "10613 Bellaire Blvd, Ste A",
    "city": "Houston",
    "state": "TX",
    "zipCode": "77072",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Alice Nguyen",
    "tier": "STANDARD",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $553.10",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-10-20T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-27-1",
        "orderNumber": "INV-202610-1026",
        "totalAmount": 958.0,
        "paidAmount": 958.0,
        "paymentStatus": "PAID",
        "dueDate": "2026-10-22T00:00:00.000Z",
        "saleRep": "Alice Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-10-20T09:00:00.000Z",
        "items": [
          {
            "id": "oi-27-1",
            "productId": "ACC-027",
            "productName": "Sand band mini - Long – Pink Medium",
            "sku": "ACC-027",
            "quantity": 25,
            "unitPrice": 3.75
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-27",
        "quoteNumber": "QT-202610-2026",
        "totalAmount": 101.25,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "SENT",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-10-20T08:30:00.000Z",
        "items": [
          {
            "id": "qi-27-1",
            "productId": "ACC-027",
            "productName": "Sand band mini - Long – Pink Medium",
            "quantity": 30,
            "unitPrice": 3.75,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-27",
        "toPhone": "+1-832-555-0456",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Nancy Truong (Seneca Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-10-20T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-028",
    "businessName": "WOO Nail Supply",
    "contactPerson": "Steven Nguyen",
    "phone": "+1-713-555-0824",
    "email": "orders@woonailsupplsupply.com",
    "address": "12140 Gulf Fwy",
    "city": "Houston",
    "state": "TX",
    "zipCode": "77034",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Johnny Tran",
    "tier": "STANDARD",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $427.68",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-10-22T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-28-1",
        "orderNumber": "INV-202610-1027",
        "totalAmount": 685.8,
        "paidAmount": 685.8,
        "paymentStatus": "PAID",
        "dueDate": "2026-10-24T00:00:00.000Z",
        "saleRep": "Johnny Tran",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-10-22T09:00:00.000Z",
        "items": [
          {
            "id": "oi-28-1",
            "productId": "ACC-028",
            "productName": "Sand band mini - Long – Pink Fine",
            "sku": "ACC-028",
            "quantity": 25,
            "unitPrice": 3.75
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-28",
        "quoteNumber": "QT-202610-2027",
        "totalAmount": 101.25,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "ACCEPTED",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-10-22T08:30:00.000Z",
        "items": [
          {
            "id": "qi-28-1",
            "productId": "ACC-028",
            "productName": "Sand band mini - Long – Pink Fine",
            "quantity": 30,
            "unitPrice": 3.75,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-28",
        "toPhone": "+1-713-555-0824",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Steven Nguyen (WOO Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-10-22T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-029",
    "businessName": "A Nail Supply",
    "contactPerson": "Jessica Le",
    "phone": "+1-281-555-0378",
    "email": "orders@anailsupplysupply.com",
    "address": "2000 Willowbrook Mall",
    "city": "Houston",
    "state": "TX",
    "zipCode": "77064",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Hanna Nguyen",
    "tier": "STANDARD",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $443.00",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-04-22T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-29-1",
        "orderNumber": "INV-202610-1028",
        "totalAmount": 600.0,
        "paidAmount": 420.0,
        "paymentStatus": "PARTIAL",
        "dueDate": "2026-04-24T00:00:00.000Z",
        "saleRep": "Hanna Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-04-22T09:00:00.000Z",
        "items": [
          {
            "id": "oi-29-1",
            "productId": "ACC-029",
            "productName": "Sand Band (Size Fine, Medium, Coarse) Pink",
            "sku": "ACC-029",
            "quantity": 25,
            "unitPrice": 3.25
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-29",
        "quoteNumber": "QT-202610-2028",
        "totalAmount": 87.75,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "SENT",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-04-22T08:30:00.000Z",
        "items": [
          {
            "id": "qi-29-1",
            "productId": "ACC-029",
            "productName": "Sand Band (Size Fine, Medium, Coarse) Pink",
            "quantity": 30,
            "unitPrice": 3.25,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-29",
        "toPhone": "+1-281-555-0378",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Jessica Le (A Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-04-22T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-030",
    "businessName": "Nail Gurus Spa",
    "contactPerson": "Peter Dinh",
    "phone": "+1-714-555-0639",
    "email": "orders@nailgurusspasupply.com",
    "address": "14361 Euclid St",
    "city": "Garden Grove",
    "state": "CA",
    "zipCode": "92843",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Alice Nguyen",
    "tier": "STANDARD",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $296.50",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-09-01T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-30-1",
        "orderNumber": "INV-202610-1029",
        "totalAmount": 225.0,
        "paidAmount": 225.0,
        "paymentStatus": "PAID",
        "dueDate": "2026-09-03T00:00:00.000Z",
        "saleRep": "Alice Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-09-01T09:00:00.000Z",
        "items": [
          {
            "id": "oi-30-1",
            "productId": "ACC-030",
            "productName": "Sand Band (Size Fine, Medium, Coarse) Zebra",
            "sku": "ACC-030",
            "quantity": 25,
            "unitPrice": 3.25
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-30",
        "quoteNumber": "QT-202610-2029",
        "totalAmount": 87.75,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "ACCEPTED",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-09-01T08:30:00.000Z",
        "items": [
          {
            "id": "qi-30-1",
            "productId": "ACC-030",
            "productName": "Sand Band (Size Fine, Medium, Coarse) Zebra",
            "quantity": 30,
            "unitPrice": 3.25,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-30",
        "toPhone": "+1-714-555-0639",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Peter Dinh (Nail Gurus Spa), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-09-01T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-031",
    "businessName": "Rossie Tech Nail Supply",
    "contactPerson": "Rachel Huynh",
    "phone": "+1-817-555-0482",
    "email": "orders@rossietechnasupply.com",
    "address": "3811 S Cooper St",
    "city": "Arlington",
    "state": "TX",
    "zipCode": "76015",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Johnny Tran",
    "tier": "STANDARD",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $150.60",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-10-19T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-31-1",
        "orderNumber": "INV-202610-1030",
        "totalAmount": 303.0,
        "paidAmount": 0.0,
        "paymentStatus": "UNPAID",
        "dueDate": "2026-10-21T00:00:00.000Z",
        "saleRep": "Johnny Tran",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-10-19T09:00:00.000Z",
        "items": [
          {
            "id": "oi-31-1",
            "productId": "ACC-031",
            "productName": "Sand band Zebra – Big Medium $",
            "sku": "ACC-031",
            "quantity": 25,
            "unitPrice": 15.0
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-31",
        "quoteNumber": "QT-202610-2030",
        "totalAmount": 405.0,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "SENT",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-10-19T08:30:00.000Z",
        "items": [
          {
            "id": "qi-31-1",
            "productId": "ACC-031",
            "productName": "Sand band Zebra – Big Medium $",
            "quantity": 30,
            "unitPrice": 15.0,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-31",
        "toPhone": "+1-817-555-0482",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Rachel Huynh (Rossie Tech Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-10-19T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  },
  {
    "id": "cus-032",
    "businessName": "LaMi Nail Supply",
    "contactPerson": "Tommy Ta",
    "phone": "+1-281-555-0917",
    "email": "orders@laminailsuppsupply.com",
    "address": "23501 Cinco Ranch Blvd",
    "city": "Katy",
    "state": "TX",
    "zipCode": "77494",
    "birthday": "1988-06-15T00:00:00.000Z",
    "assignedSale": "Hanna Nguyen",
    "tier": "STANDARD",
    "status": "ACTIVE",
    "notes": "Verified B2B wholesale account from JKIOCEAN. Margin contribution: $100.40",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2026-10-04T10:00:00.000Z",
    "orders": [
      {
        "id": "ord-32-1",
        "orderNumber": "INV-202610-1031",
        "totalAmount": 202.0,
        "paidAmount": 202.0,
        "paymentStatus": "PAID",
        "dueDate": "2026-10-06T00:00:00.000Z",
        "saleRep": "Hanna Nguyen",
        "notes": "Wholesale order fulfilled from Houston Hub. Payment method: Zelle/Check.",
        "createdAt": "2026-10-04T09:00:00.000Z",
        "items": [
          {
            "id": "oi-32-1",
            "productId": "ACC-032",
            "productName": "Sand band Zebra – Big Fine $",
            "sku": "ACC-032",
            "quantity": 25,
            "unitPrice": 15.0
          }
        ]
      }
    ],
    "quotes": [
      {
        "id": "qt-32",
        "quoteNumber": "QT-202610-2031",
        "totalAmount": 405.0,
        "validUntil": "2026-11-15T00:00:00.000Z",
        "status": "ACCEPTED",
        "notes": "Special wholesale quote delivered from Houston Hub",
        "createdAt": "2026-10-04T08:30:00.000Z",
        "items": [
          {
            "id": "qi-32-1",
            "productId": "ACC-032",
            "productName": "Sand band Zebra – Big Fine $",
            "quantity": 30,
            "unitPrice": 15.0,
            "discount": 10
          }
        ]
      }
    ],
    "smsLogs": [
      {
        "id": "sms-32",
        "toPhone": "+1-281-555-0917",
        "fromPhone": "+17133306165",
        "content": "JKIOCEAN: Hi Tommy Ta (LaMi Nail Supply), JKI has sent your October quote. Contact our hotline if you need assistance!",
        "type": "FOLLOW_UP",
        "status": "SENT",
        "createdAt": "2026-10-04T14:00:00.000Z"
      }
    ],
    "churnSurveys": []
  }
];

export const initialMockLeads: MockLead[] = [
  {
    id: "lead-001",
    salonName: "Milano Nail Spa Austin",
    ownerName: "David Hoang",
    phone: "+15125550143",
    city: "Austin",
    state: "TX",
    address: "10515 N Mopac Expy",
    googleReviewCount: 420,
    rating: 4.8,
    icpScore: 94,
    personalizedHook: "High-volume salon with 24 technicians specializing in Ombre powder; massive demand for Z-Brushes.",
    status: "NEW",
    assignedSale: "hanna",
    createdAt: "2026-10-18T08:00:00.000Z",
    updatedAt: "2026-10-18T08:00:00.000Z"
  },
  {
    id: "lead-002",
    salonName: "Venetian Nails Lounge Katy",
    ownerName: "Kathy Vo",
    phone: "+12815550155",
    city: "Katy",
    state: "TX",
    address: "23501 Cinco Ranch Blvd",
    googleReviewCount: 680,
    rating: 4.9,
    icpScore: 91,
    personalizedHook: "Affluent Katy area, technicians demand precision Cobalt cuticle nippers.",
    status: "CONTACTED",
    assignedSale: "hanna",
    createdAt: "2026-10-15T09:30:00.000Z",
    updatedAt: "2026-10-17T11:00:00.000Z"
  }
];

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
    ...c,
    id: `cus-${Date.now()}`,
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
  const index = mockCustomersStore.findIndex((c) => c.id === id);
  if (index === -1) return null;
  mockCustomersStore[index] = {
    ...mockCustomersStore[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return mockCustomersStore[index];
}

export function deleteMockCustomer(id: string): boolean {
  const initialLen = mockCustomersStore.length;
  mockCustomersStore = mockCustomersStore.filter((c) => c.id !== id);
  return mockCustomersStore.length < initialLen;
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
  const index = mockLeadsStore.findIndex((l) => l.id === id);
  if (index === -1) return null;
  mockLeadsStore[index] = {
    ...mockLeadsStore[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return mockLeadsStore[index];
}

export function addMockSmsLog(
  customerIdOrObj: any,
  toPhone?: string,
  content?: string,
  type?: string
) {
  let custId = null;
  let targetPhone = "";
  let smsContent = "";
  let smsType = "FOLLOW_UP";

  if (typeof customerIdOrObj === "object" && customerIdOrObj !== null) {
    custId = customerIdOrObj.customerId;
    targetPhone = customerIdOrObj.toPhone;
    smsContent = customerIdOrObj.content;
    smsType = customerIdOrObj.type || "FOLLOW_UP";
  } else {
    custId = customerIdOrObj;
    targetPhone = toPhone || "";
    smsContent = content || "";
    smsType = type || "FOLLOW_UP";
  }

  const newLog = {
    id: `sms-${Date.now()}`,
    customerId: custId,
    toPhone: targetPhone,
    fromPhone: "+17133306165",
    content: smsContent,
    type: smsType,
    status: "SENT",
    createdAt: new Date().toISOString(),
  };

  if (custId) {
    const cust = mockCustomersStore.find((c) => c.id === custId);
    if (cust) {
      cust.smsLogs.unshift(newLog as any);
    }
  }

  return newLog;
}
