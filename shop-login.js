const shopLoginForm =
    document.getElementById("shopLoginForm");

const shopLoginMessage =
    document.getElementById("shopLoginMessage");


shopLoginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email =
        document.getElementById("shopEmail").value.trim();

    const password =
        document.getElementById("shopPassword").value;


    /*
        บัญชีสำหรับเข้าสู่ระบบร้าน
    */

    const shopEmail =
        "shop@cosplayhub.com";

    const shopPassword =
        "12345678";


    if (
        email !== shopEmail ||
        password !== shopPassword
    ) {

        shopLoginMessage.textContent =
            "อีเมลหรือรหัสผ่านไม่ถูกต้อง";

        return;
    }


    /*
        บันทึกสถานะผู้ใช้ร้าน
    */

    localStorage.setItem(
        "cosplayHubShopUser",
        JSON.stringify({
            email: shopEmail,
            role: "shop"
        })
    );


    shopLoginMessage.textContent =
        "เข้าสู่ระบบสำเร็จ";


    setTimeout(function () {

        window.location.href =
            "shop-costumes.html";

    }, 500);

});