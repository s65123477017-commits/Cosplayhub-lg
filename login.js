
const form = document.getElementById("loginForm");
const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const message = document.getElementById("message");

togglePassword.addEventListener("click", () => {
    const isPassword = password.type === "password";

    password.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "ซ่อน" : "แสดง";
});

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const passwordValue = password.value;

    // ดึงข้อมูลสมาชิกที่สมัครไว้
    let customer = null;

    try {
        customer = JSON.parse(
            localStorage.getItem("cosplayHubCustomer")
        );
    } catch (error) {
        console.error("อ่านข้อมูลสมาชิกไม่สำเร็จ:", error);
    }

    if (!customer) {
        message.textContent =
            "ยังไม่มีข้อมูลสมาชิก กรุณาสมัครสมาชิกก่อน";
        return;
    }

    // ตรวจสอบอีเมลและรหัสผ่านตามระบบเดิม
    if (
        email !== customer.email ||
        passwordValue !== customer.password
    ) {
        message.textContent =
            "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
        return;
    }

    // บันทึกข้อมูลผู้ใช้ปัจจุบัน รวมถึงที่อยู่ที่บันทึกไว้แล้ว
    localStorage.setItem(
        "cosplayHubCurrentUser",
        JSON.stringify({
            fullname: customer.fullname,
            email: customer.email,
            phone: customer.phone,
            address: customer.address || ""
        })
    );

    message.textContent =
        `เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${customer.fullname}`;

    // ไปหน้าแรกเหมือนระบบเดิม
    setTimeout(() => {
        window.location.href = "home.html";
    }, 800);
});

document.getElementById("forgotPassword").addEventListener("click", (event) => {
    event.preventDefault();

    message.textContent =
        "ส่วนลืมรหัสผ่านจะเชื่อมระบบในขั้นตอนถัดไป";
});

document.getElementById("registerLink").addEventListener("click", (event) => {
    event.preventDefault();

    window.location.href = "register.html";
});
