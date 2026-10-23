
/* =========================================================
   COSPLAYHUB - SHOP BOOKINGS
   จัดการคิวการจองของร้านค้า

   ความสามารถ:
   1. แสดงรายการจองและรายละเอียด
   2. ยืนยันหรือปฏิเสธคำขอจอง
   3. ป้องกันการจองชุดเดียวกันในวันที่ทับซ้อน
   4. เมื่อยืนยันสำเร็จ เปลี่ยนสถานะชุดเป็นไม่ว่าง
   5. รองรับการจองชุดเดิมในช่วงวันที่ไม่ทับซ้อน
   6. ลบประวัติการจองที่ดำเนินการเสร็จแล้ว
      โดยไม่ลบข้อมูลชุดคอสเพลย์
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
========================================================= */

function hasDateOverlap(a, b) {
    return (
        a.rentDate <= b.returnDate &&
        b.rentDate <= a.returnDate
    );
}

/* =========================================================
   6. ตรวจสอบรายการจองที่ทับซ้อน
========================================================= */

function findConflictingBooking(currentBooking, allBookings) {
    return allBookings.find(item => {
        if (String(item.id) === String(currentBooking.id)) {
            return false;
        }

        if (
            String(item.costumeId) !==
            String(currentBooking.costumeId)
        ) {
            return false;
        }

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
========================================================= */

function showBookingDetail(booking) {
    alert(
        "รายละเอียดคำขอจอง\n\n" +
        "ลูกค้า: " + (booking.customerName || "-") + "\n" +
        "อีเมล: " + (booking.customerEmail || "-") + "\n" +
        "เบอร์โทรศัพท์: " + (booking.customerPhone || "-") + "\n\n" +
        "ชุด: " + (booking.costumeName || "-") + "\n" +
        "วันเช่า: " + (booking.rentDate || "-") + "\n" +
        "วันคืน: " + (booking.returnDate || "-") + "\n\n" +
        "สถานะ: " + getStatusText(booking.status)
    );
}

/* =========================================================
   8. ลบประวัติการจองที่ดำเนินการเสร็จแล้ว

   ลบเฉพาะข้อมูลการจอง ไม่แก้ไขข้อมูลชุดคอสเพลย์
========================================================= */

function deleteBooking(booking) {
    // อ่านข้อมูลล่าสุดก่อนลบ
    bookings = getStoredArray(BOOKING_KEY);

    const currentBooking = bookings.find(
        item => String(item.id) === String(booking.id)
    );

    if (!currentBooking) {
        alert("ไม่พบรายการจองนี้ อาจถูกลบไปแล้ว");
        location.reload();
        return;
    }

    // อนุญาตให้ลบเฉพาะรายการที่ดำเนินการเสร็จแล้ว
    const deletableStatuses = ["confirmed", "rejected", "returned"];

    if (!deletableStatuses.includes(currentBooking.status)) {
        alert("ลบได้เฉพาะรายการที่ดำเนินการเสร็จสิ้นแล้ว");
        return;
    }

    const confirmed = confirm(
        "ต้องการลบประวัติการจองนี้ใช่หรือไม่?\n\n" +
        "ลูกค้า: " + (currentBooking.customerName || "-") + "\n" +
        "ชุด: " + (currentBooking.costumeName || "-") + "\n" +
        "สถานะ: " + getStatusText(currentBooking.status) + "\n\n" +
        "ระบบจะลบเฉพาะประวัติการจอง\n" +
        "ข้อมูลชุดคอสเพลย์จะไม่ถูกลบ"
    );

    if (!confirmed) {
        return;
    }

    // ตรวจสอบข้อมูลล่าสุดอีกครั้งก่อนบันทึก
    const latestBookings = getStoredArray(BOOKING_KEY);
    const latestBooking = latestBookings.find(
        item => String(item.id) === String(currentBooking.id)
    );

    if (
        !latestBooking ||
        !deletableStatuses.includes(latestBooking.status)
    ) {
        alert("สถานะรายการเปลี่ยนแปลง กรุณาตรวจสอบรายการอีกครั้ง");
        location.reload();
        return;
    }

    const updatedBookings = latestBookings.filter(
        item => String(item.id) !== String(currentBooking.id)
    );

    try {
        saveBookings(updatedBookings);

        // ตรวจสอบว่าลบรายการออกจากประวัติแล้ว
        const savedBookings = getStoredArray(BOOKING_KEY);
        const stillExists = savedBookings.some(
            item => String(item.id) === String(currentBooking.id)
        );

        if (stillExists) {
            throw new Error("ยังพบรายการจองหลังบันทึก");
        }

        bookings = savedBookings;
    } catch (error) {
        console.error("ลบประวัติการจองไม่สำเร็จ:", error);
        alert("ลบประวัติไม่สำเร็จ กรุณาลองใหม่");
        return;
    }

    alert("ลบประวัติการจองเรียบร้อยแล้ว");
    location.reload();
}

/* =========================================================
   9. ยืนยันการจอง
========================================================= */

function confirmBooking(booking) {
    if (!confirm("ต้องการยืนยันคำขอจองนี้ใช่หรือไม่?")) {
        return;
    }

    bookings = getStoredArray(BOOKING_KEY);
    costumes = getStoredArray(COSTUME_KEY);

    const currentBooking = bookings.find(
        item => String(item.id) === String(booking.id)
    );

    if (!currentBooking) {
        alert("ไม่พบคำขอจองนี้ กรุณารีเฟรชหน้า");
        return;
    }

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

    const conflict = findConflictingBooking(currentBooking, bookings);

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

    const updatedBookings = bookings.map(item =>
        String(item.id) === String(currentBooking.id)
            ? { ...item, status: "confirmed" }
            : item
    );

    const updatedCostumes = costumes.map(item =>
        String(item.id) === String(currentBooking.costumeId)
            ? { ...item, status: "unavailable" }
            : item
    );

    try {
        saveBookings(updatedBookings);
        saveCostumes(updatedCostumes);

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
   10. ปฏิเสธคำขอจอง
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
            ? { ...item, status: "rejected" }
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
   11. สร้างแถวรายการจอง
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

    // ปุ่มดูรายละเอียด: คงการทำงานเดิม
    const viewButton = document.createElement("button");
    viewButton.type = "button";
    viewButton.className = "booking-view-button";
    viewButton.textContent = "ดูรายละเอียด";
    viewButton.addEventListener("click", () => {
        showBookingDetail(booking);
    });

    actions.appendChild(viewButton);

    // ปุ่มยืนยันและปฏิเสธ: แสดงเฉพาะรายการรอตรวจสอบ
    if (!booking.status || booking.status === "pending") {
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

    // ไอคอนถังขยะ: เฉพาะรายการที่ดำเนินการเสร็จแล้ว
    const deletableStatuses = ["confirmed", "rejected", "returned"];

    if (deletableStatuses.includes(booking.status)) {
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "booking-delete-button";
        deleteButton.textContent = "🗑️";
        deleteButton.title = "ลบประวัติการจอง";
        deleteButton.setAttribute("aria-label", "ลบประวัติการจอง");

        deleteButton.addEventListener("click", () => {
            deleteBooking(booking);
        });

        actions.appendChild(deleteButton);
    }

    row.appendChild(actions);

    return row;
}

/* =========================================================
   12. แสดงรายการจอง
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
   13. เริ่มทำงาน
========================================================= */

displayBookings();
