
/* =========================================================
   COSPLAYHUB - SHOP BOOKINGS
   จัดการคิวการจองของร้านค้า

   ความสามารถ:
   1. แสดงรายการจองและรายละเอียด
   2. ยืนยันหรือปฏิเสธคำขอจอง
   3. ป้องกันการจองชุดเดียวกันในวันที่ทับซ้อน
   4. เมื่อยืนยันสำเร็จ เปลี่ยนสถานะชุดเป็นไม่ว่าง
   5. รองรับการจองชุดเดิมในช่วงวันที่ไม่ทับซ้อน
   6. แสดงที่อยู่จัดส่งที่บันทึกไว้ในคำขอแต่ละรายการ
========================================================= */

const bookingTable = document.querySelector(".booking-table");
const emptyState = document.querySelector(".booking-empty-state");

const BOOKING_KEY = "cosplayHubBookings";
const COSTUME_KEY = "cosplayHubCostumes";

/* =========================================================
   1. อ่านข้อมูลจาก LocalStorage
========================================================= */

function getStoredArray(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("อ่านข้อมูลไม่สำเร็จ:", key, error);
        return [];
    }
}

let bookings = getStoredArray(BOOKING_KEY);
let costumes = getStoredArray(COSTUME_KEY);

/* =========================================================
   2. แปลงสถานะเป็นภาษาไทย
========================================================= */

function getStatusText(status) {
    switch (status) {
        case "confirmed":
            return "ยืนยันแล้ว";

        case "rejected":
            return "ปฏิเสธ";

        case "return_requested":
            return "รอตรวจสอบการคืน";

        case "returned":
            return "คืนแล้ว";

        default:
            return "รอร้านตรวจสอบ";
    }
}

/* =========================================================
   3. บันทึกข้อมูล
========================================================= */

function saveBookings(data) {
    localStorage.setItem(BOOKING_KEY, JSON.stringify(data));
}

function saveCostumes(data) {
    localStorage.setItem(COSTUME_KEY, JSON.stringify(data));
}

/* =========================================================
   4. ตรวจสอบวันที่เช่า
========================================================= */

function isValidRentalDates(booking) {
    if (!booking.rentDate || !booking.returnDate) {
        return false;
    }

    // รูปแบบวันที่ที่ระบบใช้คือ YYYY-MM-DD
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (
        !datePattern.test(booking.rentDate) ||
        !datePattern.test(booking.returnDate)
    ) {
        return false;
    }

    const start = new Date(booking.rentDate + "T00:00:00");
    const end = new Date(booking.returnDate + "T00:00:00");

    return (
        !Number.isNaN(start.getTime()) &&
        !Number.isNaN(end.getTime()) &&
        end >= start
    );
}

/* =========================================================
   5. ตรวจสอบวันทับซ้อน

   หากวันคืนของรายการหนึ่งตรงกับวันเช่าของอีกรายการ
   จะถือว่าทับซ้อน เพื่อเผื่อเวลาตรวจสอบและเตรียมชุด
========================================================= */

function hasDateOverlap(a, b) {
    return (
        a.rentDate <= b.returnDate &&
        b.rentDate <= a.returnDate
    );
}

/* =========================================================
   6. ตรวจสอบว่ามีรายการจองที่ยืนยันแล้วทับซ้อนหรือไม่
========================================================= */

function findConflictingBooking(currentBooking, allBookings) {
    return allBookings.find(item => {
        // ไม่ตรวจเทียบกับรายการปัจจุบันเอง
        if (String(item.id) === String(currentBooking.id)) {
            return false;
        }

        // ต้องเป็นชุดชิ้นเดียวกัน
        if (
            String(item.costumeId) !==
            String(currentBooking.costumeId)
        ) {
            return false;
        }

        // รายการที่ปฏิเสธหรือคืนแล้วไม่ขวางการจองใหม่
        // รายการ pending ยังรอการตัดสินใจจากร้าน
        if (
            item.status !== "confirmed" &&
            item.status !== "return_requested"
        ) {
            return false;
        }

        if (!isValidRentalDates(item)) {
            return false;
        }

        return hasDateOverlap(currentBooking, item);
    });
}

/* =========================================================
   7. ดูรายละเอียดคำขอ

   ใช้ shippingAddress ที่บันทึกไว้ในคำขอนั้นโดยตรง
   ไม่ดึงที่อยู่ล่าสุดจากโปรไฟล์ลูกค้า
========================================================= */

function showBookingDetail(booking) {
    const shippingAddress =
        typeof booking.shippingAddress === "string" &&
        booking.shippingAddress.trim()
            ? booking.shippingAddress.trim()
            : "ไม่มีที่อยู่ในคำขอนี้ (คำขอเก่าหรือยังไม่ได้ระบุ)";

    alert(
        "รายละเอียดคำขอจอง\n\n" +
        "ลูกค้า: " + (booking.customerName || "-") + "\n" +
        "อีเมล: " + (booking.customerEmail || "-") + "\n" +
        "เบอร์โทรศัพท์: " + (booking.customerPhone || "-") + "\n" +
        "ที่อยู่จัดส่ง: " + shippingAddress + "\n\n" +
        "ชุด: " + (booking.costumeName || "-") + "\n" +
        "วันเช่า: " + (booking.rentDate || "-") + "\n" +
        "วันคืน: " + (booking.returnDate || "-") + "\n\n" +
        "สถานะ: " + getStatusText(booking.status)
    );
}

/* =========================================================
   8. ยืนยันการจอง
========================================================= */

function confirmBooking(booking) {
    if (!confirm("ต้องการยืนยันคำขอจองนี้ใช่หรือไม่?")) {
        return;
    }

    // อ่านข้อมูลล่าสุดก่อนตรวจสอบ
    bookings = getStoredArray(BOOKING_KEY);
    costumes = getStoredArray(COSTUME_KEY);

    const currentBooking = bookings.find(
        item => String(item.id) === String(booking.id)
    );

    if (!currentBooking) {
        alert("ไม่พบคำขอจองนี้ กรุณารีเฟรชหน้า");
        return;
    }

    // ป้องกันการยืนยันซ้ำ
    if (currentBooking.status !== "pending") {
        alert(
            "คำขอนี้ไม่ได้อยู่ในสถานะรอร้านตรวจสอบแล้ว\n" +
            "กรุณารีเฟรชหน้าเพื่อดูสถานะล่าสุด"
        );

        location.reload();
        return;
    }

    if (
        currentBooking.costumeId === null ||
        currentBooking.costumeId === undefined ||
        currentBooking.costumeId === ""
    ) {
        alert("ไม่พบข้อมูลชุดที่เชื่อมกับคำขอนี้");
        return;
    }

    const costumeIndex = costumes.findIndex(
        item => String(item.id) === String(currentBooking.costumeId)
    );

    if (costumeIndex === -1) {
        alert("ไม่พบข้อมูลชุดที่ลูกค้าจอง");
        return;
    }

    if (!isValidRentalDates(currentBooking)) {
        alert("วันเช่าหรือวันคืนไม่ถูกต้อง กรุณาตรวจสอบวันที่");
        return;
    }

    // ตรวจสอบรายการจองอื่นของชุดเดียวกัน
    const conflict = findConflictingBooking(
        currentBooking,
        bookings
    );

    if (conflict) {
        alert(
            "ไม่สามารถยืนยันคำขอนี้ได้ เพราะวันเช่าทับซ้อน\n\n" +
            "ชุด: " + (currentBooking.costumeName || "-") + "\n" +
            "วันที่ของรายการที่ทับซ้อน: " +
            conflict.rentDate + " ถึง " + conflict.returnDate + "\n\n" +
            "กรุณาเลือกช่วงวันอื่น"
        );
        return;
    }

    /*
       สถานะชุด:
       - available: ชุดพร้อมให้เช่า
       - unavailable: ชุดถูกปิดให้เช่าหรือเคยถูกตั้งไม่ว่าง

       เนื่องจากระบบเดิมใช้สถานะเดียวกันทั้งสองกรณี
       จึงใช้ประวัติการจองประกอบการตรวจสอบ

       หากชุดไม่ว่างและไม่พบประวัติการเช่าที่เกี่ยวข้อง
       จะไม่อนุญาตให้ยืนยัน เพื่อป้องกันการเช่าชุดที่ร้านปิดไว้
    */

    const selectedCostume = costumes[costumeIndex];

    if (selectedCostume.status !== "available") {
        const hasRentalHistory = bookings.some(item =>
            String(item.costumeId) ===
                String(currentBooking.costumeId) &&
            (
                item.status === "confirmed" ||
                item.status === "return_requested" ||
                item.status === "returned"
            )
        );

        if (!hasRentalHistory) {
            alert(
                "ชุดนี้ถูกตั้งสถานะไม่ว่าง\n\n" +
                "กรุณาตรวจสอบสถานะชุดในหน้าจัดการชุดก่อนยืนยัน"
            );
            return;
        }
    }

    // เตรียมข้อมูลใหม่ก่อนบันทึก
    const updatedBookings = bookings.map(item =>
        String(item.id) === String(currentBooking.id)
            ? {
                ...item,
                status: "confirmed"
            }
            : item
    );

    const updatedCostumes = costumes.map(item =>
        String(item.id) === String(currentBooking.costumeId)
            ? {
                ...item,
                status: "unavailable"
            }
            : item
    );

    // บันทึกสถานะการจองและสถานะชุด
    try {
        saveBookings(updatedBookings);
        saveCostumes(updatedCostumes);

        // ตรวจสอบข้อมูลที่บันทึกกลับมา
        const savedBookings = getStoredArray(BOOKING_KEY);
        const savedCostumes = getStoredArray(COSTUME_KEY);

        const savedBooking = savedBookings.find(
            item => String(item.id) === String(currentBooking.id)
        );

        const savedCostume = savedCostumes.find(
            item => String(item.id) === String(currentBooking.costumeId)
        );

        if (
            !savedBooking ||
            savedBooking.status !== "confirmed" ||
            !savedCostume ||
            savedCostume.status !== "unavailable"
        ) {
            throw new Error("ตรวจสอบสถานะหลังบันทึกไม่สำเร็จ");
        }

        bookings = savedBookings;
        costumes = savedCostumes;

    } catch (error) {
        console.error("บันทึกการยืนยันไม่สำเร็จ:", error);

        alert(
            "ไม่สามารถบันทึกการยืนยันได้\n\n" +
            "กรุณาลองใหม่และตรวจสอบข้อมูลในระบบ"
        );
        return;
    }

    alert(
        "ยืนยันการจองเรียบร้อยแล้ว\n\n" +
        "ชุด: " + (currentBooking.costumeName || "-") + "\n" +
        "วันเช่า: " + currentBooking.rentDate + "\n" +
        "วันคืน: " + currentBooking.returnDate + "\n" +
        "สถานะการจอง: ยืนยันแล้ว\n" +
        "สถานะชุด: ไม่ว่าง"
    );

    location.reload();
}

/* =========================================================
   9. ปฏิเสธคำขอจอง
========================================================= */

function rejectBooking(booking) {
    if (!confirm("ต้องการปฏิเสธคำขอจองนี้ใช่หรือไม่?")) {
        return;
    }

    bookings = getStoredArray(BOOKING_KEY);

    const currentBooking = bookings.find(
        item => String(item.id) === String(booking.id)
    );

    if (!currentBooking) {
        alert("ไม่พบคำขอจองนี้");
        return;
    }

    if (currentBooking.status !== "pending") {
        alert("คำขอนี้ได้รับการดำเนินการแล้ว");
        location.reload();
        return;
    }

    const updatedBookings = bookings.map(item =>
        String(item.id) === String(currentBooking.id)
            ? {
                ...item,
                status: "rejected"
            }
            : item
    );

    try {
        saveBookings(updatedBookings);
    } catch (error) {
        console.error("บันทึกการปฏิเสธไม่สำเร็จ:", error);
        alert("บันทึกการปฏิเสธไม่สำเร็จ กรุณาลองใหม่");
        return;
    }

    alert("ปฏิเสธคำขอจองเรียบร้อยแล้ว");
    location.reload();
}

/* =========================================================
   10. สร้างแถวรายการจอง
========================================================= */

function createBookingRow(booking) {
    const row = document.createElement("div");
    row.className = "booking-table-row booking-data-row";

    [
        booking.customerName || "-",
        booking.costumeName || "-",
        booking.rentDate || "-",
        booking.returnDate || "-"
    ].forEach(value => {
        const cell = document.createElement("div");
        cell.textContent = value;
        row.appendChild(cell);
    });

    const statusCell = document.createElement("div");
    const badge = document.createElement("span");

    badge.className =
        "booking-status-badge " + (booking.status || "pending");

    badge.textContent = getStatusText(booking.status);

    statusCell.appendChild(badge);
    row.appendChild(statusCell);

    const actions = document.createElement("div");
    actions.className = "booking-actions";

    const viewButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.className = "booking-view-button";
    viewButton.textContent = "ดูรายละเอียด";

    viewButton.addEventListener("click", () => {
        showBookingDetail(booking);
    });

    actions.appendChild(viewButton);

    if (booking.status === "pending") {
        const confirmButton = document.createElement("button");

        confirmButton.type = "button";
        confirmButton.className = "booking-confirm-button";
        confirmButton.textContent = "ยืนยัน";

        confirmButton.addEventListener("click", () => {
            confirmBooking(booking);
        });

        const rejectButton = document.createElement("button");

        rejectButton.type = "button";
        rejectButton.className = "booking-reject-button";
        rejectButton.textContent = "ปฏิเสธ";

        rejectButton.addEventListener("click", () => {
            rejectBooking(booking);
        });

        actions.appendChild(confirmButton);
        actions.appendChild(rejectButton);
    }

    row.appendChild(actions);

    return row;
}

/* =========================================================
   11. แสดงรายการจอง
========================================================= */

function displayBookings() {
    if (!bookingTable || !emptyState) {
        console.error("ไม่พบพื้นที่แสดงรายการจองใน HTML");
        return;
    }

    bookingTable
        .querySelectorAll(".booking-data-row")
        .forEach(row => row.remove());

    bookings = getStoredArray(BOOKING_KEY);

    emptyState.style.display = bookings.length ? "none" : "block";

    bookings.forEach(booking => {
        bookingTable.appendChild(createBookingRow(booking));
    });
}

/* =========================================================
   12. เริ่มทำงาน
========================================================= */

displayBookings();
