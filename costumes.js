
/* =========================================
   CosplayHub - Costume List
   ไฟล์: js/costumes.js
   หน้าที่:
   1. แสดงรายการชุดคอสเพลย์
   2. แสดงสถานะของชุดตามข้อมูลร้าน
   3. ค้นหาชุดจากชื่อและรายละเอียด
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const costumeList = document.querySelector(".costume-list");
    const searchInput = document.getElementById("costumeSearch");

    const COSTUME_STORAGE_KEY = "cosplayHubCostumes";

    // อ่านข้อมูลชุดจาก LocalStorage
    function getCostumes() {
        try {
            const savedCostumes = localStorage.getItem(COSTUME_STORAGE_KEY);
            const costumes = savedCostumes ? JSON.parse(savedCostumes) : [];

            return Array.isArray(costumes) ? costumes : [];
        } catch (error) {
            console.error("ไม่สามารถอ่านข้อมูลชุดคอสเพลย์ได้:", error);
            return [];
        }
    }

    // แปลงข้อมูลให้เป็นข้อความที่ปลอดภัยสำหรับแสดงใน HTML
    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, function (character) {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];
        });
    }

    // แสดงรายการชุดคอสเพลย์
    function displayCostumes(costumeData) {
        if (!costumeList) {
            console.warn("ไม่พบ element .costume-list ในหน้านี้");
            return;
        }

        costumeList.innerHTML = "";

        if (!costumeData.length) {
            costumeList.innerHTML = `
                <div class="costume-empty-state">
                    <p>ไม่พบชุดคอสเพลย์ที่ค้นหา</p>
                </div>
            `;
            return;
        }

        costumeData.forEach(function (costume) {
            // สถานะนี้มาจากข้อมูลชุดที่ร้านบันทึกไว้
            const isAvailable = costume.status === "available";

            const statusText = isAvailable ? "ว่าง" : "ไม่ว่าง";
            const statusClass = isAvailable ? "available" : "unavailable";
            const metaText = isAvailable ? "ชุดพร้อมให้เช่า" : "ชุดยังไม่พร้อมให้เช่า";

            const name = escapeHTML(costume.name || "ไม่ระบุชื่อชุด");
            const description = escapeHTML(
                costume.description || "ไม่มีรายละเอียดชุด"
            );

            // รองรับชื่อฟิลด์รูปภาพที่อาจใช้ในข้อมูลชุด
            const imagePath =
                costume.image ||
                costume.imageUrl ||
                costume.imageURL ||
                "";

            const safeImagePath = escapeHTML(imagePath);

            const costumeId = encodeURIComponent(String(costume.id ?? ""));

            const card = document.createElement("div");
            card.className = "costume-card";

            card.innerHTML = `
                <div class="costume-image">
                    ${
                        safeImagePath
                            ? `<img src="${safeImagePath}" alt="${name}" loading="lazy">`
                            : `<div class="costume-image-placeholder">ไม่มีรูปภาพ</div>`
                    }
                    <span class="costume-status ${statusClass}">
                        ${statusText}
                    </span>
                </div>

                <div class="costume-info">
                    <h3 class="costume-name">${name}</h3>
                    <p class="costume-description">${description}</p>
                    <p class="costume-meta">${metaText}</p>

                    <a class="costume-detail-button"
                       href="costume-detail.html?id=${costumeId}">
                        ดูรายละเอียด
                    </a>
                </div>
            `;

            costumeList.appendChild(card);
        });
    }

    // ค้นหาจากชื่อชุดและรายละเอียด
    function searchCostumes() {
        const keyword = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const costumes = getCostumes();

        const filteredCostumes = costumes.filter(function (costume) {
            const name = String(costume.name || "").toLowerCase();
            const description = String(costume.description || "").toLowerCase();

            return name.includes(keyword) || description.includes(keyword);
        });

        displayCostumes(filteredCostumes);
    }

    // เริ่มต้นแสดงชุดทั้งหมด
    if (searchInput) {
        searchInput.addEventListener("input", searchCostumes);
    }

    displayCostumes(getCostumes());
});
