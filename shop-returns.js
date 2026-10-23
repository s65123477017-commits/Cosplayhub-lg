
/* =========================================
   COSPLAYHUB - SHOP RETURNS
   ระบบตรวจสอบและยืนยันการคืนชุด
   ========================================= */

// =========================================
// 1. ดึงข้อมูลจาก localStorage
// =========================================

function getStoredArray(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("ไม่สามารถอ่านข้อมูล:", key, error);
        return [];
    }
}

let bookings = getStoredArray("cosplayHubBookings");
let costumes = getStoredArray("cosplayHubCostumes");

const returnList = document.getElementById("returnList");

// =========================================
// 2. แปลงสถานะเป็นภาษาไทย
// =========================================

function getStatusText(status) {
    switch (status) {
        case "return_requested":
            return "รอร้านตรวจสอบการคืน";
        case "returned":
            return "คืนแล้ว";
        default:
            return "ไม่มีรายการ";
    }
}

// =========================================
// 3. แปลงค่าวิกเป็นภาษาไทย
// =========================================

function getWigText(wig) {
    const wigLabels = {
        included: "มีวิกในชุด",
        external: "วิกจากภายนอก",
        none: "ไม่มีวิก"
    };

    if (wig === null || wig === undefined || wig === "") {
        return "ตามรายละเอียดชุด";
    }

    return Object.prototype.hasOwnProperty.call(wigLabels, wig)
        ? wigLabels[wig]
        : wig;
}

// =========================================
// 4. แปลงค่าพร็อพเป็นภาษาไทย
// =========================================

function getPropText(prop) {
    const propLabels = {
        included: "มีพร็อพในชุด",
        customer: "ลูกค้าจัดหาเอง",
        additional: "ร้านจัดหาเพิ่มเติม",
        none: "ไม่มีพร็อพ"
    };

    if (prop === null || prop === undefined || prop === "") {
        return "ตามรายละเอียดชุด";
    }

    return Object.prototype.hasOwnProperty.call(propLabels, prop)
        ? propLabels[prop]
        : prop;
}

// =========================================
// 5. แปลงวันที่
// =========================================

function formatDate(dateString) {
    if (!dateString) {
        return "--/--/----";
    }

    const parts = String(dateString).split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// =========================================
// 6. บันทึกข้อมูลการจอง
// =========================================

function saveBookings() {
    localStorage.setItem(
        "cosplayHubBookings",
        JSON.stringify(bookings)
    );
}

// =========================================
// 7. ป้องกันข้อความจากข้อมูลทำให้ HTML ผิดรูปแบบ
// =========================================

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

// =========================================
// 8. ยืนยันการคืน
// เปลี่ยนสถานะการจองเท่านั้น
// ไม่เปลี่ยนสถานะชุดโดยอัตโนมัติ
// =========================================

function confirmReturn(bookingId) {
    // โหลดข้อมูลล่าสุดก่อนดำเนินการ
    bookings = getStoredArray("cosplayHubBookings");
    costumes = getStoredArray("cosplayHubCostumes");

    const bookingIndex = bookings.findIndex(
        booking => String(booking.id) === String(bookingId)
    );

    if (bookingIndex === -1) {
        alert("ไม่พบข้อมูลรายการจอง");
        return;
    }

    const booking = bookings[bookingIndex];

    if (booking.status !== "return_requested") {
        alert("รายการนี้ยังไม่อยู่ในสถานะรอตรวจสอบการคืน");
        return;
    }

    const confirmAction = confirm(
        "ยืนยันการคืนชุดหรือไม่?\n\n" +
        "กรุณาตรวจสอบตัวชุด วิก และพร็อพเรียบร้อยแล้ว"
    );

    if (!confirmAction) {
        return;
    }

    // เก็บข้อมูลเดิมไว้เผื่อการบันทึกผิดพลาด
    const previousBookings = bookings;

    // เปลี่ยนสถานะ return_requested -> returned
    bookings = bookings.map((item, index) => {
        if (index === bookingIndex) {
            return {
                ...item,
                status: "returned"
            };
        }

        return item;
    });

    try {
        saveBookings();
    } catch (error) {
        console.error("ไม่สามารถบันทึกข้อมูลการคืนได้:", error);

        bookings = previousBookings;

        alert(
            "บันทึกข้อมูลไม่สำเร็จ\n" +
            "กรุณาตรวจสอบพื้นที่จัดเก็บข้อมูลของเบราว์เซอร์"
        );

        return;
    }

    alert(
        "ยืนยันการคืนชุดเรียบร้อยแล้ว\n\n" +
        "สถานะการเช่า: คืนแล้ว\n" +
        "สถานะชุดจะคงเดิมตามข้อมูลที่ร้านกำหนด"
    );

    window.location.reload();
}

// =========================================
// 9. สร้างรายการคืน
// =========================================

function createReturnCard(booking) {
    const costume = costumes.find(
        item => String(item.id) === String(booking.costumeId)
    );

    const costumeSet = escapeHTML(
        costume?.costumeSet || "ตามรายละเอียดชุด"
    );

    const wig = escapeHTML(getWigText(costume?.wig));
    const prop = escapeHTML(getPropText(costume?.prop));

    const bookingId = escapeHTML(booking.id);
    const costumeName = escapeHTML(
        booking.costumeName || "ชุดคอสเพลย์"
    );
    const customerName = escapeHTML(
        booking.customerName || "-"
    );
    const rentDate = escapeHTML(formatDate(booking.rentDate));
    const returnDate = escapeHTML(formatDate(booking.returnDate));
    const statusText = escapeHTML(getStatusText(booking.status));

    return `
        <article class="rental-card">

            <div class="rental-card-header">
                <div>
                    <span class="rental-number">
                        รายการเช่า #${bookingId}
                    </span>
                    <h2>${costumeName}</h2>
                </div>

                <span class="rental-status pending">
                    ${statusText}
                </span>
            </div>

            <div class="rental-info">
                <div class="rental-info-item">
                    <span>ลูกค้า</span>
                    <strong>${customerName}</strong>
                </div>

                <div class="rental-info-item">
                    <span>วันเช่า</span>
                    <strong>${rentDate}</strong>
                </div>

                <div class="rental-info-item">
                    <span>วันคืน</span>
                    <strong>${returnDate}</strong>
                </div>
            </div>

            <div class="rental-items">
                <h3>รายการที่ต้องตรวจสอบ</h3>

                <div class="rental-item-row">
                    <span>ตัวชุด</span>
                    <span>${costumeSet}</span>
                </div>

                <div class="rental-item-row">
                    <span>วิก</span>
                    <span>${wig}</span>
                </div>

                <div class="rental-item-row">
                    <span>พร็อพ</span>
                    <span>${prop}</span>
                </div>
            </div>

            <div class="rental-card-footer">
                <span class="rental-note">
                    กรุณาตรวจสอบตัวชุด วิก และพร็อพก่อนยืนยันการคืน
                </span>

                <button
                    type="button"
                    class="rental-detail-button"
                    data-booking-id="${bookingId}"
                >
                    ยืนยันการคืน
                </button>
            </div>

        </article>
    `;
}

// =========================================
// 10. แสดงรายการคืน
// =========================================

function displayReturns() {
    if (!returnList) {
        console.error("ไม่พบพื้นที่แสดงรายการคืน: #returnList");
        return;
    }

    const returnBookings = bookings.filter(
        booking => booking.status === "return_requested"
    );

    if (returnBookings.length === 0) {
        returnList.innerHTML = `
            <div class="rental-card">
                <div class="rental-card-header">
                    <div>
                        <span class="rental-number">
                            ตรวจสอบการคืน
                        </span>
                        <h2>ยังไม่มีรายการรอตรวจสอบ</h2>
                    </div>
                </div>

                <div class="rental-card-footer">
                    <span class="rental-note">
                        เมื่อลูกค้าแจ้งคืนชุด รายการจะปรากฏที่หน้านี้
                    </span>
                </div>
            </div>
        `;

        return;
    }

    returnBookings.sort(
        (a, b) => Number(b.id) - Number(a.id)
    );

    returnList.innerHTML = returnBookings
        .map(booking => createReturnCard(booking))
        .join("");

    returnList.querySelectorAll("[data-booking-id]").forEach(button => {
        button.addEventListener("click", function () {
            confirmReturn(this.dataset.bookingId);
        });
    });
}

// =========================================
// 11. เริ่มแสดงข้อมูล
// =========================================

displayReturns();
