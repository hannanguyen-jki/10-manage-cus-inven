import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";
import path from "path";
import fs from "fs";
import mammoth from "mammoth";

interface ParsedProduct {
  id?: string;
  sku: string;
  name: string;
  category: string;
  wholesalePrice: number;
  retailPrice: number | null;
  currentStock: number;
  minStockAlert: number;
  location: string;
  description: string | null;
  imageUrl: string | null;
}

// Clean and extract price numbers from strings like "$18.50", " 25,000 ", "15.00"
function parsePrice(text: string): number | null {
  if (!text) return null;
  // Remove currency symbols, commas, spaces
  const cleaned = text.replace(/[^0-9.]/g, "");
  const val = parseFloat(cleaned);
  return isNaN(val) ? null : val;
}

// Guess category based on product name
function guessCategory(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("brush") || lower.includes("cọ") || lower.includes("kolinsky") || lower.includes("ombre") || lower.includes("z brush")) {
    return "Acrylic Brushes";
  }
  if (lower.includes("kềm") || lower.includes("nipper") || lower.includes("cắt da") || lower.includes("cắt móng")) {
    return "Nail Nippers & Tools";
  }
  if (lower.includes("dũa") || lower.includes("file") || lower.includes("buffer") || lower.includes("đầu mài") || lower.includes("drill") || lower.includes("tool")) {
    return "Nail Nippers & Tools";
  }
  if (lower.includes("gel") || lower.includes("lacquer") || lower.includes("polish") || lower.includes("bột") || lower.includes("dip")) {
    return "Gel & Lacquer";
  }
  if (lower.includes("acrylic") || lower.includes("liquid") || lower.includes("phụ liệu") || lower.includes("supply") || lower.includes("accessory")) {
    return "Accessories & Supplies";
  }
  return "Acrylic Brushes";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Please select a Microsoft Word (.docx) file" },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".docx")) {
      return NextResponse.json(
        { success: false, error: "Only Microsoft Word (.docx) documents are supported" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Load docx via JSZip
    const zip = await JSZip.loadAsync(buffer);

    // Prepare upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
    try {
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
    } catch (dirErr) {
      console.warn("Could not create public upload directory, will fallback to data URI:", dirErr);
    }

    // 2. Parse relationship mappings: rId -> target media path
    const relsFile = zip.file("word/_rels/document.xml.rels");
    const rIdToMediaPath: Record<string, string> = {};
    if (relsFile) {
      const relsXml = await relsFile.async("string");
      const relRegex = /<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"[^>]*\/?>/gi;
      let match;
      while ((match = relRegex.exec(relsXml)) !== null) {
        const id = match[1];
        const target = match[2];
        // Target can be "media/image1.png" or "word/media/image1.png"
        rIdToMediaPath[id] = target.replace(/^word\//, "");
      }
    }

    // 3. Extract all images in word/media/
    const mediaPathToUrl: Record<string, string> = {};
    const extractedImages: string[] = [];

    const mediaFiles = Object.keys(zip.files).filter(
      (name) => name.startsWith("word/media/") && !zip.files[name].dir
    );

    for (const fullPath of mediaFiles) {
      try {
        const zipEntry = zip.file(fullPath);
        if (!zipEntry) continue;

        const imgBuffer = await zipEntry.async("nodebuffer");
        const baseName = path.basename(fullPath);
        const ext = path.extname(baseName).toLowerCase() || ".png";
        const mimeType =
          ext === ".jpg" || ext === ".jpeg"
            ? "image/jpeg"
            : ext === ".webp"
            ? "image/webp"
            : "image/png";
        const uniqueName = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${baseName}`;

        let finalUrl = "";
        try {
          const diskPath = path.join(uploadDir, uniqueName);
          fs.writeFileSync(diskPath, imgBuffer);
          finalUrl = `/uploads/products/${uniqueName}`;
        } catch (writeErr) {
          // Fallback to base64 data URI
          finalUrl = `data:${mimeType};base64,${imgBuffer.toString("base64")}`;
        }

        const relativeMediaPath = fullPath.replace(/^word\//, "");
        mediaPathToUrl[relativeMediaPath] = finalUrl;
        mediaPathToUrl[baseName] = finalUrl;
        extractedImages.push(finalUrl);
      } catch (imgErr) {
        console.error(`Error extracting image ${fullPath}:`, imgErr);
      }
    }

    // Map rId -> image URL
    const rIdToUrl: Record<string, string> = {};
    for (const [rId, target] of Object.entries(rIdToMediaPath)) {
      if (mediaPathToUrl[target]) {
        rIdToUrl[rId] = mediaPathToUrl[target];
      } else {
        const baseTarget = path.basename(target);
        if (mediaPathToUrl[baseTarget]) {
          rIdToUrl[rId] = mediaPathToUrl[baseTarget];
        }
      }
    }

    // 4. Parse Tables and Rows from word/document.xml
    const docXmlFile = zip.file("word/document.xml");
    const products: ParsedProduct[] = [];

    if (docXmlFile) {
      const docXml = await docXmlFile.async("string");

      // Extract all tables: <w:tbl>...</w:tbl>
      const tableRegex = /<w:tbl[\s\S]*?<\/w:tbl>/gi;
      let tblMatch;

      while ((tblMatch = tableRegex.exec(docXml)) !== null) {
        const tblXml = tblMatch[0];

        // Extract rows: <w:tr>...</w:tr>
        const trRegex = /<w:tr[\s\S]*?<\/w:tr>/gi;
        let trMatch;
        const rows: Array<{
          cells: Array<{ text: string; images: string[] }>;
        }> = [];

        while ((trMatch = trRegex.exec(tblXml)) !== null) {
          const trXml = trMatch[0];
          // Extract cells: <w:tc>...</w:tc>
          const tcRegex = /<w:tc[\s\S]*?<\/w:tc>/gi;
          let tcMatch;
          const cells: Array<{ text: string; images: string[] }> = [];

          while ((tcMatch = tcRegex.exec(trXml)) !== null) {
            const tcXml = tcMatch[0];

            // Extract text from <w:t> tags specifically (avoid matching <w:tc>)
            const tRegex = /<w:t(?:\s+[^>]*)?>([\s\S]*?)<\/w:t>/gi;
            let tMatch;
            const textParts: string[] = [];
            while ((tMatch = tRegex.exec(tcXml)) !== null) {
              textParts.push(tMatch[1]);
            }
            const cellText = textParts.join(" ").replace(/\s+/g, " ").trim();

            // Extract images from this cell
            const cellImages: string[] = [];
            // Check a:blip r:embed="rIdX"
            const blipRegex = /r:embed="([^"]+)"/gi;
            let blipMatch;
            while ((blipMatch = blipRegex.exec(tcXml)) !== null) {
              const rId = blipMatch[1];
              if (rIdToUrl[rId] && !cellImages.includes(rIdToUrl[rId])) {
                cellImages.push(rIdToUrl[rId]);
              }
            }
            // Check v:imagedata r:id="rIdX"
            const vImageRegex = /r:id="([^"]+)"/gi;
            let vMatch;
            while ((vMatch = vImageRegex.exec(tcXml)) !== null) {
              const rId = vMatch[1];
              if (rIdToUrl[rId] && !cellImages.includes(rIdToUrl[rId])) {
                cellImages.push(rIdToUrl[rId]);
              }
            }

            cells.push({ text: cellText, images: cellImages });
          }

          if (cells.length > 0) {
            rows.push({ cells });
          }
        }

        if (rows.length === 0) continue;

        // Determine column mapping by inspecting the first row for headers
        let headerRowIdx = -1;
        let colMapping = {
          sku: -1,
          name: -1,
          image: -1,
          wholesalePrice: -1,
          retailPrice: -1,
          category: -1,
          description: -1,
          stock: -1,
          location: -1,
        };

        for (let r = 0; r < Math.min(3, rows.length); r++) {
          const rCells = rows[r].cells.map((c) => c.text.toLowerCase());
          let matched = 0;

          rCells.forEach((text, idx) => {
            if (/mã|sku|code|item/i.test(text)) {
              colMapping.sku = idx;
              matched++;
            } else if (/ảnh|hình|photo|image|pic/i.test(text)) {
              colMapping.image = idx;
              matched++;
            } else if (/tên|name|sản phẩm|product/i.test(text)) {
              colMapping.name = idx;
              matched++;
            } else if (/giá sỉ|wholesale|ws|giá buôn|cost/i.test(text)) {
              colMapping.wholesalePrice = idx;
              matched++;
            } else if (/giá lẻ|retail|msrp|giá bán/i.test(text)) {
              colMapping.retailPrice = idx;
              matched++;
            } else if (/giá|price/i.test(text)) {
              if (colMapping.wholesalePrice === -1) {
                colMapping.wholesalePrice = idx;
                matched++;
              }
            } else if (/loại|category|danh mục|nhóm/i.test(text)) {
              colMapping.category = idx;
              matched++;
            } else if (/mô tả|desc|description|ghi chú|details/i.test(text)) {
              colMapping.description = idx;
              matched++;
            } else if (/tồn|stock|qty|số lượng/i.test(text)) {
              colMapping.stock = idx;
              matched++;
            }
          });

          if (
            matched >= 2 ||
            (colMapping.name !== -1 && (colMapping.wholesalePrice !== -1 || colMapping.sku !== -1))
          ) {
            headerRowIdx = r;
            break;
          }
        }

        // Parse data rows
        const startRow = headerRowIdx >= 0 ? headerRowIdx + 1 : 0;

        for (let r = startRow; r < rows.length; r++) {
          const cells = rows[r].cells;
          if (cells.length === 0) continue;

          // Find row images
          const rowImages: string[] = [];
          cells.forEach((c) => {
            c.images.forEach((img) => {
              if (!rowImages.includes(img)) rowImages.push(img);
            });
          });

          let sku = "";
          let name = "";
          let category = "";
          let wholesalePrice: number | null = null;
          let retailPrice: number | null = null;
          let description = "";
          let currentStock = 0;
          let location = "Houston Hub";
          let imageUrl: string | null = rowImages[0] || null;

          if (headerRowIdx >= 0) {
            // Use header mapping
            if (colMapping.sku >= 0 && cells[colMapping.sku]) {
              sku = cells[colMapping.sku].text;
            }
            if (colMapping.name >= 0 && cells[colMapping.name]) {
              name = cells[colMapping.name].text;
            }
            if (colMapping.image >= 0 && cells[colMapping.image]) {
              if (cells[colMapping.image].images.length > 0) {
                imageUrl = cells[colMapping.image].images[0];
              }
            }
            if (colMapping.wholesalePrice >= 0 && cells[colMapping.wholesalePrice]) {
              wholesalePrice = parsePrice(cells[colMapping.wholesalePrice].text);
            }
            if (colMapping.retailPrice >= 0 && cells[colMapping.retailPrice]) {
              retailPrice = parsePrice(cells[colMapping.retailPrice].text);
            }
            if (colMapping.category >= 0 && cells[colMapping.category]) {
              category = cells[colMapping.category].text;
            }
            if (colMapping.description >= 0 && cells[colMapping.description]) {
              description = cells[colMapping.description].text;
            }
            if (colMapping.stock >= 0 && cells[colMapping.stock]) {
              const stockVal = parseInt(cells[colMapping.stock].text.replace(/\D/g, ""), 10);
              if (!isNaN(stockVal)) currentStock = stockVal;
            }
          }

          // Heuristic fallback if columns not matched
          if (!name || wholesalePrice === null) {
            for (let ci = 0; ci < cells.length; ci++) {
              const cell = cells[ci];
              const price = parsePrice(cell.text);

              // If has image and imageUrl not set
              if (!imageUrl && cell.images.length > 0) {
                imageUrl = cell.images[0];
              }

              // Check if cell is pure price
              if (
                (price !== null &&
                  cell.text.replace(/[^0-9.]/g, "").length === cell.text.trim().length) ||
                cell.text.includes("$")
              ) {
                if (wholesalePrice === null) {
                  wholesalePrice = price;
                } else if (retailPrice === null) {
                  retailPrice = price;
                }
                continue;
              }

              // Check if SKU like (short, uppercase/numbers, no spaces)
              if (!sku && /^[A-Z0-9_\-#.]{2,15}$/i.test(cell.text.trim()) && cell.text.length < 15) {
                sku = cell.text.trim().toUpperCase();
                continue;
              }

              // Name candidate (longer text)
              if (!name && cell.text.length > 2) {
                name = cell.text.trim();
                continue;
              }

              // Description candidate
              if (cell.text.length > 10 && !description) {
                description = cell.text.trim();
              }
            }
          }

          // If still no name or sku, skip empty rows
          if (!name && !sku && cells.every((c) => !c.text && c.images.length === 0)) {
            continue;
          }

          // Fill default SKU if missing
          const rowIndex = products.length + 1;
          if (!sku) {
            sku = `JKI-${Date.now().toString().slice(-4)}-${String(rowIndex).padStart(3, "0")}`;
          }

          if (!name) {
            name = `Product ${sku}`;
          }

          if (!category) {
            category = guessCategory(name);
          }

          if (wholesalePrice === null) {
            wholesalePrice = 0;
          }

          // If retail price not specified, suggest 1.35x wholesale
          if (retailPrice === null && wholesalePrice > 0) {
            retailPrice = Math.round(wholesalePrice * 1.35 * 100) / 100;
          }

          products.push({
            sku: sku.trim().toUpperCase(),
            name: name.trim(),
            category: category.trim(),
            wholesalePrice,
            retailPrice,
            currentStock,
            minStockAlert: 10,
            location: location || "Houston Hub",
            description: description ? description.trim() : null,
            imageUrl,
          });
        }
      }
    }

    // 5. Fallback with Mammoth if no products found in tables
    if (products.length === 0) {
      try {
        const mammothResult = await mammoth.extractRawText({ buffer });
        const rawText = mammothResult.value;
        const lines = rawText
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.length > 0);

        let imgIdx = 0;
        lines.forEach((line, idx) => {
          const price = parsePrice(line);
          if (line.length > 3) {
            const sku = `JKI-${Date.now().toString().slice(-4)}-${String(idx + 1).padStart(3, "0")}`;
            const matchedImage = extractedImages[imgIdx] || null;
            if (matchedImage) imgIdx++;

            products.push({
              sku,
              name: line.slice(0, 80),
              category: guessCategory(line),
              wholesalePrice: price || 0,
              retailPrice: price ? Math.round(price * 1.35 * 100) / 100 : null,
              currentStock: 10,
              minStockAlert: 10,
              location: "Houston Hub",
              description: line.length > 80 ? line : null,
              imageUrl: matchedImage,
            });
          }
        });
      } catch (mammothErr) {
        console.warn("Mammoth fallback failed:", mammothErr);
      }
    }

    return NextResponse.json({
      success: true,
      filename: file.name,
      totalFound: products.length,
      extractedImagesCount: extractedImages.length,
      extractedImages,
      products,
    });
  } catch (error: any) {
    console.error("Error processing docx import:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Error processing Word document" },
      { status: 500 }
    );
  }
}
