
/* =========================================
   COSPLAYHUB - SHOP COSTUME FORM
   เพิ่มและแก้ไขชุดคอสเพลย์
   รองรับราคาเช่าต่อวัน
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {
    const costumeForm = document.getElementById("costumeForm");

    if (!costumeForm) {
        console.error("ไม่พบฟอร์ม #costumeForm");
        return;
    }

    /* ---------- 1. อ้างอิงช่องกรอกข้อมูล ---------- */

    const nameInput = document.getElementById("costumeName");
    const descriptionInput = document.getElementById("costumeDescription");
    const costumeSetInput = document.getElementById("costumeSet");
    const wigInput = document.getElementById("wig");
    const propInput = document.getElementById("prop");
    const additionalCostInput = document.getElementById("additionalCost");
    const imageInput = document.getElementById("costumeImage");

    // ช่องราคาเช่าใหม่
    // รองรับการทำงานระหว่างที่ยังไม่ได้เพิ่มช่องใน HTML
    const rentalPriceInput = document.getElementById("rentalPrice");

    const titleElement = document.querySelector("h1");

    const STORAGE_KEY = "cosplayHubCostumes";
    const params = new URLSearchParams(window.location.search);
    const editId = params.get("id");

    let existingCostume = null;

    /* ---------- 2. อ่านข้อมูลชุดจาก localStorage ---------- */

    function getCostumes() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            const data = raw ? JSON.parse(raw) : [];

            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("อ่านข้อมูลชุดไม่สำเร็จ:", error);
            return [];
        }
    }

    /* ---------- 3. เตรียมข้อมูลสำหรับแก้ไข ---------- */

    const costumes = getCostumes();

    if (editId !== null) {
        existingCostume = costumes.find(function (item) {
            return String(item.id) === String(editId);
        });

        if (!existingCostume) {
            alert("ไม่พบข้อมูลชุดที่ต้องการแก้ไข");
            window.location.href = "shop-costumes.html";
            return;
        }

        nameInput.value = existingCostume.name || "";
        descriptionInput.value = existingCostume.description || "";
        costumeSetInput.value = existingCostume.costumeSet || "";
        wigInput.value = existingCostume.wig || "none";
        propInput.value = existingCostume.prop || "none";
        additionalCostInput.value = existingCostume.additionalCost ?? "";

        // โหลดราคาเดิม หากเป็นข้อมูลเก่าที่ยังไม่มีราคาให้เว้นว่าง
        if (rentalPriceInput) {
            rentalPriceInput.value =
                existingCostume.rentalPrice ?? "";
        }

        if (titleElement) {
            titleElement.textContent = "แก้ไขชุดคอสเพลย์";
        }
    }

    /* ---------- 4. อ่านรูปภาพที่เลือก ---------- */

    function readImage(file) {
        return new Promise(function (resolve, reject) {
            if (!file) {
                resolve(existingCostume?.image || "");
                return;
            }

            if (!file.type.startsWith("image/")) {
                reject(new Error("กรุณาเลือกไฟล์รูปภาพ"));
                return;
            }

            const reader = new FileReader();

            reader.onload = function () {
                resolve(reader.result);
            };

            reader.onerror = function () {
                reject(new Error("อ่านรูปภาพไม่สำเร็จ"));
            };

            reader.readAsDataURL(file);
        });
    }

    /* ---------- 5. บันทึกข้อมูลชุด ---------- */

    costumeForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = nameInput.value.trim();

        if (!name) {
            alert("กรุณากรอกชื่อตัวละครหรือชื่อชุด");
            nameInput.focus();
            return;
        }

        /* ตรวจสอบราคาเช่า */

        let rentalPrice = null;

        if (rentalPriceInput) {
            const priceText = rentalPriceInput.value.trim();

            if (priceText === "") {
                alert("กรุณากรอกราคาเช่าชุดต่อวัน");
                rentalPriceInput.focus();
                return;
            }

            rentalPrice = Number(priceText);

            if (
                !Number.isFinite(rentalPrice) ||
                rentalPrice < 0
            ) {
                alert("กรุณากรอกราคาเช่าเป็นตัวเลขตั้งแต่ 0 บาทขึ้นไป");
                rentalPriceInput.focus();
                return;
            }
        }

        const currentCostumes = getCostumes();

        /* ตรวจสอบว่าชุดที่กำลังแก้ไขยังอยู่ในระบบ */

        if (
            editId !== null &&
            !currentCostumes.some(function (item) {
                return String(item.id) === String(editId);
            })
        ) {
            alert("ไม่พบข้อมูลชุด กรุณากลับไปตรวจสอบรายการชุด");
            return;
        }

        try {
            const image = await readImage(
                imageInput.files && imageInput.files[0]
            );

            const previousCostume = editId !== null
                ? currentCostumes.find(function (item) {
                    return String(item.id) === String(editId);
                })
                : null;

            const costumeData = {
                id: previousCostume
                    ? previousCostume.id
                    : String(Date.now()),

                name: name,
                description: descriptionInput.value.trim(),
                costumeSet: costumeSetInput.value.trim(),
                wig: wigInput.value,
                prop: propInput.value,

                // ราคาเช่าต่อวัน แยกจากค่าใช้จ่ายเพิ่มเติม
                ...(rentalPriceInput
                    ? { rentalPrice: rentalPrice }
                    : {}),

                // คงฟิลด์เดิมไว้เพื่อรองรับข้อมูลเก่า
                additionalCost: additionalCostInput.value.trim(),

                // ชุดใหม่เริ่มต้นเป็นว่าง
                // ชุดเดิมคงสถานะเดิมไว้
                status: previousCostume
                    ? previousCostume.status
                    : "available",

                image: image
            };

            let updatedCostumes;

            if (previousCostume) {
                updatedCostumes = currentCostumes.map(function (item) {
                    return String(item.id) === String(editId)
                        ? { ...item, ...costumeData }
                        : item;
                });
            } else {
                updatedCostumes = [
                    ...currentCostumes,
                    costumeData
                ];
            }

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(updatedCostumes)
            );

            alert(
                previousCostume
                    ? "แก้ไขข้อมูลชุดเรียบร้อยแล้ว"
                    : "เพิ่มชุดคอสเพลย์เรียบร้อยแล้ว"
            );

            window.location.href = "shop-costumes.html";

        } catch (error) {
            console.error("บันทึกชุดไม่สำเร็จ:", error);

            alert(
                error.message ||
                "บันทึกข้อมูลไม่สำเร็จ กรุณาตรวจสอบข้อมูลและลองใหม่"
            );
        }
    });
});
