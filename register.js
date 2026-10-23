const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const fullname =
        document.getElementById("fullname").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;

    const terms =
        document.getElementById("terms").checked;

    if (password !== confirmPassword) {
        alert("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
        return;
    }

    if (!terms) {
        alert("กรุณายอมรับข้อกำหนดและเงื่อนไขก่อนสมัครสมาชิก");
        return;
    }

    const customer = {
        fullname: fullname,
        email: email,
        phone: phone,
        password: password
    };

    localStorage.setItem(
        "cosplayHubCustomer",
        JSON.stringify(customer)
    );

    alert("สมัครสมาชิกสำเร็จ");

    window.location.href = "index.html";
});