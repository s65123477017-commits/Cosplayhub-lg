
/* =========================================
   COSPLAYHUB - ADMIN LOGIN
   ตรวจสอบการเข้าสู่ระบบผู้ดูแล
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const adminLoginForm = document.getElementById("adminLoginForm");
    const adminLoginMessage = document.getElementById("adminLoginMessage");

    // ตรวจสอบว่าแบบฟอร์มเข้าสู่ระบบมีอยู่จริง
    if (!adminLoginForm) {
        console.error("ไม่พบแบบฟอร์ม adminLoginForm");
        return;
    }

    // ตรวจสอบว่ามีพื้นที่แสดงข้อความหรือไม่
    if (!adminLoginMessage) {
        console.error("ไม่พบพื้นที่ adminLoginMessage");
        return;
    }

    // รับข้อมูลเมื่อผู้ใช้กดเข้าสู่ระบบ
    adminLoginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const emailInput = document.getElementById("adminEmail");
        const passwordInput = document.getElementById("adminPassword");

        if (!emailInput || !passwordInput) {
            adminLoginMessage.textContent =
                "ไม่พบช่องกรอกอีเมลหรือรหัสผ่าน";
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // บัญชี Admin สำหรับทดสอบระบบ
        const adminEmail = "admin@cosplayhub.com";
        const adminPassword = "12345678";

        // ตรวจสอบอีเมลและรหัสผ่าน
        if (email !== adminEmail || password !== adminPassword) {
            adminLoginMessage.textContent =
                "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
            return;
        }

        // บันทึกสถานะ Admin
        try {
            localStorage.setItem(
                "cosplayHubAdminUser",
                JSON.stringify({
                    email: adminEmail,
                    role: "admin"
                })
            );

            // ตรวจสอบว่าบันทึกข้อมูลสำเร็จ
            const savedAdmin = localStorage.getItem("cosplayHubAdminUser");

            if (!savedAdmin) {
                throw new Error("ไม่พบข้อมูล Admin หลังบันทึก");
            }

            const parsedAdmin = JSON.parse(savedAdmin);

            if (
                parsedAdmin.email !== adminEmail ||
                parsedAdmin.role !== "admin"
            ) {
                throw new Error("ข้อมูล Admin ที่บันทึกไม่ถูกต้อง");
            }
        } catch (error) {
            console.error("บันทึกสถานะ Admin ไม่สำเร็จ:", error);
            adminLoginMessage.textContent =
                "ไม่สามารถบันทึกข้อมูลเข้าสู่ระบบได้";
            return;
        }

        // เข้าหน้าหลัก Admin
        adminLoginMessage.textContent = "เข้าสู่ระบบสำเร็จ";
        window.location.href = "admin.html";
    });
});
