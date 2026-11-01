import { prisma } from "@/lib/prisma";

export interface QuoteItemData {
  id?: string;
  productId: string;
  productName: string;
  sku: string;
  imageUrl?: string;
  category?: string;
  quantity: number;
  unitPrice: number;
  discount: number; // percentage e.g. 10 = 10%
  lineTotal: number;
}

export interface QuoteCustomerData {
  id: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  tier?: string;
}

export interface QuoteData {
  id: string;
  quoteNumber: string;
  customerId: string;
  customer: QuoteCustomerData;
  totalAmount: number;
  subtotal: number;
  totalDiscount: number;
  shipping: number;
  validUntil: string;
  createdAt: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED";
  notes?: string | null;
  paymentTerms?: string;
  createdUser: string;
  items: QuoteItemData[];
}

export interface ProductCatalogItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  wholesalePrice: number;
  retailPrice: number;
  currentStock: number;
  location: string;
}

// 32 Real B2B Customers from CUSTOMER FOR SALE.xlsx
export const SAMPLE_CUSTOMERS: QuoteCustomerData[] = [
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
    "tier": "VIP"
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
    "tier": "VIP"
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
    "tier": "VIP"
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
    "tier": "VIP"
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
    "tier": "VIP"
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
    "tier": "VIP"
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
    "tier": "VIP"
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
    "tier": "VIP"
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
    "tier": "WHOLESALE"
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
    "tier": "VIP"
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
    "tier": "WHOLESALE"
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
    "tier": "WHOLESALE"
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
    "tier": "WHOLESALE"
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
    "tier": "WHOLESALE"
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
    "tier": "WHOLESALE"
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
    "tier": "WHOLESALE"
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
    "tier": "WHOLESALE"
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
    "tier": "WHOLESALE"
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
    "tier": "WHOLESALE"
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
    "tier": "WHOLESALE"
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
    "tier": "WHOLESALE"
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
    "tier": "WHOLESALE"
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
    "tier": "WHOLESALE"
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
    "tier": "WHOLESALE"
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
    "tier": "WHOLESALE"
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
    "tier": "STANDARD"
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
    "tier": "STANDARD"
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
    "tier": "STANDARD"
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
    "tier": "STANDARD"
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
    "tier": "STANDARD"
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
    "tier": "STANDARD"
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
    "tier": "STANDARD"
  }
];

// 345+ Products with Extracted Images from Mix 06.10. 2026.docx
export const SAMPLE_PRODUCTS: ProductCatalogItem[] = [
  {
    "id": "prod-001",
    "sku": "ACC-001",
    "name": "Nail Art Palette Heart Blue",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_368.png",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 63,
    "location": "Houston Hub (Shelf B2)"
  },
  {
    "id": "prod-002",
    "sku": "ACC-002",
    "name": "Nail Art Palette Square Blue",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_370.png",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 76,
    "location": "Houston Hub (Shelf C3)"
  },
  {
    "id": "prod-003",
    "sku": "ACC-003",
    "name": "Nail Art Palette Heart Pink",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_372.png",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 89,
    "location": "Houston Hub (Shelf D4)"
  },
  {
    "id": "prod-004",
    "sku": "ACC-004",
    "name": "Nail Art Palette Square Pink",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_374.png",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 102,
    "location": "Houston Hub (Shelf E5)"
  },
  {
    "id": "prod-005",
    "sku": "ACC-005",
    "name": "Small Art Nail Palette Butterfly",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_002.png",
    "wholesalePrice": 2.5,
    "retailPrice": 3.5,
    "currentStock": 115,
    "location": "Houston Hub (Shelf F6)"
  },
  {
    "id": "prod-006",
    "sku": "ACC-006",
    "name": "Small Art Nail Palette Flower",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_003.png",
    "wholesalePrice": 2.5,
    "retailPrice": 3.5,
    "currentStock": 128,
    "location": "Houston Hub (Shelf A7)"
  },
  {
    "id": "prod-007",
    "sku": "ACC-007",
    "name": "Small Art Nail Palette Half Moon",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_004.png",
    "wholesalePrice": 2.5,
    "retailPrice": 3.5,
    "currentStock": 141,
    "location": "Houston Hub (Shelf B8)"
  },
  {
    "id": "prod-008",
    "sku": "ACC-008",
    "name": "Nail Art White Glitter Flower Palette",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_005.png",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 154,
    "location": "Houston Hub (Shelf C1)"
  },
  {
    "id": "prod-009",
    "sku": "ACC-009",
    "name": "Foot File Pink",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_006.png",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 6,
    "location": "Houston Hub (Shelf D2)"
  },
  {
    "id": "prod-010",
    "sku": "ACC-010",
    "name": "Foot File Black",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_008.png",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 60,
    "location": "Houston Hub (Shelf E3)"
  },
  {
    "id": "prod-011",
    "sku": "ACC-011",
    "name": "Big Blade",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_010.png",
    "wholesalePrice": 3.0,
    "retailPrice": 4.2,
    "currentStock": 73,
    "location": "Houston Hub (Shelf F4)"
  },
  {
    "id": "prod-012",
    "sku": "ACC-012",
    "name": "Small Blade",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_012.png",
    "wholesalePrice": 3.0,
    "retailPrice": 4.2,
    "currentStock": 86,
    "location": "Houston Hub (Shelf A5)"
  },
  {
    "id": "prod-013",
    "sku": "ACC-013",
    "name": "Big/ Small Blade",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_014.png",
    "wholesalePrice": 3.0,
    "retailPrice": 4.2,
    "currentStock": 99,
    "location": "Houston Hub (Shelf B6)"
  },
  {
    "id": "prod-014",
    "sku": "ACC-014",
    "name": "Nail Brush Blue",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_015.png",
    "wholesalePrice": 0.85,
    "retailPrice": 1.19,
    "currentStock": 112,
    "location": "Houston Hub (Shelf C7)"
  },
  {
    "id": "prod-015",
    "sku": "ACC-015",
    "name": "Nail Brush Pink",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_016.png",
    "wholesalePrice": 0.85,
    "retailPrice": 1.19,
    "currentStock": 125,
    "location": "Houston Hub (Shelf D8)"
  },
  {
    "id": "prod-016",
    "sku": "ACC-016",
    "name": "Spider gel tool $",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_017.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 138,
    "location": "Houston Hub (Shelf E1)"
  },
  {
    "id": "prod-017",
    "sku": "ACC-017",
    "name": "Dotting Tool Set 5 Set Pieces",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_018.png",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 151,
    "location": "Houston Hub (Shelf F2)"
  },
  {
    "id": "prod-018",
    "sku": "ACC-018",
    "name": "Dotting Circle Tool",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_020.png",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A3)"
  },
  {
    "id": "prod-019",
    "sku": "ACC-019",
    "name": "Diamond Pick Up Blue",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_022.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 57,
    "location": "Houston Hub (Shelf B4)"
  },
  {
    "id": "prod-020",
    "sku": "ACC-020",
    "name": "Diamond Pick Up Red",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_023.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 70,
    "location": "Houston Hub (Shelf C5)"
  },
  {
    "id": "prod-021",
    "sku": "ACC-021",
    "name": "D iamond P icker W ith D otting Black Out of stock",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_024.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 83,
    "location": "Houston Hub (Shelf D6)"
  },
  {
    "id": "prod-022",
    "sku": "ACC-022",
    "name": "D iamond P icker W ith D otting Pink",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_025.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 96,
    "location": "Houston Hub (Shelf E7)"
  },
  {
    "id": "prod-023",
    "sku": "ACC-023",
    "name": "S ilicon P en S ingle White",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_026.png",
    "wholesalePrice": 2.5,
    "retailPrice": 3.5,
    "currentStock": 109,
    "location": "Houston Hub (Shelf F8)"
  },
  {
    "id": "prod-024",
    "sku": "ACC-024",
    "name": "Silicon Pen Set - 3D Design . 25",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_027.png",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 122,
    "location": "Houston Hub (Shelf A1)"
  },
  {
    "id": "prod-025",
    "sku": "ACC-025",
    "name": "Nail Chrome Silicon – Pink",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_028.png",
    "wholesalePrice": 2.25,
    "retailPrice": 3.15,
    "currentStock": 135,
    "location": "Houston Hub (Shelf B2)"
  },
  {
    "id": "prod-026",
    "sku": "ACC-026",
    "name": "Nail Chrome Silicon – Black",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_029.png",
    "wholesalePrice": 2.25,
    "retailPrice": 3.15,
    "currentStock": 148,
    "location": "Houston Hub (Shelf C3)"
  },
  {
    "id": "prod-027",
    "sku": "ACC-027",
    "name": "Sand band mini - Long – Pink Medium",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_030.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 6,
    "location": "Houston Hub (Shelf D4)"
  },
  {
    "id": "prod-028",
    "sku": "ACC-028",
    "name": "Sand band mini - Long – Pink Fine",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_031.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 54,
    "location": "Houston Hub (Shelf E5)"
  },
  {
    "id": "prod-029",
    "sku": "ACC-029",
    "name": "Sand Band (Size Fine, Medium, Coarse) Pink",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_032.png",
    "wholesalePrice": 3.25,
    "retailPrice": 4.55,
    "currentStock": 67,
    "location": "Houston Hub (Shelf F6)"
  },
  {
    "id": "prod-030",
    "sku": "ACC-030",
    "name": "Sand Band (Size Fine, Medium, Coarse) Zebra",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_033.png",
    "wholesalePrice": 3.25,
    "retailPrice": 4.55,
    "currentStock": 80,
    "location": "Houston Hub (Shelf A7)"
  },
  {
    "id": "prod-031",
    "sku": "ACC-031",
    "name": "Sand band Zebra – Big Medium $",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_034.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 93,
    "location": "Houston Hub (Shelf B8)"
  },
  {
    "id": "prod-032",
    "sku": "ACC-032",
    "name": "Sand band Zebra – Big Fine $",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_034.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 106,
    "location": "Houston Hub (Shelf C1)"
  },
  {
    "id": "prod-033",
    "sku": "ACC-033",
    "name": "Petal Flower Dotting Pen $",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_035.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 119,
    "location": "Houston Hub (Shelf D2)"
  },
  {
    "id": "prod-034",
    "sku": "ACC-034",
    "name": "Pick up sponge S ilver",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_036.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 132,
    "location": "Houston Hub (Shelf E3)"
  },
  {
    "id": "prod-035",
    "sku": "ACC-035",
    "name": "Pick up sponge Gold",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_037.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 145,
    "location": "Houston Hub (Shelf F4)"
  },
  {
    "id": "prod-036",
    "sku": "ACC-036",
    "name": "Almond- shape French Cut",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_038.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A5)"
  },
  {
    "id": "prod-037",
    "sku": "ACC-037",
    "name": "Oval- shape French Cut",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_039.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 51,
    "location": "Houston Hub (Shelf B6)"
  },
  {
    "id": "prod-038",
    "sku": "ACC-038",
    "name": "Square- shape French Cut",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_040.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 64,
    "location": "Houston Hub (Shelf C7)"
  },
  {
    "id": "prod-039",
    "sku": "ACC-039",
    "name": "V - shape Deep French Cut",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_041.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 77,
    "location": "Houston Hub (Shelf D8)"
  },
  {
    "id": "prod-040",
    "sku": "ACC-040",
    "name": "V - shape French Cut",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_042.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 90,
    "location": "Houston Hub (Shelf E1)"
  },
  {
    "id": "prod-041",
    "sku": "ACC-041",
    "name": "O val- shape Small French Cut",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_043.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 103,
    "location": "Houston Hub (Shelf F2)"
  },
  {
    "id": "prod-042",
    "sku": "ACC-042",
    "name": "Cuticle oil",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_044.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 116,
    "location": "Houston Hub (Shelf A3)"
  },
  {
    "id": "prod-043",
    "sku": "ACC-043",
    "name": "Bead 3d3D Nail Art Gel Bead Maker 2 mm",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_045.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 129,
    "location": "Houston Hub (Shelf B4)"
  },
  {
    "id": "prod-044",
    "sku": "ACC-044",
    "name": "Bead 3d3D Nail Art Gel Bead Maker 3mm",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_046.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 142,
    "location": "Houston Hub (Shelf C5)"
  },
  {
    "id": "prod-045",
    "sku": "ACC-045",
    "name": "Bead 3d3D Nail Art Gel Bead Maker 4mm",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_047.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 6,
    "location": "Houston Hub (Shelf D6)"
  },
  {
    "id": "prod-046",
    "sku": "ACC-046",
    "name": "Bead 3d3D Nail Art Gel Bead Maker",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_048.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 168,
    "location": "Houston Hub (Shelf E7)"
  },
  {
    "id": "prod-047",
    "sku": "ACC-047",
    "name": "Liquid Container Big",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_049.png",
    "wholesalePrice": 7.5,
    "retailPrice": 10.5,
    "currentStock": 61,
    "location": "Houston Hub (Shelf F8)"
  },
  {
    "id": "prod-048",
    "sku": "ACC-048",
    "name": "Liquid Container Small Lotus",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_050.jpeg",
    "wholesalePrice": 3.0,
    "retailPrice": 4.2,
    "currentStock": 74,
    "location": "Houston Hub (Shelf A1)"
  },
  {
    "id": "prod-049",
    "sku": "ACC-049",
    "name": "Liquid Container Heart Pink",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_051.png",
    "wholesalePrice": 7.5,
    "retailPrice": 10.5,
    "currentStock": 87,
    "location": "Houston Hub (Shelf B2)"
  },
  {
    "id": "prod-050",
    "sku": "ACC-050",
    "name": "Big Liquid Container Heart Clear",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_052.png",
    "wholesalePrice": 7.5,
    "retailPrice": 10.5,
    "currentStock": 100,
    "location": "Houston Hub (Shelf C3)"
  },
  {
    "id": "prod-051",
    "sku": "ACC-051",
    "name": "Liquid Container Small",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_053.jpeg",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 113,
    "location": "Houston Hub (Shelf D4)"
  },
  {
    "id": "prod-052",
    "sku": "ACC-052",
    "name": "Nail drill QT0558-07",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_054.png",
    "wholesalePrice": 6.5,
    "retailPrice": 9.1,
    "currentStock": 126,
    "location": "Houston Hub (Shelf E5)"
  },
  {
    "id": "prod-053",
    "sku": "ACC-053",
    "name": "Nail drill 3/32 ‘Small Flame (F)",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_055.png",
    "wholesalePrice": 3.0,
    "retailPrice": 4.2,
    "currentStock": 139,
    "location": "Houston Hub (Shelf F6)"
  },
  {
    "id": "prod-054",
    "sku": "ACC-054",
    "name": "Nail drill small",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_056.png",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A7)"
  },
  {
    "id": "prod-055",
    "sku": "ACC-055",
    "name": "Nail drill QT0558-02",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_058.png",
    "wholesalePrice": 6.5,
    "retailPrice": 9.1,
    "currentStock": 165,
    "location": "Houston Hub (Shelf B8)"
  },
  {
    "id": "prod-056",
    "sku": "ACC-056",
    "name": "Nail drill QT0558-03",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_059.png",
    "wholesalePrice": 6.5,
    "retailPrice": 9.1,
    "currentStock": 58,
    "location": "Houston Hub (Shelf C1)"
  },
  {
    "id": "prod-057",
    "sku": "ACC-057",
    "name": "Nail drill QT0558-04",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_060.png",
    "wholesalePrice": 6.5,
    "retailPrice": 9.1,
    "currentStock": 71,
    "location": "Houston Hub (Shelf D2)"
  },
  {
    "id": "prod-058",
    "sku": "ACC-058",
    "name": "Nail drill QT0558-05",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_061.png",
    "wholesalePrice": 6.5,
    "retailPrice": 9.1,
    "currentStock": 84,
    "location": "Houston Hub (Shelf E3)"
  },
  {
    "id": "prod-059",
    "sku": "ACC-059",
    "name": "Nail drill QT0558-06",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_062.png",
    "wholesalePrice": 6.5,
    "retailPrice": 9.1,
    "currentStock": 97,
    "location": "Houston Hub (Shelf F4)"
  },
  {
    "id": "prod-060",
    "sku": "ACC-060",
    "name": "Nail drill A",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_063.png",
    "wholesalePrice": 2.5,
    "retailPrice": 3.5,
    "currentStock": 110,
    "location": "Houston Hub (Shelf A5)"
  },
  {
    "id": "prod-061",
    "sku": "ACC-061",
    "name": "Nail Drill B it - New Version",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_064.png",
    "wholesalePrice": 3.25,
    "retailPrice": 4.55,
    "currentStock": 123,
    "location": "Houston Hub (Shelf B6)"
  },
  {
    "id": "prod-062",
    "sku": "ACC-062",
    "name": "Nail Drill mini – L ong . 5 0",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_065.png",
    "wholesalePrice": 3.0,
    "retailPrice": 4.2,
    "currentStock": 136,
    "location": "Houston Hub (Shelf C7)"
  },
  {
    "id": "prod-063",
    "sku": "ACC-063",
    "name": "Gel Clean Nail Drill Bit",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_066.png",
    "wholesalePrice": 2.25,
    "retailPrice": 3.15,
    "currentStock": 6,
    "location": "Houston Hub (Shelf D8)"
  },
  {
    "id": "prod-064",
    "sku": "ACC-064",
    "name": "Disposable Mat - Blue",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_067.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 162,
    "location": "Houston Hub (Shelf E1)"
  },
  {
    "id": "prod-065",
    "sku": "ACC-065",
    "name": "Disposable Mat - Pink",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_068.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 55,
    "location": "Houston Hub (Shelf F2)"
  },
  {
    "id": "prod-066",
    "sku": "ACC-066",
    "name": "Flash light Pink Silicone",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_069.jpeg",
    "wholesalePrice": 5.0,
    "retailPrice": 7.0,
    "currentStock": 68,
    "location": "Houston Hub (Shelf A3)"
  },
  {
    "id": "prod-067",
    "sku": "ACC-067",
    "name": "Flash light Blue Silicone",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_070.png",
    "wholesalePrice": 5.0,
    "retailPrice": 7.0,
    "currentStock": 81,
    "location": "Houston Hub (Shelf B4)"
  },
  {
    "id": "prod-068",
    "sku": "ACC-068",
    "name": "Nail Stamps Blue",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_072.jpeg",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 94,
    "location": "Houston Hub (Shelf C5)"
  },
  {
    "id": "prod-069",
    "sku": "ACC-069",
    "name": "Nail Stamps Purple",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_073.jpeg",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 107,
    "location": "Houston Hub (Shelf D6)"
  },
  {
    "id": "prod-070",
    "sku": "ACC-070",
    "name": "Nail Stamps Clear",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_074.jpeg",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 120,
    "location": "Houston Hub (Shelf E7)"
  },
  {
    "id": "prod-071",
    "sku": "ACC-071",
    "name": "Nail Tips Almond shape - nature - in box",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_075.png",
    "wholesalePrice": 6.5,
    "retailPrice": 9.1,
    "currentStock": 133,
    "location": "Houston Hub (Shelf F8)"
  },
  {
    "id": "prod-072",
    "sku": "ACC-072",
    "name": "Nail Tips Square shape - nature - in box",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_076.png",
    "wholesalePrice": 6.5,
    "retailPrice": 9.1,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A1)"
  },
  {
    "id": "prod-073",
    "sku": "ACC-073",
    "name": "Nail Tips Coffin shape - nature - in box",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_077.png",
    "wholesalePrice": 6.5,
    "retailPrice": 9.1,
    "currentStock": 159,
    "location": "Houston Hub (Shelf B2)"
  },
  {
    "id": "prod-074",
    "sku": "ACC-074",
    "name": "Nail Tips Square shape - clear - in box",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_078.png",
    "wholesalePrice": 7.5,
    "retailPrice": 10.5,
    "currentStock": 52,
    "location": "Houston Hub (Shelf C3)"
  },
  {
    "id": "prod-075",
    "sku": "ACC-075",
    "name": "Nail Tips Almond shape - clear - in box",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_079.jpeg",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 65,
    "location": "Houston Hub (Shelf D4)"
  },
  {
    "id": "prod-076",
    "sku": "ACC-076",
    "name": "Nail Tips Coffin shape - nature - in bag",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_080.jpeg",
    "wholesalePrice": 6.0,
    "retailPrice": 8.4,
    "currentStock": 78,
    "location": "Houston Hub (Shelf E5)"
  },
  {
    "id": "prod-077",
    "sku": "ACC-077",
    "name": "Nail Tips Coffin shape - clear - in bag",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_081.jpeg",
    "wholesalePrice": 6.0,
    "retailPrice": 8.4,
    "currentStock": 91,
    "location": "Houston Hub (Shelf F6)"
  },
  {
    "id": "prod-078",
    "sku": "ACC-078",
    "name": "Nail Tips Almond shape - nature - in bag",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_082.jpeg",
    "wholesalePrice": 6.0,
    "retailPrice": 8.4,
    "currentStock": 104,
    "location": "Houston Hub (Shelf A7)"
  },
  {
    "id": "prod-079",
    "sku": "ACC-079",
    "name": "Dual Form Tip Nails – Extension for Gel Builder",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_083.jpeg",
    "wholesalePrice": 6.0,
    "retailPrice": 8.4,
    "currentStock": 117,
    "location": "Houston Hub (Shelf B8)"
  },
  {
    "id": "prod-080",
    "sku": "ACC-080",
    "name": "Toe Forms",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_084.jpeg",
    "wholesalePrice": 3.95,
    "retailPrice": 5.53,
    "currentStock": 130,
    "location": "Houston Hub (Shelf C1)"
  },
  {
    "id": "prod-081",
    "sku": "ACC-081",
    "name": "Air Brush Premium Pink",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_085.png",
    "wholesalePrice": 45.0,
    "retailPrice": 63.0,
    "currentStock": 6,
    "location": "Houston Hub (Shelf D2)"
  },
  {
    "id": "prod-082",
    "sku": "ACC-082",
    "name": "Air Brush Premium Blue",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_086.png",
    "wholesalePrice": 45.0,
    "retailPrice": 63.0,
    "currentStock": 156,
    "location": "Houston Hub (Shelf E3)"
  },
  {
    "id": "prod-083",
    "sku": "ACC-083",
    "name": "Air Brush Red",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_087.png",
    "wholesalePrice": 25.0,
    "retailPrice": 35.0,
    "currentStock": 169,
    "location": "Houston Hub (Shelf F4)"
  },
  {
    "id": "prod-084",
    "sku": "ACC-084",
    "name": "Air Brush Black",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_088.png",
    "wholesalePrice": 25.0,
    "retailPrice": 35.0,
    "currentStock": 62,
    "location": "Houston Hub (Shelf A5)"
  },
  {
    "id": "prod-085",
    "sku": "ACC-085",
    "name": "Silver Nail Stand",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_089.png",
    "wholesalePrice": 2.5,
    "retailPrice": 3.5,
    "currentStock": 75,
    "location": "Houston Hub (Shelf B6)"
  },
  {
    "id": "prod-086",
    "sku": "ACC-086",
    "name": "Gold Nail Stand",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_090.png",
    "wholesalePrice": 2.5,
    "retailPrice": 3.5,
    "currentStock": 88,
    "location": "Houston Hub (Shelf C7)"
  },
  {
    "id": "prod-087",
    "sku": "ACC-087",
    "name": "Pink Nail Stand",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_091.png",
    "wholesalePrice": 2.5,
    "retailPrice": 3.5,
    "currentStock": 101,
    "location": "Houston Hub (Shelf D8)"
  },
  {
    "id": "prod-088",
    "sku": "ACC-088",
    "name": "Portable Lamb Stand Pink",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_092.png",
    "wholesalePrice": 5.0,
    "retailPrice": 7.0,
    "currentStock": 114,
    "location": "Houston Hub (Shelf E1)"
  },
  {
    "id": "prod-089",
    "sku": "ACC-089",
    "name": "Portable Lamb Stand White",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_093.png",
    "wholesalePrice": 5.0,
    "retailPrice": 7.0,
    "currentStock": 127,
    "location": "Houston Hub (Shelf F2)"
  },
  {
    "id": "prod-090",
    "sku": "ACC-090",
    "name": "UV Lamp With Portable Stand White",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_094.png",
    "wholesalePrice": 12.0,
    "retailPrice": 16.8,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A3)"
  },
  {
    "id": "prod-091",
    "sku": "ACC-091",
    "name": "UV Lamp With Portable Stand Pink",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_095.png",
    "wholesalePrice": 12.0,
    "retailPrice": 16.8,
    "currentStock": 153,
    "location": "Houston Hub (Shelf B4)"
  },
  {
    "id": "prod-092",
    "sku": "ACC-092",
    "name": "Screen Display LED Pink",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_096.png",
    "wholesalePrice": 10.0,
    "retailPrice": 14.0,
    "currentStock": 166,
    "location": "Houston Hub (Shelf C5)"
  },
  {
    "id": "prod-093",
    "sku": "ACC-093",
    "name": "Screen Display LED White",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_097.png",
    "wholesalePrice": 10.0,
    "retailPrice": 14.0,
    "currentStock": 59,
    "location": "Houston Hub (Shelf D6)"
  },
  {
    "id": "prod-094",
    "sku": "ACC-094",
    "name": "Nail Dust Silver",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_098.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 72,
    "location": "Houston Hub (Shelf E7)"
  },
  {
    "id": "prod-095",
    "sku": "ACC-095",
    "name": "Nail Dust Gold",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_099.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 85,
    "location": "Houston Hub (Shelf F8)"
  },
  {
    "id": "prod-096",
    "sku": "ACC-096",
    "name": "Clearning Dust Brushes",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 132,
    "location": "Houston Hub (Shelf A1)"
  },
  {
    "id": "prod-097",
    "sku": "ACC-097",
    "name": "Silicone Pens",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 149,
    "location": "Houston Hub (Shelf B2)"
  },
  {
    "id": "prod-098",
    "sku": "ACC-098",
    "name": "KB- 011 X- Acto Knife For Nail Art",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 3.0,
    "retailPrice": 4.2,
    "currentStock": 56,
    "location": "Houston Hub (Shelf C3)"
  },
  {
    "id": "prod-099",
    "sku": "ACC-099",
    "name": "White S ponge 1.0cm",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 73,
    "location": "Houston Hub (Shelf D4)"
  },
  {
    "id": "prod-100",
    "sku": "ACC-100",
    "name": "Hair Fiber Applicator",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_104.png",
    "wholesalePrice": 6.0,
    "retailPrice": 8.4,
    "currentStock": 150,
    "location": "Houston Hub (Shelf E5)"
  },
  {
    "id": "prod-101",
    "sku": "ACC-101",
    "name": "Diamond Removal Nippers",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_106.jpeg",
    "wholesalePrice": 5.0,
    "retailPrice": 7.0,
    "currentStock": 163,
    "location": "Houston Hub (Shelf F6)"
  },
  {
    "id": "prod-102",
    "sku": "ACC-102",
    "name": "MAGNET",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 124,
    "location": "Houston Hub (Shelf A7)"
  },
  {
    "id": "prod-103",
    "sku": "ACC-103",
    "name": "Magnet",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_107.png",
    "wholesalePrice": 3.0,
    "retailPrice": 4.2,
    "currentStock": 69,
    "location": "Houston Hub (Shelf B8)"
  },
  {
    "id": "prod-104",
    "sku": "ACC-104",
    "name": "Magnet Fancy Eye Cat 9 Pcs",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_109.png",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 82,
    "location": "Houston Hub (Shelf C1)"
  },
  {
    "id": "prod-105",
    "sku": "ACC-105",
    "name": "Magnet Cat Eyes New Version",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_111.png",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 95,
    "location": "Houston Hub (Shelf D2)"
  },
  {
    "id": "prod-106",
    "sku": "ACC-106",
    "name": "Magnet 5in1",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_113.png",
    "wholesalePrice": 4.25,
    "retailPrice": 5.95,
    "currentStock": 108,
    "location": "Houston Hub (Shelf E3)"
  },
  {
    "id": "prod-107",
    "sku": "ACC-107",
    "name": "Magnet Silver Metal Cat Eye",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_114.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 121,
    "location": "Houston Hub (Shelf F4)"
  },
  {
    "id": "prod-108",
    "sku": "ACC-108",
    "name": "Magnet Cigar Handle Cat Eye",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_116.jpeg",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A5)"
  },
  {
    "id": "prod-109",
    "sku": "ACC-109",
    "name": "Pen Magnet",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_117.jpeg",
    "wholesalePrice": 3.0,
    "retailPrice": 4.2,
    "currentStock": 147,
    "location": "Houston Hub (Shelf B6)"
  },
  {
    "id": "prod-110",
    "sku": "ACC-110",
    "name": "Magnet Square - Big",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_118.jpeg",
    "wholesalePrice": 2.75,
    "retailPrice": 3.85,
    "currentStock": 160,
    "location": "Houston Hub (Shelf C7)"
  },
  {
    "id": "prod-111",
    "sku": "ACC-111",
    "name": "Magnet Square - Small",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_119.png",
    "wholesalePrice": 2.75,
    "retailPrice": 3.85,
    "currentStock": 53,
    "location": "Houston Hub (Shelf D8)"
  },
  {
    "id": "prod-112",
    "sku": "ACC-112",
    "name": "Magnet Ring",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_120.jpeg",
    "wholesalePrice": 2.75,
    "retailPrice": 3.85,
    "currentStock": 66,
    "location": "Houston Hub (Shelf E1)"
  },
  {
    "id": "prod-113",
    "sku": "ACC-113",
    "name": "Y-shape C at M agnet Black",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_121.jpeg",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 79,
    "location": "Houston Hub (Shelf F2)"
  },
  {
    "id": "prod-114",
    "sku": "ACC-114",
    "name": "Y-shape C at M agnet Gray",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_122.png",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 92,
    "location": "Houston Hub (Shelf A3)"
  },
  {
    "id": "prod-115",
    "sku": "ACC-115",
    "name": "5D Cat Eye Magnet",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_123.jpeg",
    "wholesalePrice": 3.0,
    "retailPrice": 4.2,
    "currentStock": 105,
    "location": "Houston Hub (Shelf B4)"
  },
  {
    "id": "prod-116",
    "sku": "ACC-116",
    "name": "Scissors Magnet",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_124.png",
    "wholesalePrice": 2.75,
    "retailPrice": 3.85,
    "currentStock": 118,
    "location": "Houston Hub (Shelf C5)"
  },
  {
    "id": "prod-117",
    "sku": "ACC-117",
    "name": "4in1 Nail Art Cat Eye Magnet",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_125.jpeg",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 6,
    "location": "Houston Hub (Shelf D6)"
  },
  {
    "id": "prod-118",
    "sku": "ACC-118",
    "name": "New G eneration M agnet",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_126.png",
    "wholesalePrice": 3.25,
    "retailPrice": 4.55,
    "currentStock": 144,
    "location": "Houston Hub (Shelf E7)"
  },
  {
    "id": "prod-119",
    "sku": "ACC-119",
    "name": "Magnet Round - New Generation #1",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_127.png",
    "wholesalePrice": 2.25,
    "retailPrice": 3.15,
    "currentStock": 157,
    "location": "Houston Hub (Shelf F8)"
  },
  {
    "id": "prod-120",
    "sku": "ACC-120",
    "name": "Magnet Round - New Generation #2",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_129.png",
    "wholesalePrice": 2.25,
    "retailPrice": 3.15,
    "currentStock": 50,
    "location": "Houston Hub (Shelf A1)"
  },
  {
    "id": "prod-121",
    "sku": "ACC-121",
    "name": "Magnet Round - New Generation #3",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_130.png",
    "wholesalePrice": 2.5,
    "retailPrice": 3.5,
    "currentStock": 63,
    "location": "Houston Hub (Shelf B2)"
  },
  {
    "id": "prod-122",
    "sku": "ACC-122",
    "name": "Magnet Round – New Generation #4",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_132.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 76,
    "location": "Houston Hub (Shelf C3)"
  },
  {
    "id": "prod-123",
    "sku": "ACC-123",
    "name": "Magnet Round New Generation – Handle Pink",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_133.png",
    "wholesalePrice": 2.5,
    "retailPrice": 3.5,
    "currentStock": 89,
    "location": "Houston Hub (Shelf D4)"
  },
  {
    "id": "prod-124",
    "sku": "ACC-124",
    "name": "Magnet Round New Generation – Handle Purple",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_134.png",
    "wholesalePrice": 2.5,
    "retailPrice": 3.5,
    "currentStock": 102,
    "location": "Houston Hub (Shelf E5)"
  },
  {
    "id": "prod-125",
    "sku": "ACC-125",
    "name": "8in1 Starfish Magnet $",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_135.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 115,
    "location": "Houston Hub (Shelf F6)"
  },
  {
    "id": "prod-126",
    "sku": "ACC-126",
    "name": "Magnet 4in1 High Strength Green $",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_136.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A7)"
  },
  {
    "id": "prod-127",
    "sku": "ACC-127",
    "name": "Magnet 4in1 high strength – P urple $",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_137.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 141,
    "location": "Houston Hub (Shelf B8)"
  },
  {
    "id": "prod-128",
    "sku": "ACC-128",
    "name": "Magnet #1 - Pink",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_138.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 154,
    "location": "Houston Hub (Shelf C1)"
  },
  {
    "id": "prod-129",
    "sku": "ACC-129",
    "name": "Magnet #2 - Turquoise",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_139.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 167,
    "location": "Houston Hub (Shelf D2)"
  },
  {
    "id": "prod-130",
    "sku": "ACC-130",
    "name": "Magnet #3 - Blue",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_140.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 60,
    "location": "Houston Hub (Shelf E3)"
  },
  {
    "id": "prod-131",
    "sku": "ACC-131",
    "name": "3in1 C at E yes M agnet Green $",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_141.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 73,
    "location": "Houston Hub (Shelf F4)"
  },
  {
    "id": "prod-132",
    "sku": "ACC-132",
    "name": "3in1 Cat Eyes Magnet Pink $",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_142.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 86,
    "location": "Houston Hub (Shelf A5)"
  },
  {
    "id": "prod-133",
    "sku": "ACC-133",
    "name": "Double Head Magnet Green",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_143.png",
    "wholesalePrice": 3.25,
    "retailPrice": 4.55,
    "currentStock": 99,
    "location": "Houston Hub (Shelf B6)"
  },
  {
    "id": "prod-134",
    "sku": "ACC-134",
    "name": "Double Head Magnet Pink",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_144.png",
    "wholesalePrice": 3.25,
    "retailPrice": 4.55,
    "currentStock": 112,
    "location": "Houston Hub (Shelf C7)"
  },
  {
    "id": "prod-135",
    "sku": "ACC-135",
    "name": "Finger Magnet Short $",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_145.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 6,
    "location": "Houston Hub (Shelf D8)"
  },
  {
    "id": "prod-136",
    "sku": "ACC-136",
    "name": "Finger Magnet Long $",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_146.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 138,
    "location": "Houston Hub (Shelf E1)"
  },
  {
    "id": "prod-137",
    "sku": "ACC-137",
    "name": "Magnet in bag (version 1)",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_147.png",
    "wholesalePrice": 2.5,
    "retailPrice": 3.5,
    "currentStock": 151,
    "location": "Houston Hub (Shelf F2)"
  },
  {
    "id": "prod-138",
    "sku": "ACC-138",
    "name": "Gradient magnet",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_148.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 164,
    "location": "Houston Hub (Shelf A3)"
  },
  {
    "id": "prod-139",
    "sku": "ACC-139",
    "name": "Kitty Cat Eye Magnet-Pink",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_149.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 57,
    "location": "Houston Hub (Shelf B4)"
  },
  {
    "id": "prod-140",
    "sku": "ACC-140",
    "name": "Rotating magnet",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_150.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 70,
    "location": "Houston Hub (Shelf C5)"
  },
  {
    "id": "prod-141",
    "sku": "ACC-141",
    "name": "Hallow Cat eye Magnet",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_151.png",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 83,
    "location": "Houston Hub (Shelf D6)"
  },
  {
    "id": "prod-142",
    "sku": "ACC-142",
    "name": "Magnet stick cat eye",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_152.png",
    "wholesalePrice": 2.25,
    "retailPrice": 3.15,
    "currentStock": 96,
    "location": "Houston Hub (Shelf E7)"
  },
  {
    "id": "prod-143",
    "sku": "ACC-143",
    "name": "Magnet stick cat eye",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_153.png",
    "wholesalePrice": 2.25,
    "retailPrice": 3.15,
    "currentStock": 109,
    "location": "Houston Hub (Shelf F8)"
  },
  {
    "id": "prod-144",
    "sku": "ACC-144",
    "name": "Magnet stick cat eye",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_154.png",
    "wholesalePrice": 2.25,
    "retailPrice": 3.15,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A1)"
  },
  {
    "id": "prod-145",
    "sku": "ACC-145",
    "name": "Three-Hearted Cat’s Eye Magnet",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_155.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 135,
    "location": "Houston Hub (Shelf B2)"
  },
  {
    "id": "prod-146",
    "sku": "ACC-146",
    "name": "Two-in-one R otating P eephole M agnet",
    "category": "ACCESSORIES",
    "description": "JKIOCEAN ACCESSORIES - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_156.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 148,
    "location": "Houston Hub (Shelf C3)"
  },
  {
    "id": "prod-147",
    "sku": "BRUSH-147",
    "name": "Z Z Brushes – Purple Handle Size 08 Size 10 3 . 0 0 Size 12 5 . 0 0 Size 14 .50 Size 16 9 . 50",
    "category": "Z Z  Brushes",
    "description": "JKIOCEAN Z Z  Brushes - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 11.0,
    "retailPrice": 15.4,
    "currentStock": 119,
    "location": "Houston Hub (Shelf D4)"
  },
  {
    "id": "prod-148",
    "sku": "JKI-148",
    "name": "Ligh t ning Brand - ⚡️ Kolinsky Wood Handle Brushes Size 12 . 0 0 Size 14 . 5 0 Size 16 . 00 Size 18 . 0 0",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 25.0,
    "retailPrice": 35.0,
    "currentStock": 136,
    "location": "Houston Hub (Shelf E5)"
  },
  {
    "id": "prod-149",
    "sku": "JKI-149",
    "name": "X-Class French S ize 06 . 0 Size 08 . 0 Size 10 . 0 Size 12 . 0 Size 14 . 0 Size 16 . 0",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 5.0,
    "retailPrice": 7.0,
    "currentStock": 43,
    "location": "Houston Hub (Shelf F6)"
  },
  {
    "id": "prod-150",
    "sku": "JKI-150",
    "name": "Z Brushes - French – Crystal Handle Size 06 Size 08 Size 10 Size 12 Size 14 Size 16",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 60,
    "location": "Houston Hub (Shelf A7)"
  },
  {
    "id": "prod-151",
    "sku": "JKI-151",
    "name": "Z Brushes - French – Wood Handle Size 06 Size 08 Size 10 Size 12 Size 14 Size 16",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 77,
    "location": "Houston Hub (Shelf B8)"
  },
  {
    "id": "prod-152",
    "sku": "JKI-152",
    "name": "Z Brushes - French – Metal H eart Handle Size 08 Size 10 Size 12 Size 14 Size 16",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 7.0,
    "retailPrice": 9.8,
    "currentStock": 94,
    "location": "Houston Hub (Shelf C1)"
  },
  {
    "id": "prod-153",
    "sku": "JKI-153",
    "name": "Z Brushes - French – Pink Handle Size 06 Size 08 Size 10 Size 12 Size 14 Size 16",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 111,
    "location": "Houston Hub (Shelf D2)"
  },
  {
    "id": "prod-154",
    "sku": "JKI-154",
    "name": "Z Brushes - French – Dotting Wood S ize 06 . 0 Size 08 . 0 Size 10 . 0 Size 12 . 0 Size 14 . 0 Size 16 . 0",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 128,
    "location": "Houston Hub (Shelf E3)"
  },
  {
    "id": "prod-155",
    "sku": "JKI-155",
    "name": "Z Brushes - French – Gold Handle Size 06 Size 08 Size 10 Size 12 Size 14 Size 16",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 145,
    "location": "Houston Hub (Shelf F4)"
  },
  {
    "id": "prod-156",
    "sku": "JKI-156",
    "name": "Nail Art Brushes Ombre – Flat Nail Art",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_177.png",
    "wholesalePrice": 6.0,
    "retailPrice": 8.4,
    "currentStock": 158,
    "location": "Houston Hub (Shelf A5)"
  },
  {
    "id": "prod-157",
    "sku": "JKI-157",
    "name": "Nail Art Brushes Oval – 3D Nail Art",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_178.png",
    "wholesalePrice": 6.0,
    "retailPrice": 8.4,
    "currentStock": 51,
    "location": "Houston Hub (Shelf B6)"
  },
  {
    "id": "prod-158",
    "sku": "JKI-158",
    "name": "Nail Art Brushes 5mm – 10mm Nail Art",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_179.png",
    "wholesalePrice": 6.0,
    "retailPrice": 8.4,
    "currentStock": 64,
    "location": "Houston Hub (Shelf C7)"
  },
  {
    "id": "prod-159",
    "sku": "JKI-159",
    "name": "Nail Art Brushes 15mm – 20mm Nail Art",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_180.png",
    "wholesalePrice": 6.0,
    "retailPrice": 8.4,
    "currentStock": 77,
    "location": "Houston Hub (Shelf D8)"
  },
  {
    "id": "prod-160",
    "sku": "JKI-160",
    "name": "Nail Art Brushes 20 mm – 25mm Nail Art",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_181.png",
    "wholesalePrice": 6.0,
    "retailPrice": 8.4,
    "currentStock": 90,
    "location": "Houston Hub (Shelf E1)"
  },
  {
    "id": "prod-161",
    "sku": "JKI-161",
    "name": "Nail Art Brushes 6 pcs for a pack",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_182.png",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 103,
    "location": "Houston Hub (Shelf F2)"
  },
  {
    "id": "prod-162",
    "sku": "JKI-162",
    "name": "Brown Wooden Handle Line a r Brush Size 6 mm",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_183.jpeg",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A3)"
  },
  {
    "id": "prod-163",
    "sku": "JKI-163",
    "name": "Brown Wooden Handle Line a r Brush Size 9 mm",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_184.jpeg",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 129,
    "location": "Houston Hub (Shelf B4)"
  },
  {
    "id": "prod-164",
    "sku": "JKI-164",
    "name": "Brown Wooden Handle Line a r Brush Size 12 mm",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_185.jpeg",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 142,
    "location": "Houston Hub (Shelf C5)"
  },
  {
    "id": "prod-165",
    "sku": "JKI-165",
    "name": "Gradient Blue Handle Liner Brushes Set 3pcs (12-15-20mm)",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_186.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 155,
    "location": "Houston Hub (Shelf D6)"
  },
  {
    "id": "prod-166",
    "sku": "JKI-166",
    "name": "Nail Art Brushes Flat/Slant",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_187.png",
    "wholesalePrice": 6.0,
    "retailPrice": 8.4,
    "currentStock": 168,
    "location": "Houston Hub (Shelf E7)"
  },
  {
    "id": "prod-167",
    "sku": "JKI-167",
    "name": "Nail Art Brushes Poly Gel Black",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_188.png",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 61,
    "location": "Houston Hub (Shelf F8)"
  },
  {
    "id": "prod-168",
    "sku": "JKI-168",
    "name": "Nail Art Brushes Poly Gel Pink",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_189.png",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 74,
    "location": "Houston Hub (Shelf A1)"
  },
  {
    "id": "prod-169",
    "sku": "JKI-169",
    "name": "Gel Brushes With Linear",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_190.png",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 87,
    "location": "Houston Hub (Shelf B2)"
  },
  {
    "id": "prod-170",
    "sku": "JKI-170",
    "name": "Nail Art Brushes Oval/Flat",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_191.png",
    "wholesalePrice": 6.0,
    "retailPrice": 8.4,
    "currentStock": 100,
    "location": "Houston Hub (Shelf C3)"
  },
  {
    "id": "prod-171",
    "sku": "JKI-171",
    "name": "Nail Art Brushes Nail A rt L iner K it S et",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_192.png",
    "wholesalePrice": 8.0,
    "retailPrice": 11.2,
    "currentStock": 6,
    "location": "Houston Hub (Shelf D4)"
  },
  {
    "id": "prod-172",
    "sku": "JKI-172",
    "name": "Triangle Nail Art Brushes",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_193.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 126,
    "location": "Houston Hub (Shelf E5)"
  },
  {
    "id": "prod-173",
    "sku": "JKI-173",
    "name": "Linear French Brushes",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_194.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 139,
    "location": "Houston Hub (Shelf F6)"
  },
  {
    "id": "prod-174",
    "sku": "JKI-174",
    "name": "French Linear Set X-Class Line a r Brush set 4pcs",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_195.png",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 152,
    "location": "Houston Hub (Shelf A7)"
  },
  {
    "id": "prod-175",
    "sku": "JKI-175",
    "name": "Nail Art Brushes 6 pcs for a pack",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_196.png",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 165,
    "location": "Houston Hub (Shelf B8)"
  },
  {
    "id": "prod-176",
    "sku": "JKI-176",
    "name": "Nail Art Brushes Nail Art Line a r Kit Set",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_197.png",
    "wholesalePrice": 8.0,
    "retailPrice": 11.2,
    "currentStock": 58,
    "location": "Houston Hub (Shelf C1)"
  },
  {
    "id": "prod-177",
    "sku": "JKI-177",
    "name": "Nail Art Brushes 3D set - size 2,4,6",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_198.png",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 71,
    "location": "Houston Hub (Shelf D2)"
  },
  {
    "id": "prod-178",
    "sku": "JKI-178",
    "name": "Nail Art Brushes Half Moon set",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_199.png",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 84,
    "location": "Houston Hub (Shelf E3)"
  },
  {
    "id": "prod-179",
    "sku": "JKI-179",
    "name": "Nail Art Brushes Ombre",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_200.png",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 97,
    "location": "Houston Hub (Shelf F4)"
  },
  {
    "id": "prod-180",
    "sku": "JKI-180",
    "name": "Nail Art Brushes Daisy Flower",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_201.png",
    "wholesalePrice": 6.0,
    "retailPrice": 8.4,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A5)"
  },
  {
    "id": "prod-181",
    "sku": "JKI-181",
    "name": "Nail Art Brushes White Wooden Handle Double-Head Silicone",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_202.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 123,
    "location": "Houston Hub (Shelf B6)"
  },
  {
    "id": "prod-182",
    "sku": "JKI-182",
    "name": "Gel Builder Brush #6/8 mm",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_203.png",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 136,
    "location": "Houston Hub (Shelf C7)"
  },
  {
    "id": "prod-183",
    "sku": "JKI-183",
    "name": "Nail Art Brushes Professional Duo Brush- set 2 pcs Oval - Flat",
    "category": "L ightning  B rand",
    "description": "JKIOCEAN L ightning  B rand - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_204.png",
    "wholesalePrice": 10.0,
    "retailPrice": 14.0,
    "currentStock": 149,
    "location": "Houston Hub (Shelf D8)"
  },
  {
    "id": "prod-184",
    "sku": "NIPPER-184",
    "name": "JKI C 001 CUTICLE NIPPERS Special Steel – JAW 14 &amp;16",
    "category": "PROFESSIONAL   QUALITY  -   ULTRA SHARP",
    "description": "JKIOCEAN PROFESSIONAL   QUALITY  -   ULTRA SHARP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_205.jpeg",
    "wholesalePrice": 3.85,
    "retailPrice": 5.39,
    "currentStock": 162,
    "location": "Houston Hub (Shelf E1)"
  },
  {
    "id": "prod-185",
    "sku": "NIPPER-185",
    "name": "JKIC002 CUTICLE NIPPERS Special Steel – JAW 12, 14, 16",
    "category": "PROFESSIONAL   QUALITY  -   ULTRA SHARP",
    "description": "JKIOCEAN PROFESSIONAL   QUALITY  -   ULTRA SHARP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_206.jpeg",
    "wholesalePrice": 3.85,
    "retailPrice": 5.39,
    "currentStock": 55,
    "location": "Houston Hub (Shelf F2)"
  },
  {
    "id": "prod-186",
    "sku": "NIPPER-186",
    "name": "JKIC003 CUTICLE NIPPERS Special Steel – JAW 12, 14 &amp;16",
    "category": "PROFESSIONAL   QUALITY  -   ULTRA SHARP",
    "description": "JKIOCEAN PROFESSIONAL   QUALITY  -   ULTRA SHARP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_207.jpeg",
    "wholesalePrice": 3.85,
    "retailPrice": 5.39,
    "currentStock": 68,
    "location": "Houston Hub (Shelf A3)"
  },
  {
    "id": "prod-187",
    "sku": "NIPPER-187",
    "name": "JKIC004 . 2 5 CUTICLE NIPPERS Special Steel – JAW 12, 14 &amp; 16",
    "category": "PROFESSIONAL   QUALITY  -   ULTRA SHARP",
    "description": "JKIOCEAN PROFESSIONAL   QUALITY  -   ULTRA SHARP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_208.jpeg",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 81,
    "location": "Houston Hub (Shelf B4)"
  },
  {
    "id": "prod-188",
    "sku": "NIPPER-188",
    "name": "JKIC005 . 2 5 CUTICLE NIPPERS Special Steel – JAW 12, 14 &amp;16",
    "category": "PROFESSIONAL   QUALITY  -   ULTRA SHARP",
    "description": "JKIOCEAN PROFESSIONAL   QUALITY  -   ULTRA SHARP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_209.jpeg",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 94,
    "location": "Houston Hub (Shelf C5)"
  },
  {
    "id": "prod-189",
    "sku": "NIPPER-189",
    "name": "JKI001 ACRYLIC NIPPERS Special Steel",
    "category": "PROFESSIONAL   QUALITY  -   ULTRA SHARP",
    "description": "JKIOCEAN PROFESSIONAL   QUALITY  -   ULTRA SHARP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_210.jpeg",
    "wholesalePrice": 4.25,
    "retailPrice": 5.95,
    "currentStock": 6,
    "location": "Houston Hub (Shelf D6)"
  },
  {
    "id": "prod-190",
    "sku": "NIPPER-190",
    "name": "JKI002 TOE NAIL CUTTER Stainless Steel",
    "category": "PROFESSIONAL   QUALITY  -   ULTRA SHARP",
    "description": "JKIOCEAN PROFESSIONAL   QUALITY  -   ULTRA SHARP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_211.png",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 120,
    "location": "Houston Hub (Shelf E7)"
  },
  {
    "id": "prod-191",
    "sku": "NIPPER-191",
    "name": "JKI003 CUTTER CUTICLE NIPPERS",
    "category": "PROFESSIONAL   QUALITY  -   ULTRA SHARP",
    "description": "JKIOCEAN PROFESSIONAL   QUALITY  -   ULTRA SHARP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_213.png",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 133,
    "location": "Houston Hub (Shelf F8)"
  },
  {
    "id": "prod-192",
    "sku": "NIPPER-192",
    "name": "JKI00 5 . 0 0 INGROWN NIPPERS - VERSION 1 Stainless Steel",
    "category": "PROFESSIONAL   QUALITY  -   ULTRA SHARP",
    "description": "JKIOCEAN PROFESSIONAL   QUALITY  -   ULTRA SHARP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_214.png",
    "wholesalePrice": 5.0,
    "retailPrice": 7.0,
    "currentStock": 146,
    "location": "Houston Hub (Shelf A1)"
  },
  {
    "id": "prod-193",
    "sku": "NIPPER-193",
    "name": "JKI00 7 . 0 0 INGROWN NIPPERS - VERSION 2 Stainless Steel",
    "category": "PROFESSIONAL   QUALITY  -   ULTRA SHARP",
    "description": "JKIOCEAN PROFESSIONAL   QUALITY  -   ULTRA SHARP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_215.png",
    "wholesalePrice": 5.0,
    "retailPrice": 7.0,
    "currentStock": 159,
    "location": "Houston Hub (Shelf B2)"
  },
  {
    "id": "prod-194",
    "sku": "NIPPER-194",
    "name": "JKIC00 7 DS CUTICLE NIPPERS Stainless Steel – JAW 14 &amp; 16",
    "category": "PROPER DESIGN - SHARP BLADE",
    "description": "JKIOCEAN PROPER DESIGN - SHARP BLADE - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_216.jpeg",
    "wholesalePrice": 5.75,
    "retailPrice": 8.05,
    "currentStock": 52,
    "location": "Houston Hub (Shelf C3)"
  },
  {
    "id": "prod-195",
    "sku": "NIPPER-195",
    "name": "JKIC007 CUTICLE NIPPERS Stainless Steel – JAW 12, 14 &amp;16",
    "category": "PROPER DESIGN - SHARP BLADE",
    "description": "JKIOCEAN PROPER DESIGN - SHARP BLADE - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_217.jpeg",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 65,
    "location": "Houston Hub (Shelf D4)"
  },
  {
    "id": "prod-196",
    "sku": "NIPPER-196",
    "name": "JKIC008 DS CUTICLE NIPPERS Stainless Steel – JAW 12, 14, 16",
    "category": "PROPER DESIGN - SHARP BLADE",
    "description": "JKIOCEAN PROPER DESIGN - SHARP BLADE - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_218.jpeg",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 78,
    "location": "Houston Hub (Shelf E5)"
  },
  {
    "id": "prod-197",
    "sku": "NIPPER-197",
    "name": "JKIC008 CUTICLE NIPPERS Stainless Steel – JAW 12, 14, 16",
    "category": "PROPER DESIGN - SHARP BLADE",
    "description": "JKIOCEAN PROPER DESIGN - SHARP BLADE - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_219.jpeg",
    "wholesalePrice": 5.75,
    "retailPrice": 8.05,
    "currentStock": 91,
    "location": "Houston Hub (Shelf F6)"
  },
  {
    "id": "prod-198",
    "sku": "NIPPER-198",
    "name": "JKIC009 CUTICLE NIPPERS Stainless Steel– JAW 12, 14, 16",
    "category": "PROPER DESIGN - SHARP BLADE",
    "description": "JKIOCEAN PROPER DESIGN - SHARP BLADE - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_220.jpeg",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A7)"
  },
  {
    "id": "prod-199",
    "sku": "NIPPER-199",
    "name": "JKIC010 CUTICLE NIPPERS Stainless Steel – JAW 12, 14, 16",
    "category": "PROPER DESIGN - SHARP BLADE",
    "description": "JKIOCEAN PROPER DESIGN - SHARP BLADE - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_221.jpeg",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 117,
    "location": "Houston Hub (Shelf B8)"
  },
  {
    "id": "prod-200",
    "sku": "NIPPER-200",
    "name": "JKIC010 DS CUTICLE NIPPERS Stainless Steel – JAW 12, 14, 16",
    "category": "PROPER DESIGN - SHARP BLADE",
    "description": "JKIOCEAN PROPER DESIGN - SHARP BLADE - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_222.jpeg",
    "wholesalePrice": 5.75,
    "retailPrice": 8.05,
    "currentStock": 130,
    "location": "Houston Hub (Shelf C1)"
  },
  {
    "id": "prod-201",
    "sku": "NIPPER-201",
    "name": "JKIC012 CUTICLE NIPPERS Stainless Steel – JAW 14 &amp; 16",
    "category": "PROPER DESIGN - SHARP BLADE",
    "description": "JKIOCEAN PROPER DESIGN - SHARP BLADE - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_223.jpeg",
    "wholesalePrice": 5.75,
    "retailPrice": 8.05,
    "currentStock": 143,
    "location": "Houston Hub (Shelf D2)"
  },
  {
    "id": "prod-202",
    "sku": "NIPPER-202",
    "name": "JKIC014 CUTICLE NIPPERS Stainless Steel – JAW 12, 14 , 16",
    "category": "PROPER DESIGN - SHARP BLADE",
    "description": "JKIOCEAN PROPER DESIGN - SHARP BLADE - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_224.png",
    "wholesalePrice": 8.5,
    "retailPrice": 11.9,
    "currentStock": 156,
    "location": "Houston Hub (Shelf E3)"
  },
  {
    "id": "prod-203",
    "sku": "NIPPER-203",
    "name": "JKIC015 CUTICLE NIPPERS Stainless Steel – JAW 12, 14 , 16",
    "category": "PROPER DESIGN - SHARP BLADE",
    "description": "JKIOCEAN PROPER DESIGN - SHARP BLADE - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_225.png",
    "wholesalePrice": 8.5,
    "retailPrice": 11.9,
    "currentStock": 169,
    "location": "Houston Hub (Shelf F4)"
  },
  {
    "id": "prod-204",
    "sku": "JKI-204",
    "name": "JKIC021 NAIL CLIPPER Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_226.jpeg",
    "wholesalePrice": 2.25,
    "retailPrice": 3.15,
    "currentStock": 62,
    "location": "Houston Hub (Shelf A5)"
  },
  {
    "id": "prod-205",
    "sku": "JKI-205",
    "name": "JKI C 0 22 NAIL CLIPPER Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_227.jpeg",
    "wholesalePrice": 2.25,
    "retailPrice": 3.15,
    "currentStock": 75,
    "location": "Houston Hub (Shelf B6)"
  },
  {
    "id": "prod-206",
    "sku": "JKI-206",
    "name": "JKI 023 Wide Jaw Clipper - Curved Premium Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_228.jpeg",
    "wholesalePrice": 6.5,
    "retailPrice": 9.1,
    "currentStock": 88,
    "location": "Houston Hub (Shelf C7)"
  },
  {
    "id": "prod-207",
    "sku": "JKI-207",
    "name": "JKIC024 . 50 Wide Jaw Clipper - Straight Premium Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_229.jpeg",
    "wholesalePrice": 6.0,
    "retailPrice": 8.4,
    "currentStock": 6,
    "location": "Houston Hub (Shelf D8)"
  },
  {
    "id": "prod-208",
    "sku": "JKI-208",
    "name": "JKIC 025",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_230.png",
    "wholesalePrice": 0.85,
    "retailPrice": 1.19,
    "currentStock": 114,
    "location": "Houston Hub (Shelf E1)"
  },
  {
    "id": "prod-209",
    "sku": "JKI-209",
    "name": "JKIC 026",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_231.png",
    "wholesalePrice": 0.85,
    "retailPrice": 1.19,
    "currentStock": 127,
    "location": "Houston Hub (Shelf F2)"
  },
  {
    "id": "prod-210",
    "sku": "JKI-210",
    "name": "JKIC8520 Curved",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_232.png",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 140,
    "location": "Houston Hub (Shelf A3)"
  },
  {
    "id": "prod-211",
    "sku": "JKI-211",
    "name": "JKIC852 1 Slanted",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_233.png",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 153,
    "location": "Houston Hub (Shelf B4)"
  },
  {
    "id": "prod-212",
    "sku": "JKI-212",
    "name": "JKIP005 PUSHER - Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 1.65,
    "retailPrice": 2.31,
    "currentStock": 124,
    "location": "Houston Hub (Shelf C5)"
  },
  {
    "id": "prod-213",
    "sku": "JKI-213",
    "name": "JKIP006 PUSHER - Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 2.0,
    "retailPrice": 2.8,
    "currentStock": 141,
    "location": "Houston Hub (Shelf D6)"
  },
  {
    "id": "prod-214",
    "sku": "JKI-214",
    "name": "JKIP007 Ingrown Pusher - Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 1.2,
    "retailPrice": 1.68,
    "currentStock": 48,
    "location": "Houston Hub (Shelf E7)"
  },
  {
    "id": "prod-215",
    "sku": "JKI-215",
    "name": "JKIP00 8 PUSHER - Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 1.95,
    "retailPrice": 2.73,
    "currentStock": 65,
    "location": "Houston Hub (Shelf F8)"
  },
  {
    "id": "prod-216",
    "sku": "JKI-216",
    "name": "JKIP0 09 PUSHER - Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 1.95,
    "retailPrice": 2.73,
    "currentStock": 82,
    "location": "Houston Hub (Shelf A1)"
  },
  {
    "id": "prod-217",
    "sku": "JKI-217",
    "name": "JKIP0 10 PUSHER - Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 1.95,
    "retailPrice": 2.73,
    "currentStock": 99,
    "location": "Houston Hub (Shelf B2)"
  },
  {
    "id": "prod-218",
    "sku": "JKI-218",
    "name": "JKIP0 12 PUSHER - Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 1.95,
    "retailPrice": 2.73,
    "currentStock": 116,
    "location": "Houston Hub (Shelf C3)"
  },
  {
    "id": "prod-219",
    "sku": "JKI-219",
    "name": "JKIP0 14 PUSHER - Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 2.5,
    "retailPrice": 3.5,
    "currentStock": 133,
    "location": "Houston Hub (Shelf D4)"
  },
  {
    "id": "prod-220",
    "sku": "JKI-220",
    "name": "JKIP0 15 PUSHER - Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 1.95,
    "retailPrice": 2.73,
    "currentStock": 40,
    "location": "Houston Hub (Shelf E5)"
  },
  {
    "id": "prod-221",
    "sku": "JKI-221",
    "name": "JKIP0 16 PUSHER - Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 1.95,
    "retailPrice": 2.73,
    "currentStock": 57,
    "location": "Houston Hub (Shelf F6)"
  },
  {
    "id": "prod-222",
    "sku": "JKI-222",
    "name": "JKIP0 17 .00 PUSHER - Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 5.0,
    "retailPrice": 7.0,
    "currentStock": 74,
    "location": "Houston Hub (Shelf A7)"
  },
  {
    "id": "prod-223",
    "sku": "JKI-223",
    "name": "Gel removal pushers N ew version",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Standard salon grade.",
    "imageUrl": "https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=500",
    "wholesalePrice": 1.75,
    "retailPrice": 2.45,
    "currentStock": 91,
    "location": "Houston Hub (Shelf B8)"
  },
  {
    "id": "prod-224",
    "sku": "JKI-224",
    "name": "JKIT001 NAIL TIP CUTTER Stainless Steel Color",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_246.jpeg",
    "wholesalePrice": 3.45,
    "retailPrice": 4.83,
    "currentStock": 82,
    "location": "Houston Hub (Shelf C1)"
  },
  {
    "id": "prod-225",
    "sku": "JKI-225",
    "name": "JKIT003 NAIL TIP CUTTER Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_247.png",
    "wholesalePrice": 3.45,
    "retailPrice": 4.83,
    "currentStock": 6,
    "location": "Houston Hub (Shelf D2)"
  },
  {
    "id": "prod-226",
    "sku": "JKI-226",
    "name": "JKIT007 NAIL TIP CUTTER Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_248.png",
    "wholesalePrice": 3.45,
    "retailPrice": 4.83,
    "currentStock": 108,
    "location": "Houston Hub (Shelf E3)"
  },
  {
    "id": "prod-227",
    "sku": "JKI-227",
    "name": "JKIT008 NAIL TIP CUTTER Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_249.png",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 121,
    "location": "Houston Hub (Shelf F4)"
  },
  {
    "id": "prod-228",
    "sku": "JKI-228",
    "name": "JKIT009 NAIL TIP CUTTER Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_250.png",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 134,
    "location": "Houston Hub (Shelf A5)"
  },
  {
    "id": "prod-229",
    "sku": "JKI-229",
    "name": "JKIT010 NAIL TIP CUTTER Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_251.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 147,
    "location": "Houston Hub (Shelf B6)"
  },
  {
    "id": "prod-230",
    "sku": "JKI-230",
    "name": "JKIT011 NAIL TIP CUTTER Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_252.png",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 160,
    "location": "Houston Hub (Shelf C7)"
  },
  {
    "id": "prod-231",
    "sku": "JKI-231",
    "name": "JKIT004 NAIL TIP CUTTER Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_253.png",
    "wholesalePrice": 6.0,
    "retailPrice": 8.4,
    "currentStock": 53,
    "location": "Houston Hub (Shelf D8)"
  },
  {
    "id": "prod-232",
    "sku": "JKI-232",
    "name": "Premium JKIT 005 NAIL TIP CUTTER Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_254.png",
    "wholesalePrice": 6.0,
    "retailPrice": 8.4,
    "currentStock": 66,
    "location": "Houston Hub (Shelf E1)"
  },
  {
    "id": "prod-233",
    "sku": "JKI-233",
    "name": "KBS-001 KB Gold Manicure Scissor Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_255.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 79,
    "location": "Houston Hub (Shelf F2)"
  },
  {
    "id": "prod-234",
    "sku": "JKI-234",
    "name": "KBS-00 2 $ Nose Scissor",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_256.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A3)"
  },
  {
    "id": "prod-235",
    "sku": "JKI-235",
    "name": "KBS-00 3 K B Manicure Scissor",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_257.jpeg",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 105,
    "location": "Houston Hub (Shelf B4)"
  },
  {
    "id": "prod-236",
    "sku": "JKI-236",
    "name": "KBS-00 4 Curved Scissor Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_258.jpeg",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 118,
    "location": "Houston Hub (Shelf C5)"
  },
  {
    "id": "prod-237",
    "sku": "JKI-237",
    "name": "KB S -00 5 Extra Long Scissor Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_259.jpeg",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 131,
    "location": "Houston Hub (Shelf D6)"
  },
  {
    "id": "prod-238",
    "sku": "JKI-238",
    "name": "KBS-006 Deluxe Cuticle Scissor",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_260.png",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 144,
    "location": "Houston Hub (Shelf E7)"
  },
  {
    "id": "prod-239",
    "sku": "JKI-239",
    "name": "KBS-00 7 Stainless Steel Scissor",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_261.jpeg",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 157,
    "location": "Houston Hub (Shelf F8)"
  },
  {
    "id": "prod-240",
    "sku": "JKI-240",
    "name": "KBS-00 8",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_262.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 50,
    "location": "Houston Hub (Shelf A1)"
  },
  {
    "id": "prod-241",
    "sku": "JKI-241",
    "name": "KBE-001 Slant Tweezer Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_263.jpeg",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 63,
    "location": "Houston Hub (Shelf B2)"
  },
  {
    "id": "prod-242",
    "sku": "JKI-242",
    "name": "KBE-002 Slant Tip Tweezer Stainless Steel",
    "category": "FIRM & COMFORTABLE GRIP",
    "description": "JKIOCEAN FIRM & COMFORTABLE GRIP - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_264.jpeg",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 76,
    "location": "Houston Hub (Shelf C3)"
  },
  {
    "id": "prod-243",
    "sku": "JKI-243",
    "name": "KB-001 EYELASH TWEEZERS Gold Edge-A Stainless Steel",
    "category": "P RECISION & PROFESSIONAL MAKING",
    "description": "JKIOCEAN P RECISION & PROFESSIONAL MAKING - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_265.jpeg",
    "wholesalePrice": 6.5,
    "retailPrice": 9.1,
    "currentStock": 6,
    "location": "Houston Hub (Shelf D4)"
  },
  {
    "id": "prod-244",
    "sku": "JKI-244",
    "name": "KB-002 EYELASH TWEEZERS Gold Edge-B Stainless Steel",
    "category": "P RECISION & PROFESSIONAL MAKING",
    "description": "JKIOCEAN P RECISION & PROFESSIONAL MAKING - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_266.jpeg",
    "wholesalePrice": 6.5,
    "retailPrice": 9.1,
    "currentStock": 102,
    "location": "Houston Hub (Shelf E5)"
  },
  {
    "id": "prod-245",
    "sku": "JKI-245",
    "name": "KB-003 VOLUME TWEEZERS Volume Gold-A Stainless Steel",
    "category": "P RECISION & PROFESSIONAL MAKING",
    "description": "JKIOCEAN P RECISION & PROFESSIONAL MAKING - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_267.jpeg",
    "wholesalePrice": 6.5,
    "retailPrice": 9.1,
    "currentStock": 115,
    "location": "Houston Hub (Shelf F6)"
  },
  {
    "id": "prod-246",
    "sku": "JKI-246",
    "name": "KB-004 VOLUME TWEEZER Volume Gold-B Stainless Steel",
    "category": "P RECISION & PROFESSIONAL MAKING",
    "description": "JKIOCEAN P RECISION & PROFESSIONAL MAKING - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_268.jpeg",
    "wholesalePrice": 6.5,
    "retailPrice": 9.1,
    "currentStock": 128,
    "location": "Houston Hub (Shelf A7)"
  },
  {
    "id": "prod-247",
    "sku": "JKI-247",
    "name": "KB-005 VOLUME TWEEZER Volume Gold-C Stainless Steel",
    "category": "P RECISION & PROFESSIONAL MAKING",
    "description": "JKIOCEAN P RECISION & PROFESSIONAL MAKING - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_269.jpeg",
    "wholesalePrice": 6.5,
    "retailPrice": 9.1,
    "currentStock": 141,
    "location": "Houston Hub (Shelf B8)"
  },
  {
    "id": "prod-248",
    "sku": "JKI-248",
    "name": "KB-006 EYELASHES TWEEZER Full Polish Curve-A Stainless Steel",
    "category": "P RECISION & PROFESSIONAL MAKING",
    "description": "JKIOCEAN P RECISION & PROFESSIONAL MAKING - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_270.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 154,
    "location": "Houston Hub (Shelf C1)"
  },
  {
    "id": "prod-249",
    "sku": "JKI-249",
    "name": "KB-007 . 5 EYELASHES TWEEZER Full Polish Straight-A Stainless Steel",
    "category": "P RECISION & PROFESSIONAL MAKING",
    "description": "JKIOCEAN P RECISION & PROFESSIONAL MAKING - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_271.jpeg",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 167,
    "location": "Houston Hub (Shelf D2)"
  },
  {
    "id": "prod-250",
    "sku": "JKI-250",
    "name": "KB-008 . 5 EYELASHES TWEEZER Sand &amp; Points Polish Curve-A Stainless Steel",
    "category": "P RECISION & PROFESSIONAL MAKING",
    "description": "JKIOCEAN P RECISION & PROFESSIONAL MAKING - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_272.jpeg",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 60,
    "location": "Houston Hub (Shelf E3)"
  },
  {
    "id": "prod-251",
    "sku": "JKI-251",
    "name": "KB-009 . 5 EYELASHES TWEEZER Sand &amp; Points Polish Straight-A Stainless Steel",
    "category": "P RECISION & PROFESSIONAL MAKING",
    "description": "JKIOCEAN P RECISION & PROFESSIONAL MAKING - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_273.jpeg",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 73,
    "location": "Houston Hub (Shelf F4)"
  },
  {
    "id": "prod-252",
    "sku": "JKI-252",
    "name": "KB-015 $ EYELASHES TWEEZER Stainless Steel",
    "category": "P RECISION & PROFESSIONAL MAKING",
    "description": "JKIOCEAN P RECISION & PROFESSIONAL MAKING - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_274.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A5)"
  },
  {
    "id": "prod-253",
    "sku": "GEL-253",
    "name": "Builder Gel 01 - 1 oz",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_275.png",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 99,
    "location": "Houston Hub (Shelf B6)"
  },
  {
    "id": "prod-254",
    "sku": "GEL-254",
    "name": "Builder Gel 02 - 1 oz",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_276.png",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 112,
    "location": "Houston Hub (Shelf C7)"
  },
  {
    "id": "prod-255",
    "sku": "GEL-255",
    "name": "Builder Gel 03 - 1 oz",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_277.png",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 125,
    "location": "Houston Hub (Shelf D8)"
  },
  {
    "id": "prod-256",
    "sku": "GEL-256",
    "name": "Builder Gel 04 - 1 oz",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_278.png",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 138,
    "location": "Houston Hub (Shelf E1)"
  },
  {
    "id": "prod-257",
    "sku": "GEL-257",
    "name": "Builder Gel 05 - 1 oz",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_279.png",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 151,
    "location": "Houston Hub (Shelf F2)"
  },
  {
    "id": "prod-258",
    "sku": "GEL-258",
    "name": "Builder Gel 06 - 1 oz",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_280.png",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 164,
    "location": "Houston Hub (Shelf A3)"
  },
  {
    "id": "prod-259",
    "sku": "GEL-259",
    "name": "Builder Gel - Color 1 - 6",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_281.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 57,
    "location": "Houston Hub (Shelf B4)"
  },
  {
    "id": "prod-260",
    "sku": "GEL-260",
    "name": "Builder Gel 07 - 1 oz",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_282.jpeg",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 70,
    "location": "Houston Hub (Shelf C5)"
  },
  {
    "id": "prod-261",
    "sku": "GEL-261",
    "name": "Builder Gel 08 - 1 oz",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_283.jpeg",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 6,
    "location": "Houston Hub (Shelf D6)"
  },
  {
    "id": "prod-262",
    "sku": "GEL-262",
    "name": "Builder Gel 09 - 1 oz",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_332.jpeg",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 96,
    "location": "Houston Hub (Shelf E7)"
  },
  {
    "id": "prod-263",
    "sku": "GEL-263",
    "name": "Builder Gel 10 - 1 oz",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_284.jpeg",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 109,
    "location": "Houston Hub (Shelf F8)"
  },
  {
    "id": "prod-264",
    "sku": "GEL-264",
    "name": "Builder Gel 0 1 - 2 oz",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_285.jpeg",
    "wholesalePrice": 8.0,
    "retailPrice": 11.2,
    "currentStock": 122,
    "location": "Houston Hub (Shelf A1)"
  },
  {
    "id": "prod-265",
    "sku": "GEL-265",
    "name": "Builder Gel 0 2 - 2 oz",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_286.jpeg",
    "wholesalePrice": 8.0,
    "retailPrice": 11.2,
    "currentStock": 135,
    "location": "Houston Hub (Shelf B2)"
  },
  {
    "id": "prod-266",
    "sku": "GEL-266",
    "name": "Builder Gel 0 3 - 2 oz",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_287.jpeg",
    "wholesalePrice": 8.0,
    "retailPrice": 11.2,
    "currentStock": 148,
    "location": "Houston Hub (Shelf C3)"
  },
  {
    "id": "prod-267",
    "sku": "GEL-267",
    "name": "Builder Gel 04 - 2 oz",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_288.jpeg",
    "wholesalePrice": 8.0,
    "retailPrice": 11.2,
    "currentStock": 161,
    "location": "Houston Hub (Shelf D4)"
  },
  {
    "id": "prod-268",
    "sku": "GEL-268",
    "name": "Builder Gel 05 - 2 oz",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_289.jpeg",
    "wholesalePrice": 8.0,
    "retailPrice": 11.2,
    "currentStock": 54,
    "location": "Houston Hub (Shelf E5)"
  },
  {
    "id": "prod-269",
    "sku": "GEL-269",
    "name": "Builder Gel 06 - 2 oz",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_290.jpeg",
    "wholesalePrice": 8.0,
    "retailPrice": 11.2,
    "currentStock": 67,
    "location": "Houston Hub (Shelf F6)"
  },
  {
    "id": "prod-270",
    "sku": "GEL-270",
    "name": "Builder gel 1 oz (New Version) #11",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_291.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A7)"
  },
  {
    "id": "prod-271",
    "sku": "GEL-271",
    "name": "Builder gel 1 oz (New Version) #12",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_292.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 93,
    "location": "Houston Hub (Shelf B8)"
  },
  {
    "id": "prod-272",
    "sku": "GEL-272",
    "name": "Builder gel 1 oz (New Version) #13",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_293.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 106,
    "location": "Houston Hub (Shelf C1)"
  },
  {
    "id": "prod-273",
    "sku": "GEL-273",
    "name": "Builder gel 1 oz (New Version) #14",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_294.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 119,
    "location": "Houston Hub (Shelf D2)"
  },
  {
    "id": "prod-274",
    "sku": "GEL-274",
    "name": "Builder gel 1 oz (New Version) #15",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_295.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 132,
    "location": "Houston Hub (Shelf E3)"
  },
  {
    "id": "prod-275",
    "sku": "GEL-275",
    "name": "Builder gel 1 oz (New Version) #16",
    "category": "BUILDER GEL",
    "description": "JKIOCEAN BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_296.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 145,
    "location": "Houston Hub (Shelf F4)"
  },
  {
    "id": "prod-276",
    "sku": "GEL-276",
    "name": "Liquid Builder Gel 01",
    "category": "LIQUID BUILDER GEL",
    "description": "JKIOCEAN LIQUID BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_297.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 158,
    "location": "Houston Hub (Shelf A5)"
  },
  {
    "id": "prod-277",
    "sku": "GEL-277",
    "name": "Liquid Builder Gel 02",
    "category": "LIQUID BUILDER GEL",
    "description": "JKIOCEAN LIQUID BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_298.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 51,
    "location": "Houston Hub (Shelf B6)"
  },
  {
    "id": "prod-278",
    "sku": "GEL-278",
    "name": "Liquid Builder Gel 03",
    "category": "LIQUID BUILDER GEL",
    "description": "JKIOCEAN LIQUID BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_299.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 64,
    "location": "Houston Hub (Shelf C7)"
  },
  {
    "id": "prod-279",
    "sku": "GEL-279",
    "name": "Liquid Builder Gel 04",
    "category": "LIQUID BUILDER GEL",
    "description": "JKIOCEAN LIQUID BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_300.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 6,
    "location": "Houston Hub (Shelf D8)"
  },
  {
    "id": "prod-280",
    "sku": "GEL-280",
    "name": "Liquid Builder Gel 05",
    "category": "LIQUID BUILDER GEL",
    "description": "JKIOCEAN LIQUID BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_301.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 90,
    "location": "Houston Hub (Shelf E1)"
  },
  {
    "id": "prod-281",
    "sku": "GEL-281",
    "name": "Liquid Builder Gel 06",
    "category": "LIQUID BUILDER GEL",
    "description": "JKIOCEAN LIQUID BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_302.png",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 103,
    "location": "Houston Hub (Shelf F2)"
  },
  {
    "id": "prod-282",
    "sku": "GEL-282",
    "name": "Liquid Builder Gel Color 1 - 6",
    "category": "LIQUID BUILDER GEL",
    "description": "JKIOCEAN LIQUID BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_303.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 116,
    "location": "Houston Hub (Shelf A3)"
  },
  {
    "id": "prod-283",
    "sku": "GEL-283",
    "name": "Liquid Peel Off Latex Tape . 50",
    "category": "LIQUID BUILDER GEL",
    "description": "JKIOCEAN LIQUID BUILDER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_304.png",
    "wholesalePrice": 3.0,
    "retailPrice": 4.2,
    "currentStock": 129,
    "location": "Houston Hub (Shelf B4)"
  },
  {
    "id": "prod-284",
    "sku": "GEL-284",
    "name": "Polygel Clear",
    "category": "POLYGEL",
    "description": "JKIOCEAN POLYGEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_305.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 142,
    "location": "Houston Hub (Shelf C5)"
  },
  {
    "id": "prod-285",
    "sku": "GEL-285",
    "name": "Polygel White",
    "category": "POLYGEL",
    "description": "JKIOCEAN POLYGEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_306.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 155,
    "location": "Houston Hub (Shelf D6)"
  },
  {
    "id": "prod-286",
    "sku": "GEL-286",
    "name": "Polygel Nude Pink",
    "category": "POLYGEL",
    "description": "JKIOCEAN POLYGEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_307.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 168,
    "location": "Houston Hub (Shelf E7)"
  },
  {
    "id": "prod-287",
    "sku": "GEL-287",
    "name": "Metallic Painting Gel Gold",
    "category": "METALLIC PAINTING GEL",
    "description": "JKIOCEAN METALLIC PAINTING GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_308.png",
    "wholesalePrice": 4.75,
    "retailPrice": 6.65,
    "currentStock": 61,
    "location": "Houston Hub (Shelf F8)"
  },
  {
    "id": "prod-288",
    "sku": "GEL-288",
    "name": "Metallic Painting Gel Silver",
    "category": "METALLIC PAINTING GEL",
    "description": "JKIOCEAN METALLIC PAINTING GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_309.png",
    "wholesalePrice": 4.75,
    "retailPrice": 6.65,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A1)"
  },
  {
    "id": "prod-289",
    "sku": "GEL-289",
    "name": "Metallic Painting Gel Rose Gold",
    "category": "METALLIC PAINTING GEL",
    "description": "JKIOCEAN METALLIC PAINTING GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_310.png",
    "wholesalePrice": 4.75,
    "retailPrice": 6.65,
    "currentStock": 87,
    "location": "Houston Hub (Shelf B2)"
  },
  {
    "id": "prod-290",
    "sku": "GEL-290",
    "name": "Metallic Painting Gel Gold - Thicker Rose Gold",
    "category": "METALLIC PAINTING GEL",
    "description": "JKIOCEAN METALLIC PAINTING GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_311.png",
    "wholesalePrice": 4.75,
    "retailPrice": 6.65,
    "currentStock": 100,
    "location": "Houston Hub (Shelf C3)"
  },
  {
    "id": "prod-291",
    "sku": "GEL-291",
    "name": "3D Carving Pinch Gel (non-stick) Clear Size 0.17 oz Size 1 oz",
    "category": "3D CARVING PINCH GEL (NON-STICK)",
    "description": "JKIOCEAN 3D CARVING PINCH GEL (NON-STICK) - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_312.jpeg",
    "wholesalePrice": 3.25,
    "retailPrice": 4.55,
    "currentStock": 113,
    "location": "Houston Hub (Shelf D4)"
  },
  {
    "id": "prod-292",
    "sku": "GEL-292",
    "name": "3D Carving Pinch Gel (non-stick) Seashell Size 0.17 oz Size 1 oz",
    "category": "3D CARVING PINCH GEL (NON-STICK)",
    "description": "JKIOCEAN 3D CARVING PINCH GEL (NON-STICK) - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_313.jpeg",
    "wholesalePrice": 3.25,
    "retailPrice": 4.55,
    "currentStock": 126,
    "location": "Houston Hub (Shelf E5)"
  },
  {
    "id": "prod-293",
    "sku": "GEL-293",
    "name": "3D Carving Pinch Gel (non-stick) White Size 0.17 oz Size 1 oz",
    "category": "3D CARVING PINCH GEL (NON-STICK)",
    "description": "JKIOCEAN 3D CARVING PINCH GEL (NON-STICK) - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_314.jpeg",
    "wholesalePrice": 3.25,
    "retailPrice": 4.55,
    "currentStock": 139,
    "location": "Houston Hub (Shelf F6)"
  },
  {
    "id": "prod-294",
    "sku": "JKI-294",
    "name": "Molding Design Code 02",
    "category": "M0LDING DESIGN",
    "description": "JKIOCEAN M0LDING DESIGN - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_315.jpeg",
    "wholesalePrice": 3.25,
    "retailPrice": 4.55,
    "currentStock": 152,
    "location": "Houston Hub (Shelf A7)"
  },
  {
    "id": "prod-295",
    "sku": "JKI-295",
    "name": "Molding Design Code 03",
    "category": "M0LDING DESIGN",
    "description": "JKIOCEAN M0LDING DESIGN - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_316.jpeg",
    "wholesalePrice": 3.25,
    "retailPrice": 4.55,
    "currentStock": 165,
    "location": "Houston Hub (Shelf B8)"
  },
  {
    "id": "prod-296",
    "sku": "JKI-296",
    "name": "Molding Design Code 04",
    "category": "M0LDING DESIGN",
    "description": "JKIOCEAN M0LDING DESIGN - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_317.jpeg",
    "wholesalePrice": 3.25,
    "retailPrice": 4.55,
    "currentStock": 58,
    "location": "Houston Hub (Shelf C1)"
  },
  {
    "id": "prod-297",
    "sku": "JKI-297",
    "name": "Molding Design - 05 Code 05",
    "category": "M0LDING DESIGN",
    "description": "JKIOCEAN M0LDING DESIGN - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_318.jpeg",
    "wholesalePrice": 3.25,
    "retailPrice": 4.55,
    "currentStock": 6,
    "location": "Houston Hub (Shelf D2)"
  },
  {
    "id": "prod-298",
    "sku": "JKI-298",
    "name": "Molding Design MCL-CGSP-03",
    "category": "M0LDING DESIGN",
    "description": "JKIOCEAN M0LDING DESIGN - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_319.jpeg",
    "wholesalePrice": 3.25,
    "retailPrice": 4.55,
    "currentStock": 84,
    "location": "Houston Hub (Shelf E3)"
  },
  {
    "id": "prod-299",
    "sku": "GEL-299",
    "name": "Pat Painting Gel Series 01",
    "category": "PAT PAINTING GEL",
    "description": "JKIOCEAN PAT PAINTING GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_320.jpeg",
    "wholesalePrice": 12.0,
    "retailPrice": 16.8,
    "currentStock": 97,
    "location": "Houston Hub (Shelf F4)"
  },
  {
    "id": "prod-300",
    "sku": "GEL-300",
    "name": "Pat Painting Gel Series 01",
    "category": "PAT PAINTING GEL",
    "description": "JKIOCEAN PAT PAINTING GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_321.jpeg",
    "wholesalePrice": 12.0,
    "retailPrice": 16.8,
    "currentStock": 110,
    "location": "Houston Hub (Shelf A5)"
  },
  {
    "id": "prod-301",
    "sku": "GEL-301",
    "name": "Pat Painting Gel Series 03",
    "category": "PAT PAINTING GEL",
    "description": "JKIOCEAN PAT PAINTING GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_322.jpeg",
    "wholesalePrice": 8.5,
    "retailPrice": 11.9,
    "currentStock": 123,
    "location": "Houston Hub (Shelf B6)"
  },
  {
    "id": "prod-302",
    "sku": "GEL-302",
    "name": "Pat Painting Gel Series 0 4",
    "category": "PAT PAINTING GEL",
    "description": "JKIOCEAN PAT PAINTING GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_323.jpeg",
    "wholesalePrice": 8.5,
    "retailPrice": 11.9,
    "currentStock": 136,
    "location": "Houston Hub (Shelf C7)"
  },
  {
    "id": "prod-303",
    "sku": "GEL-303",
    "name": "Pat Painting Gel Series 0 5",
    "category": "PAT PAINTING GEL",
    "description": "JKIOCEAN PAT PAINTING GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_324.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 149,
    "location": "Houston Hub (Shelf D8)"
  },
  {
    "id": "prod-304",
    "sku": "GEL-304",
    "name": "Pat Painting Gel Series 0 6",
    "category": "PAT PAINTING GEL",
    "description": "JKIOCEAN PAT PAINTING GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_325.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 162,
    "location": "Houston Hub (Shelf E1)"
  },
  {
    "id": "prod-305",
    "sku": "GEL-305",
    "name": "Pat Painting Gel Series 0 7",
    "category": "PAT PAINTING GEL",
    "description": "JKIOCEAN PAT PAINTING GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_326.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 55,
    "location": "Houston Hub (Shelf F2)"
  },
  {
    "id": "prod-306",
    "sku": "GEL-306",
    "name": "Pat Painting Gel Series 08",
    "category": "PAT PAINTING GEL",
    "description": "JKIOCEAN PAT PAINTING GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_327.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A3)"
  },
  {
    "id": "prod-307",
    "sku": "GEL-307",
    "name": "Pat Painting Gel Series 09",
    "category": "PAT PAINTING GEL",
    "description": "JKIOCEAN PAT PAINTING GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_328.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 81,
    "location": "Houston Hub (Shelf B4)"
  },
  {
    "id": "prod-308",
    "sku": "GEL-308",
    "name": "Pat Painting Gel Series 10",
    "category": "PAT PAINTING GEL",
    "description": "JKIOCEAN PAT PAINTING GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_329.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 94,
    "location": "Houston Hub (Shelf C5)"
  },
  {
    "id": "prod-309",
    "sku": "GEL-309",
    "name": "Cat Eye Gel Code 0 1",
    "category": "CAT EYE GEL",
    "description": "JKIOCEAN CAT EYE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_330.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 107,
    "location": "Houston Hub (Shelf D6)"
  },
  {
    "id": "prod-310",
    "sku": "GEL-310",
    "name": "Cat Eye Gel Code 02",
    "category": "CAT EYE GEL",
    "description": "JKIOCEAN CAT EYE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_331.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 120,
    "location": "Houston Hub (Shelf E7)"
  },
  {
    "id": "prod-311",
    "sku": "GEL-311",
    "name": "Cat Eye Gel Code 03",
    "category": "CAT EYE GEL",
    "description": "JKIOCEAN CAT EYE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_375.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 133,
    "location": "Houston Hub (Shelf F8)"
  },
  {
    "id": "prod-312",
    "sku": "GEL-312",
    "name": "Cat Eye Gel Code 04",
    "category": "CAT EYE GEL",
    "description": "JKIOCEAN CAT EYE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_333.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 146,
    "location": "Houston Hub (Shelf A1)"
  },
  {
    "id": "prod-313",
    "sku": "GEL-313",
    "name": "Cat Eye Gel Code 0 5",
    "category": "CAT EYE GEL",
    "description": "JKIOCEAN CAT EYE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_334.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 159,
    "location": "Houston Hub (Shelf B2)"
  },
  {
    "id": "prod-314",
    "sku": "GEL-314",
    "name": "Cat Eye Gel Code 06",
    "category": "CAT EYE GEL",
    "description": "JKIOCEAN CAT EYE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_335.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 52,
    "location": "Houston Hub (Shelf C3)"
  },
  {
    "id": "prod-315",
    "sku": "GEL-315",
    "name": "Cat Eye Gel Code 07",
    "category": "CAT EYE GEL",
    "description": "JKIOCEAN CAT EYE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_336.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 6,
    "location": "Houston Hub (Shelf D4)"
  },
  {
    "id": "prod-316",
    "sku": "GEL-316",
    "name": "Cat Eye Gel Code 08",
    "category": "CAT EYE GEL",
    "description": "JKIOCEAN CAT EYE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_337.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 78,
    "location": "Houston Hub (Shelf E5)"
  },
  {
    "id": "prod-317",
    "sku": "GEL-317",
    "name": "Cat Eye Gel Code 0 9",
    "category": "CAT EYE GEL",
    "description": "JKIOCEAN CAT EYE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_338.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 91,
    "location": "Houston Hub (Shelf F6)"
  },
  {
    "id": "prod-318",
    "sku": "GEL-318",
    "name": "Cat eye polish gel colour chart",
    "category": "CAT EYE GEL",
    "description": "JKIOCEAN CAT EYE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_339.png",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 104,
    "location": "Houston Hub (Shelf A7)"
  },
  {
    "id": "prod-319",
    "sku": "GEL-319",
    "name": "Cat eye gel 9 colors",
    "category": "CAT EYE GEL",
    "description": "JKIOCEAN CAT EYE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_340.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 117,
    "location": "Houston Hub (Shelf B8)"
  },
  {
    "id": "prod-320",
    "sku": "GEL-320",
    "name": "Poke Gel 01 White",
    "category": "POKE GEL",
    "description": "JKIOCEAN POKE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_341.jpeg",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 130,
    "location": "Houston Hub (Shelf C1)"
  },
  {
    "id": "prod-321",
    "sku": "GEL-321",
    "name": "Professional for Poke Gel",
    "category": "POKE GEL",
    "description": "JKIOCEAN POKE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_342.jpeg",
    "wholesalePrice": 3.75,
    "retailPrice": 5.25,
    "currentStock": 143,
    "location": "Houston Hub (Shelf D2)"
  },
  {
    "id": "prod-322",
    "sku": "GEL-322",
    "name": "Poke Gel 01 White",
    "category": "POKE GEL",
    "description": "JKIOCEAN POKE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_343.jpeg",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 156,
    "location": "Houston Hub (Shelf E3)"
  },
  {
    "id": "prod-323",
    "sku": "GEL-323",
    "name": "Poke Gel 02 Black",
    "category": "POKE GEL",
    "description": "JKIOCEAN POKE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_344.jpeg",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 169,
    "location": "Houston Hub (Shelf F4)"
  },
  {
    "id": "prod-324",
    "sku": "GEL-324",
    "name": "Poke Gel 03 Organe",
    "category": "POKE GEL",
    "description": "JKIOCEAN POKE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_345.jpeg",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A5)"
  },
  {
    "id": "prod-325",
    "sku": "GEL-325",
    "name": "Poke Gel 04 Green",
    "category": "POKE GEL",
    "description": "JKIOCEAN POKE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_346.jpeg",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 75,
    "location": "Houston Hub (Shelf B6)"
  },
  {
    "id": "prod-326",
    "sku": "GEL-326",
    "name": "Poke Gel 05 Blue",
    "category": "POKE GEL",
    "description": "JKIOCEAN POKE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_347.jpeg",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 88,
    "location": "Houston Hub (Shelf C7)"
  },
  {
    "id": "prod-327",
    "sku": "GEL-327",
    "name": "Poke Gel 06 Yellow",
    "category": "POKE GEL",
    "description": "JKIOCEAN POKE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_348.jpeg",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 101,
    "location": "Houston Hub (Shelf D8)"
  },
  {
    "id": "prod-328",
    "sku": "GEL-328",
    "name": "Poke Gel 07 Carrming",
    "category": "POKE GEL",
    "description": "JKIOCEAN POKE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_349.jpeg",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 114,
    "location": "Houston Hub (Shelf E1)"
  },
  {
    "id": "prod-329",
    "sku": "GEL-329",
    "name": "Poke Gel 08 Red",
    "category": "POKE GEL",
    "description": "JKIOCEAN POKE GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_350.jpeg",
    "wholesalePrice": 5.5,
    "retailPrice": 7.7,
    "currentStock": 127,
    "location": "Houston Hub (Shelf F2)"
  },
  {
    "id": "prod-330",
    "sku": "JKI-330",
    "name": "Rhinestone Glue",
    "category": "GLUE",
    "description": "JKIOCEAN GLUE - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_351.png",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 140,
    "location": "Houston Hub (Shelf A3)"
  },
  {
    "id": "prod-331",
    "sku": "JKI-331",
    "name": "Rhinestone Glue 4 in 1",
    "category": "GLUE",
    "description": "JKIOCEAN GLUE - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_352.png",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 153,
    "location": "Houston Hub (Shelf B4)"
  },
  {
    "id": "prod-332",
    "sku": "JKI-332",
    "name": "5D Sculpting Glue",
    "category": "GLUE",
    "description": "JKIOCEAN GLUE - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_353.png",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 166,
    "location": "Houston Hub (Shelf C5)"
  },
  {
    "id": "prod-333",
    "sku": "GEL-333",
    "name": "Spider Gel 01 Black",
    "category": "Spider Gel",
    "description": "JKIOCEAN Spider Gel - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_354.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 6,
    "location": "Houston Hub (Shelf D6)"
  },
  {
    "id": "prod-334",
    "sku": "GEL-334",
    "name": "Spider Gel 02 White",
    "category": "Spider Gel",
    "description": "JKIOCEAN Spider Gel - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_355.jpeg",
    "wholesalePrice": 4.5,
    "retailPrice": 6.3,
    "currentStock": 72,
    "location": "Houston Hub (Shelf E7)"
  },
  {
    "id": "prod-335",
    "sku": "GEL-335",
    "name": "White Pearl Chrome Powder .50",
    "category": "WHITE PEARL CHROME POWDER",
    "description": "JKIOCEAN WHITE PEARL CHROME POWDER - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_356.jpeg",
    "wholesalePrice": 3.0,
    "retailPrice": 4.2,
    "currentStock": 85,
    "location": "Houston Hub (Shelf F8)"
  },
  {
    "id": "prod-336",
    "sku": "GEL-336",
    "name": "Solid Gel Paint White",
    "category": "SOLID GEL PAINT",
    "description": "JKIOCEAN SOLID GEL PAINT - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_357.png",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 98,
    "location": "Houston Hub (Shelf A1)"
  },
  {
    "id": "prod-337",
    "sku": "GEL-337",
    "name": "Solid Gel Paint Black",
    "category": "SOLID GEL PAINT",
    "description": "JKIOCEAN SOLID GEL PAINT - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_358.png",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 111,
    "location": "Houston Hub (Shelf B2)"
  },
  {
    "id": "prod-338",
    "sku": "GEL-338",
    "name": "Ombre Powder 01",
    "category": "OMBRE POWDER",
    "description": "JKIOCEAN OMBRE POWDER - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_359.jpeg",
    "wholesalePrice": 4.0,
    "retailPrice": 5.6,
    "currentStock": 124,
    "location": "Houston Hub (Shelf C3)"
  },
  {
    "id": "prod-339",
    "sku": "GEL-339",
    "name": "Ombre Powder 02",
    "category": "OMBRE POWDER",
    "description": "JKIOCEAN OMBRE POWDER - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_360.jpeg",
    "wholesalePrice": 8.0,
    "retailPrice": 11.2,
    "currentStock": 137,
    "location": "Houston Hub (Shelf D4)"
  },
  {
    "id": "prod-340",
    "sku": "GEL-340",
    "name": "D Blooming Gel",
    "category": "BLOOMING GEL",
    "description": "JKIOCEAN BLOOMING GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_361.png",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 150,
    "location": "Houston Hub (Shelf E5)"
  },
  {
    "id": "prod-341",
    "sku": "GEL-341",
    "name": "Magic Remover Gel",
    "category": "BLOOMING GEL",
    "description": "JKIOCEAN BLOOMING GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_362.png",
    "wholesalePrice": 3.5,
    "retailPrice": 4.9,
    "currentStock": 163,
    "location": "Houston Hub (Shelf F6)"
  },
  {
    "id": "prod-342",
    "sku": "JKI-342",
    "name": "Water Drop Topcoat 1 $",
    "category": "W ater  D rop  T opcoat",
    "description": "JKIOCEAN W ater  D rop  T opcoat - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_363.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 6,
    "location": "Houston Hub (Shelf A7)"
  },
  {
    "id": "prod-343",
    "sku": "JKI-343",
    "name": "W ater D rop T opcoat 2 $",
    "category": "W ater  D rop  T opcoat",
    "description": "JKIOCEAN W ater  D rop  T opcoat - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_364.jpeg",
    "wholesalePrice": 15.0,
    "retailPrice": 21.0,
    "currentStock": 69,
    "location": "Houston Hub (Shelf B8)"
  },
  {
    "id": "prod-344",
    "sku": "GEL-344",
    "name": "Cushion Gardient Omber Gel #1 Black",
    "category": "CUSHION GARDIENT OMBER GEL",
    "description": "JKIOCEAN CUSHION GARDIENT OMBER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_365.png",
    "wholesalePrice": 3.25,
    "retailPrice": 4.55,
    "currentStock": 82,
    "location": "Houston Hub (Shelf C1)"
  },
  {
    "id": "prod-345",
    "sku": "GEL-345",
    "name": "Cushion Gardient Omber Gel #1 White",
    "category": "CUSHION GARDIENT OMBER GEL",
    "description": "JKIOCEAN CUSHION GARDIENT OMBER GEL - Professional US salon grade.",
    "imageUrl": "/uploads/products/prod_366.png",
    "wholesalePrice": 3.25,
    "retailPrice": 4.55,
    "currentStock": 95,
    "location": "Houston Hub (Shelf D2)"
  }
];

// In-Memory store for quotes with realistic records
let quotesStore: QuoteData[] = [{
  "id": "qt-001",
  "quoteNumber": "QT-202610-1001",
  "customerId": "cus-001",
  "customer": {
    "id": "cus-001",
    "businessName": "A to Z Nail Supply",
    "contactPerson": "Andy Tran",
    "phone": "+1-832-555-0142",
    "email": "orders@atoznailsuppsupply.com",
    "address": "7211 Regency Square Blvd",
    "city": "Houston",
    "state": "TX",
    "zipCode": "77036",
    "tier": "VIP"
  },
  "subtotal": 140.0,
  "totalDiscount": 14.0,
  "shipping": 0,
  "totalAmount": 126.0,
  "validUntil": "2026-11-15T23:59:59.000Z",
  "createdAt": "2026-10-25T10:15:00.000Z",
  "status": "SENT",
  "notes": "Exclusive wholesale distributor pricing - Free ground shipping from Houston Hub.",
  "paymentTerms": "Zelle / Check / Wire Transfer",
  "createdUser": "Johnny Tran",
  "items": [
    {
      "id": "qi-101",
      "productId": "prod-001",
      "productName": "Nail Art Palette Heart Blue",
      "sku": "ACC-001",
      "imageUrl": "/uploads/products/prod_368.png",
      "category": "ACCESSORIES",
      "quantity": 20,
      "unitPrice": 4.0,
      "discount": 10,
      "lineTotal": 72.0
    },
    {
      "id": "qi-102",
      "productId": "prod-002",
      "productName": "Nail Art Palette Square Blue",
      "sku": "ACC-002",
      "imageUrl": "/uploads/products/prod_370.png",
      "category": "ACCESSORIES",
      "quantity": 15,
      "unitPrice": 4.0,
      "discount": 10,
      "lineTotal": 54.0
    }
  ]
}];

// Helper: Query quotes from Prisma or fallback to Memory Store
export async function getQuotesList(search?: string, status?: string) {
  if (process.env.DATABASE_URL) {
    try {
      const where: any = {};
      if (status && status !== "ALL") {
        where.status = status;
      }
      if (search && search.trim() !== "") {
        const q = search.trim();
        where.OR = [
          { quoteNumber: { contains: q, mode: "insensitive" } },
          { customer: { businessName: { contains: q, mode: "insensitive" } } },
          { customer: { contactPerson: { contains: q, mode: "insensitive" } } },
          { customer: { phone: { contains: q, mode: "insensitive" } } },
        ];
      }

      const dbQuotes = await prisma.quote.findMany({
        where,
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (dbQuotes && dbQuotes.length > 0) {
        return dbQuotes.map((q) => {
          const items: QuoteItemData[] = q.items.map((it) => {
            const lTot = it.quantity * it.unitPrice * (1 - (it.discount || 0) / 100);
            return {
              id: it.id,
              productId: it.productId,
              productName: it.product?.name || "Product",
              sku: it.product?.sku || "SKU",
              imageUrl: it.product?.imageUrl || undefined,
              category: it.product?.category,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              discount: it.discount,
              lineTotal: Number(lTot.toFixed(2)),
            };
          });

          const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
          const totalDiscount = items.reduce((s, it) => s + (it.quantity * it.unitPrice * (it.discount / 100)), 0);

          return {
            id: q.id,
            quoteNumber: q.quoteNumber,
            customerId: q.customerId,
            customer: {
              id: q.customer.id,
              businessName: q.customer.businessName,
              contactPerson: q.customer.contactPerson,
              phone: q.customer.phone,
              email: q.customer.email,
              address: q.customer.address,
              city: q.customer.city,
              state: q.customer.state,
              zipCode: q.customer.zipCode,
              tier: q.customer.tier,
            },
            totalAmount: q.totalAmount,
            subtotal: Number(subtotal.toFixed(2)),
            totalDiscount: Number(totalDiscount.toFixed(2)),
            shipping: 0,
            validUntil: q.validUntil.toISOString(),
            createdAt: q.createdAt.toISOString(),
            status: q.status as QuoteData["status"],
            notes: q.notes,
            paymentTerms: "Zelle / Check / Wire Transfer",
            createdUser: q.createdUser,
            items,
          };
        });
      }
    } catch (err) {
      // Database connection not ready, proceed to memory store
    }
  }

  // Memory store fallback
  let list = [...quotesStore];
  if (status && status !== "ALL") {
    list = list.filter((q) => q.status.toUpperCase() === status.toUpperCase());
  }
  if (search && search.trim() !== "") {
    const q = search.trim().toLowerCase();
    list = list.filter(
      (it) =>
        it.quoteNumber.toLowerCase().includes(q) ||
        it.customer.businessName.toLowerCase().includes(q) ||
        it.customer.contactPerson.toLowerCase().includes(q) ||
        it.customer.phone.toLowerCase().includes(q)
    );
  }

  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// Helper: Get quote by ID or quoteNumber
export async function getQuoteDetail(idOrNumber: string): Promise<QuoteData | null> {
  if (process.env.DATABASE_URL) {
    try {
      const q = await prisma.quote.findFirst({
        where: {
          OR: [{ id: idOrNumber }, { quoteNumber: idOrNumber }],
        },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (q) {
        const items: QuoteItemData[] = q.items.map((it) => {
          const lTot = it.quantity * it.unitPrice * (1 - (it.discount || 0) / 100);
          return {
            id: it.id,
            productId: it.productId,
            productName: it.product?.name || "Product",
            sku: it.product?.sku || "SKU",
            imageUrl: it.product?.imageUrl || undefined,
            category: it.product?.category,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            discount: it.discount,
            lineTotal: Number(lTot.toFixed(2)),
          };
        });

        const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
        const totalDiscount = items.reduce((s, it) => s + (it.quantity * it.unitPrice * (it.discount / 100)), 0);

        return {
          id: q.id,
          quoteNumber: q.quoteNumber,
          customerId: q.customerId,
          customer: {
            id: q.customer.id,
            businessName: q.customer.businessName,
            contactPerson: q.customer.contactPerson,
            phone: q.customer.phone,
            email: q.customer.email,
            address: q.customer.address,
            city: q.customer.city,
            state: q.customer.state,
            zipCode: q.customer.zipCode,
            tier: q.customer.tier,
          },
          totalAmount: q.totalAmount,
          subtotal: Number(subtotal.toFixed(2)),
          totalDiscount: Number(totalDiscount.toFixed(2)),
          shipping: 0,
          validUntil: q.validUntil.toISOString(),
          createdAt: q.createdAt.toISOString(),
          status: q.status as QuoteData["status"],
          notes: q.notes,
          paymentTerms: "Zelle / Check / Wire Transfer",
          createdUser: q.createdUser,
          items,
        };
      }
    } catch (err) {
      // Fallback to memory
    }
  }

  const found = quotesStore.find((q) => q.id === idOrNumber || q.quoteNumber === idOrNumber);
  return found || null;
}

// Helper: Create a new quote
export async function createNewQuote(data: {
  customerId: string;
  customer?: Partial<QuoteCustomerData>;
  items: Array<{
    productId: string;
    productName: string;
    sku: string;
    imageUrl?: string;
    category?: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
  }>;
  validUntil: string;
  notes?: string;
  paymentTerms?: string;
  status?: QuoteData["status"];
  createdUser?: string;
}): Promise<QuoteData> {
  const quoteNumber = `QT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;

  let customer = SAMPLE_CUSTOMERS.find((c) => c.id === data.customerId);
  if (!customer && data.customer) {
    customer = {
      id: data.customerId,
      businessName: data.customer.businessName || "Valued Customer",
      contactPerson: data.customer.contactPerson || "Salon Manager",
      phone: data.customer.phone || "+1-713-330-6165",
      email: data.customer.email || null,
      address: data.customer.address || "Houston, TX",
      city: data.customer.city || "Houston",
      state: data.customer.state || "TX",
      zipCode: data.customer.zipCode || "77036",
      tier: data.customer.tier || "STANDARD",
    };
  }

  if (!customer) {
    customer = SAMPLE_CUSTOMERS[0];
  }

  const items: QuoteItemData[] = data.items.map((it, idx) => {
    const disc = it.discount || 0;
    const lTot = it.quantity * it.unitPrice * (1 - disc / 100);
    return {
      id: `qi-new-${Date.now()}-${idx}`,
      productId: it.productId,
      productName: it.productName,
      sku: it.sku,
      imageUrl: it.imageUrl,
      category: it.category,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      discount: disc,
      lineTotal: Number(lTot.toFixed(2)),
    };
  });

  const subtotal = items.reduce((s, it) => s + it.quantity * it.unitPrice, 0);
  const totalDiscount = items.reduce((s, it) => s + (it.quantity * it.unitPrice * (it.discount / 100)), 0);
  const totalAmount = Number((subtotal - totalDiscount).toFixed(2));

  const newQuote: QuoteData = {
    id: `qt-${Date.now()}`,
    quoteNumber,
    customerId: customer.id,
    customer,
    totalAmount,
    subtotal: Number(subtotal.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    shipping: 0,
    validUntil: data.validUntil,
    createdAt: new Date().toISOString(),
    status: data.status || "DRAFT",
    notes: data.notes || "Free local delivery for wholesale orders in Greater Houston Hub.",
    paymentTerms: data.paymentTerms || "Zelle / Check / Wire Transfer",
    createdUser: data.createdUser || "Johnny Tran",
    items,
  };

  if (process.env.DATABASE_URL) {
    try {
      await prisma.quote.create({
        data: {
          id: newQuote.id,
          quoteNumber: newQuote.quoteNumber,
          customerId: newQuote.customerId,
          totalAmount: newQuote.totalAmount,
          validUntil: new Date(newQuote.validUntil),
          notes: newQuote.notes,
          status: newQuote.status,
          createdUser: newQuote.createdUser,
          items: {
            create: newQuote.items.map((it) => ({
              productId: it.productId,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              discount: it.discount,
            })),
          },
        },
      });
    } catch (err) {
      // Fallback to memory store
    }
  }

  quotesStore.unshift(newQuote);
  return newQuote;
}

export function updateQuoteStatus(id: string, status: QuoteData["status"]): QuoteData | null {
  const q = quotesStore.find((x) => x.id === id);
  if (q) {
    q.status = status;
    return q;
  }
  return null;
}
