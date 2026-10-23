
/* =========================================
   COSPLAYHUB - SHOP COSTUME
   จัดการชุดคอสเพลย์
   ========================================= */

const costumeTable = document.querySelector(".costume-table");
const emptyState = document.querySelector(".costume-empty-state");

/* ---------- 1. อ่านข้อมูล ---------- */

function getStoredArray(key) {
    try {
        const raw = localStorage.getItem(key);
        const data = raw ? JSON.parse(raw) : [];
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("อ่านข้อมูลไม่สำเร็จ:", key, error);
        return [];
    }
}

/* ---------- 2. บันทึกข้อมูล ---------- */

function saveCostumes(costumes) {
    localStorage.setItem("cosplayHubCostumes", JSON.stringify(costumes));
}

/* ---------- 3. ป้องกัน HTML ที่ไม่ปลอดภัย ---------- */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        return entities[char];
    });
}

/* ---------- 4. แสดงข้อมูลวิก ---------- */

function getWigText(wig) {
    const labels = {
        included: "มีวิกในชุด",
        external: "วิกจากภายนอก",
        none: "ไม่มีวิก"
    };

    return labels[wig] || "ตามรายละเอียดชุด";
}

/* ---------- 5. แสดงข้อมูลพร็อพ ---------- */

function getPropText(prop) {
    const labels = {
        included: "มีพร็อพในชุด",
        customer: "ลูกค้าจัดหาเอง",
        additional: "ร้านจัดหาเพิ่มเติม",
        none: "ไม่มีพร็อพ"
    };

    return labels[prop] || "ตามรายละเอียดชุด";
}

/* ---------- 6. ตรวจสอบรายการเช่า ---------- */

function hasActiveRental(costumeId) {
    const bookings = getStoredArray("cosplayHubBookings");

    return bookings.some(function (booking) {
        return (
            String(booking.costumeId) === String(costumeId) &&
            ["confirmed", "return_requested"].includes(booking.status)
        );
    });
}

/* ---------- 7. เปลี่ยนสถานะชุด ---------- */

function toggleCostumeStatus(costumeId) {
    const costumes = getStoredArray("cosplayHubCostumes");

    const costume = costumes.find(function (item) {
        return String(item.id) === String(costumeId);
    });

    if (!costume) {
        alert("ไม่พบข้อมูลชุด กรุณาโหลดหน้าใหม่");
        return;
    }

    if (costume.status === "available") {
        if (!confirm("ต้องการเปลี่ยนสถานะชุดเป็น “ไม่ว่าง” หรือไม่?")) {
            return;
        }

        costume.status = "unavailable";
    } else {
        if (hasActiveRental(costume.id)) {
            alert("ยังเปลี่ยนเป็นว่างไม่ได้ เพราะมีรายการเช่าที่ยังดำเนินอยู่");
            return;
        }

        if (!confirm(
            "ยืนยันเปลี่ยนสถานะชุดเป็น “ว่าง” หรือไม่?\n\n" +
            "โปรดตรวจสอบตัวชุด วิก และพร็อพให้พร้อมก่อน"
        )) {
            return;
        }

        costume.status = "available";
    }

    try {
        saveCostumes(costumes);

        alert(
            costume.status === "available"
                ? "เปลี่ยนสถานะเป็นว่างเรียบร้อยแล้ว"
                : "เปลี่ยนสถานะเป็นไม่ว่างเรียบร้อยแล้ว"
        );

        renderCostumes();
    } catch (error) {
        console.error("บันทึกสถานะไม่สำเร็จ:", error);
        alert("บันทึกสถานะไม่สำเร็จ กรุณาลองใหม่");
    }
}

/* ---------- 8. ลบชุด ---------- */

function deleteCostume(costumeId) {
    const costumes = getStoredArray("cosplayHubCostumes");

    const hasHistory = getStoredArray("cosplayHubBookings").some(
        function (booking) {
            return String(booking.costumeId) === String(costumeId);
        }
    );

    if (hasHistory) {
        alert("ไม่สามารถลบชุดนี้ได้ เพราะมีประวัติการจองอยู่");
        return;
    }

    if (!confirm("ต้องการลบชุดนี้ใช่หรือไม่?")) {
        return;
    }

    try {
        saveCostumes(
            costumes.filter(function (item) {
                return String(item.id) !== String(costumeId);
            })
        );

        renderCostumes();
    } catch (error) {
        console.error("ลบชุดไม่สำเร็จ:", error);
        alert("ลบชุดไม่สำเร็จ กรุณาลองใหม่");
    }
}

/* ---------- 9. สร้างแถวชุด ---------- */

function createCostumeRow(costume) {
    const row = document.createElement("div");
    row.className = "costume-table-row costume-data-row";

    const isAvailable = costume.status === "available";

    const imageHTML = costume.image
        ? '<img src="' + escapeHTML(costume.image) +
          '" alt="' + escapeHTML(costume.name || "ชุดคอสเพลย์") + '">'
        : "";

    row.innerHTML = `
        <!-- คอลัมน์ 1: ชุดคอสเพลย์ -->
        <div class="shop-costume-name">
            ${imageHTML}
            <div>
                <strong>${escapeHTML(costume.name || "ไม่มีชื่อชุด")}</strong>
                <span>${escapeHTML(costume.description || "ไม่มีรายละเอียด")}</span>
            </div>
        </div>

        <!-- คอลัมน์ 2: ตัวชุด -->
        <div>${escapeHTML(costume.costumeSet || "-")}</div>

        <!-- คอลัมน์ 3: วิก -->
        <div>${escapeHTML(getWigText(costume.wig))}</div>

        <!-- คอลัมน์ 4: พร็อพ -->
        <div>${escapeHTML(getPropText(costume.prop))}</div>

        <!-- คอลัมน์ 5: สถานะและปุ่มเปลี่ยนสถานะ -->
        <div class="shop-status-actions">
            <span class="shop-status-badge ${
                isAvailable ? "available" : "unavailable"
            }">
                ${isAvailable ? "ว่าง" : "ไม่ว่าง"}
            </span>

            <button
                type="button"
                class="toggle-costume-status-button">
                ${isAvailable ? "ตั้งเป็นไม่ว่าง" : "ตั้งเป็นว่าง"}
            </button>
        </div>

        <!-- คอลัมน์ 6: จัดการรายการ -->
        <div class="shop-costume-actions">
            <button type="button" class="edit-costume-button">
                แก้ไข
            </button>

            <button type="button" class="delete-costume-button">
                ลบ
            </button>
        </div>
    `;

    /* ปุ่มเปลี่ยนสถานะ */
    row.querySelector(".toggle-costume-status-button")
        .addEventListener("click", function () {
            toggleCostumeStatus(costume.id);
        });

    /* ปุ่มแก้ไข */
    row.querySelector(".edit-costume-button")
        .addEventListener("click", function () {
            window.location.href =
                "shop-costume-form.html?id=" +
                encodeURIComponent(costume.id);
        });

    /* ปุ่มลบ */
    row.querySelector(".delete-costume-button")
        .addEventListener("click", function () {
            deleteCostume(costume.id);
        });

    return row;
}

/* ---------- 10. แสดงรายการชุด ---------- */

function renderCostumes() {
    if (!costumeTable || !emptyState) {
        console.error("ไม่พบ .costume-table หรือ .costume-empty-state ใน HTML");
        return;
    }

    const costumes = getStoredArray("cosplayHubCostumes");

    costumeTable.querySelectorAll(".costume-data-row").forEach(
        function (row) {
            row.remove();
        }
    );

    emptyState.style.display = costumes.length > 0 ? "none" : "";

    costumes.forEach(function (costume) {
        costumeTable.appendChild(createCostumeRow(costume));
    });
}

/* ---------- 11. เริ่มทำงาน ---------- */

renderCostumes();
