import { PrismaClient, CustomerTier, CustomerStatus, MovementType, QuoteStatus, PaymentStatus, DipReason, SmsType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log(">> Seeding JKIOCEAN ERP Database...");

  // 1. Seed Products (Z Brushes, Cuticle Nippers, Tools)
  const products = [
    {
      sku: "Z-BRUSH-08",
      name: "Kolinsky 3D Acrylic Brush #8 - Z Series",
      category: "Z Brushes",
      description: "100% Pure Kolinsky Sable hair, chemical-resistant metallic handle, size 8 for precision 3D nail art.",
      imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80",
      wholesalePrice: 16.5,
      retailPrice: 22.0,
      currentStock: 140,
      minStockAlert: 20,
      location: "Houston Hub (Kệ A1)",
    },
    {
      sku: "Z-BRUSH-10",
      name: "Kolinsky Oval Acrylic Brush #10 - Z Series",
      category: "Z Brushes",
      description: "Lông chồn Kolinsky nguyên chất chuẩn Mỹ, dáng bầu dục vuốt mượt, giữ liquid lâu.",
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80",
      wholesalePrice: 18.0,
      retailPrice: 24.5,
      currentStock: 95,
      minStockAlert: 25,
      location: "Houston Hub (Kệ A2)",
    },
    {
      sku: "Z-BRUSH-12",
      name: "Kolinsky Oval Acrylic Brush #12 - Z Series (Best Seller)",
      category: "Z Brushes",
      description: "Dòng cọ đắp bột bán chạy nhất cho các thợ chuyên nghiệp tại Texas và California. Form cọ đầm tay.",
      imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=400&q=80",
      wholesalePrice: 21.0,
      retailPrice: 28.0,
      currentStock: 8, // Low stock demo!
      minStockAlert: 20,
      location: "Houston Hub (Kệ A3)",
    },
    {
      sku: "Z-BRUSH-14",
      name: "Kolinsky Acrylic Brush #14 - Master Edition",
      category: "Z Brushes",
      description: "Cọ bản lớn đắp 1 cục bột (One-ball method), tiết kiệm thời gian làm bộ móng cho tiệm.",
      imageUrl: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=400&q=80",
      wholesalePrice: 24.5,
      retailPrice: 32.0,
      currentStock: 65,
      minStockAlert: 15,
      location: "Houston Hub (Kệ A4)",
    },
    {
      sku: "NIPPER-C04",
      name: "Cobalt Cuticle Nipper Jaw 14 - C04 Professional",
      category: "Kềm Cắt Da",
      description: "Kềm thép Cobalt chống gỉ, độ bén tuyệt đối, lò xo đơn êm ái, chống mỏi tay cho thợ.",
      imageUrl: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&w=400&q=80",
      wholesalePrice: 12.0,
      retailPrice: 17.5,
      currentStock: 320,
      minStockAlert: 50,
      location: "Houston Hub (Kệ B1)",
    },
    {
      sku: "NIPPER-C06",
      name: "Cobalt Cuticle Nipper Jaw 16 - C06 Full Jaw",
      category: "Kềm Cắt Da",
      description: "Lưỡi kềm nguyên hàm bén ngọt, chuôi kềm nhám chống trơn trượt khi dính nước rửa móng.",
      imageUrl: "https://images.unsplash.com/photo-1607779097040-26e80aa78e66?auto=format&fit=crop&w=400&q=80",
      wholesalePrice: 13.0,
      retailPrice: 18.5,
      currentStock: 180,
      minStockAlert: 40,
      location: "Houston Hub (Kệ B2)",
    },
    {
      sku: "PUSHER-P01",
      name: "Titanium Rainbow Cuticle Pusher & Scraper P-01",
      category: "Dụng Cụ Nail",
      description: "Cây sủi da 2 đầu mạ Titanium bảy màu sang trọng, mép bo tròn không làm trầy móng khách.",
      imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80",
      wholesalePrice: 4.5,
      retailPrice: 7.0,
      currentStock: 450,
      minStockAlert: 60,
      location: "Houston Hub (Kệ C1)",
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: p,
      create: p,
    });
  }

  // 2. Seed B2B Customers (Salons in Texas & California)
  const customers = [
    {
      businessName: "Bella Nails & Spa Lounge",
      contactPerson: "Ms. Cindy Tran",
      phone: "+18325550199",
      email: "cindy@bellanails.com",
      address: "10290 Westheimer Rd",
      city: "Houston",
      state: "TX",
      zipCode: "77042",
      tier: CustomerTier.VIP,
      status: CustomerStatus.ACTIVE,
      assignedSale: "hanna",
      notes: "Tiệm 18 thợ, chuyên đắp bột Z Brushes số 12 và số 14. Hay lấy sỉ 50 cây/lần.",
    },
    {
      businessName: "One Nail Supply Store",
      contactPerson: "Mr. Kevin Nguyen",
      phone: "+17135550123",
      email: "order@onenailsupply.com",
      address: "11360 Bellaire Blvd",
      city: "Houston",
      state: "TX",
      zipCode: "77072",
      tier: CustomerTier.WHOLESALE,
      status: CustomerStatus.ACTIVE,
      assignedSale: "johnny",
      notes: "Đại lý phân phối sỉ lớn khu Chợ Bellaire. Lấy số lượng từ 200 - 500 cây/đơn.",
    },
    {
      businessName: "Glamour Nail Bar Dallas",
      contactPerson: "Ms. Linda Pham",
      phone: "+12145550188",
      email: "linda@glamournailbar.com",
      address: "2401 Preston Rd",
      city: "Plano",
      state: "TX",
      zipCode: "75093",
      tier: CustomerTier.STANDARD,
      status: CustomerStatus.AT_RISK,
      assignedSale: "alice",
      notes: "Đang có cảnh báo sụt giảm doanh số tháng này do tháng trước gom đơn lớn.",
    },
    {
      businessName: "T&T Beauty Supply Houston",
      contactPerson: "Mr. Tommy Le",
      phone: "+17135550177",
      email: "sales@ttbeautysupply.com",
      address: "6800 Harwin Dr",
      city: "Houston",
      state: "TX",
      zipCode: "77036",
      tier: CustomerTier.WHOLESALE,
      status: CustomerStatus.ACTIVE,
      assignedSale: "hanna",
      notes: "Cần theo dõi công nợ 30 ngày.",
    },
    {
      businessName: "Luxury Nail Lounge Austin",
      contactPerson: "Ms. Jennifer Vu",
      phone: "+15125550166",
      email: "jennifer@luxurynailsaustin.com",
      address: "11501 Rock Rose Ave",
      city: "Austin",
      state: "TX",
      zipCode: "78758",
      tier: CustomerTier.VIP,
      status: CustomerStatus.ACTIVE,
      assignedSale: "hanna",
      notes: "Tiệm khu Domain Austin cao cấp. Khách rất ưng kềm C04 và cọ Z-Series.",
    },
  ];

  const createdCustomers: any[] = [];
  for (const c of customers) {
    const cust = await prisma.customer.upsert({
      where: { phone: c.phone },
      update: c,
      create: c,
    });
    createdCustomers.push(cust);
  }

  // 3. Seed Orders & Invoices (Accounts Receivable demonstration)
  const p1 = await prisma.product.findUnique({ where: { sku: "Z-BRUSH-12" } });
  const p2 = await prisma.product.findUnique({ where: { sku: "NIPPER-C04" } });

  if (createdCustomers.length >= 2 && p1 && p2) {
    // Đơn đã thanh toán đủ
    await prisma.order.upsert({
      where: { orderNumber: "ORD-2026-0881" },
      update: {},
      create: {
        orderNumber: "ORD-2026-0881",
        customerId: createdCustomers[0].id, // Bella Nails
        totalAmount: 1450.0,
        paidAmount: 1450.0,
        paymentStatus: PaymentStatus.PAID,
        dueDate: new Date(Date.now() - 25 * 86400000), // 25 days ago
        saleRep: "hanna",
        items: {
          create: [
            { productId: p1.id, quantity: 50, unitPrice: 21.0 },
            { productId: p2.id, quantity: 33, unitPrice: 12.0 },
          ],
        },
      },
    });

    // Đơn nợ quá hạn (Overdue AR)
    await prisma.order.upsert({
      where: { orderNumber: "ORD-2026-0885" },
      update: {},
      create: {
        orderNumber: "ORD-2026-0885",
        customerId: createdCustomers[1].id, // One Nail Supply
        totalAmount: 4200.0,
        paidAmount: 1000.0,
        paymentStatus: PaymentStatus.PARTIAL,
        dueDate: new Date(Date.now() - 15 * 86400000), // 15 days overdue
        saleRep: "johnny",
        items: {
          create: [
            { productId: p1.id, quantity: 150, unitPrice: 20.0 },
            { productId: p2.id, quantity: 100, unitPrice: 12.0 },
          ],
        },
      },
    });

    // Đơn nợ trong hạn (Current AR)
    await prisma.order.upsert({
      where: { orderNumber: "ORD-2026-0889" },
      update: {},
      create: {
        orderNumber: "ORD-2026-0889",
        customerId: createdCustomers[3].id, // T&T Beauty Supply
        totalAmount: 2600.0,
        paidAmount: 0.0,
        paymentStatus: PaymentStatus.UNPAID,
        dueDate: new Date(Date.now() + 10 * 86400000), // 10 days in future
        saleRep: "hanna",
        items: {
          create: [
            { productId: p1.id, quantity: 80, unitPrice: 21.0 },
            { productId: p2.id, quantity: 76, unitPrice: 12.0 },
          ],
        },
      },
    });
  }

  // 4. Seed Churn Detection Survey (Khách tháng trước mua nhiều tháng sau mua ít)
  if (createdCustomers.length >= 3) {
    await prisma.churnSurvey.create({
      data: {
        customerId: createdCustomers[2].id, // Glamour Nail Bar
        analysisMonth: "2026-10",
        dropPercent: -62.5,
        reason: DipReason.HIGH_INVENTORY_REMAINING,
        saleNotes: "Tháng 09 khách lấy 300 cây kềm để chuẩn bị sự kiện mở rộng chi nhánh nên tồn kho còn nhiều, chưa đến chu kỳ mua lại.",
        actionPlan: "Hanna sẽ gọi điện hỏi thăm tình hình sử dụng kềm và tặng kèm 5 chai dầu bảo dưỡng kềm miễn phí từ kho Houston.",
        saleRep: "alice",
        isResolved: false,
      },
    });
  }

  // 5. Seed B2B Leads AI
  const leads = [
    {
      salonName: "Milano Nail Spa Austin",
      ownerName: "David Hoang",
      phone: "+15125550143",
      city: "Austin",
      state: "TX",
      address: "10515 N Mopac Expy",
      googleReviewCount: 420,
      rating: 4.8,
      icpScore: 94,
      personalizedHook: "Tiệm 24 thợ chuyên đắp bột Ombre cao cấp, nhu cầu cọ Z Brushes số 12 và 14 cực kỳ lớn.",
      status: "NEW",
      assignedSale: "hanna",
    },
    {
      salonName: "Venetian Nails Lounge Katy",
      ownerName: "Kathy Vo",
      phone: "+12815550155",
      city: "Katy",
      state: "TX",
      address: "23501 Cinco Ranch Blvd",
      googleReviewCount: 680,
      rating: 4.9,
      icpScore: 91,
      personalizedHook: "Khu vực Katy giàu có, thợ làm móng yêu cầu kềm cắt da Cobalt sắc bén chuẩn salon cao cấp.",
      status: "CONTACTED",
      assignedSale: "hanna",
    },
    {
      salonName: "USA Nail Supply California",
      ownerName: "Andy Tran",
      phone: "+17145550199",
      city: "Garden Grove",
      state: "CA",
      address: "9820 Bolsa Ave",
      googleReviewCount: 150,
      rating: 4.6,
      icpScore: 86,
      personalizedHook: "Đại lý phân phối tại Bolsa, đang tìm kiếm nguồn hàng cọ Z-Series nhập sỉ trực tiếp từ hãng.",
      status: "NEW",
      assignedSale: "johnny",
    },
  ];

  for (const l of leads) {
    await prisma.b2BLead.upsert({
      where: { phone: l.phone },
      update: l,
      create: l,
    });
  }

  console.log(">> Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
