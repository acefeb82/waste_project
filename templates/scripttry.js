let model; // สำหรับเก็บโมเดล
let wasteInfo; // สำหรับเก็บข้อมูล waste_info

// ฟังก์ชันโหลดโมเดลที่เซฟไว้
async function loadModel() {
    // โมเดลในฝั่งเซิร์ฟเวอร์จะถูกโหลดจาก FastAPI
    console.log("Model loaded successfully (loaded from server)");
}

// เรียกฟังก์ชันโหลดโมเดลเมื่อหน้าเว็บโหลด
window.onload = async () => {
    await loadModel();
    wasteInfo = await fetchWasteInfo(); // โหลด waste_info เมื่อหน้าเว็บโหลด
};

// ฟังก์ชันเพื่อส่งภาพไปยังเซิร์ฟเวอร์
async function predictImage(imageDataUrl) {
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append('file', blob, 'image.png'); // เปลี่ยนชื่อไฟล์ตามต้องการ

    const result = await fetch('/predict/', {
        method: 'POST',
        body: formData,
    });

    if (result.ok) {
        const prediction = await result.json();
        console.log(prediction);  // พิมพ์ผลลัพธ์จาก API ลงในคอนโซลเพื่อเช็คข้อมูล
        return prediction;
    } else {
        console.error('Error predicting image:', result.statusText);
        return null;
    }
}

// เปลี่ยนไปที่หน้า "home"
document.getElementById('goFindItBtn').addEventListener('click', function () {
    document.getElementById('onboarding').style.display = 'flex';
    // ซ่อนหน้า home2 ก่อน
    document.getElementById('home2').style.display = 'none';
    // เปลี่ยนสีปุ่มให้เลือกปุ่มถ่ายภาพ
    document.getElementById('takePhoto').classList.add('selected');
    document.getElementById('uploadPhoto').classList.remove('selected');
    // แสดงโซนที่ถ่ายภาพ
    document.getElementById('home').style.display = 'grid'; // Show home (take photo) by default
    // เลื่อนหน้าไปยังตำแหน่งของส่วนถ่ายภาพ
    document.getElementById('appzone').scrollIntoView({ behavior: 'smooth' });
});


// เปลี่ยนสีปุ่มตามที่เลือกในหน้า "home"
document.getElementById('takePhoto').addEventListener('click', function () {
    document.getElementById('home').style.display = 'grid';
    document.getElementById('home2').style.display = 'none';
    // เปลี่ยนสีปุ่มให้เลือกปุ่มถ่ายภาพ
    document.getElementById('takePhoto').classList.add('selected');
    document.getElementById('uploadPhoto').classList.remove('selected');
});

document.getElementById('uploadPhoto').addEventListener('click', function () {
    document.getElementById('home').style.display = 'none';
    document.getElementById('home2').style.display = 'grid'; // แสดงหน้าอัพโหลดรูปภาพ
    // เปลี่ยนสีปุ่มให้เลือกปุ่มอัพโหลดภาพ
    document.getElementById('uploadPhoto').classList.add('selected');
    document.getElementById('takePhoto').classList.remove('selected');
});

// เพิ่มการทำงานสำหรับปุ่ม takePhoto2 เพื่อกลับไปที่หน้า "ถ่ายภาพ"
document.getElementById('takePhoto2').addEventListener('click', function () {
    document.getElementById('home2').style.display = 'none';
    document.getElementById('home').style.display = 'grid'; // แสดงหน้าถ่ายภาพ
    // เปลี่ยนสีปุ่มให้เลือกปุ่มถ่ายภาพ
    document.getElementById('takePhoto').classList.add('selected');
    document.getElementById('uploadPhoto').classList.remove('selected');
});

// รับ modal
const modal = document.getElementById("howToModal");
const btn = document.getElementById("how-to-btn");
const span = document.getElementsByClassName("close")[0];

// เมื่อคลิกปุ่ม "วิธีการใช้งาน" ให้เปิด modal
btn.addEventListener('click', () => {
    modal.style.display = "block";
});

// เมื่อคลิกปุ่มปิด (x) ให้ปิด modal
span.addEventListener('click', () => {
    modal.style.display = "none";
});

// เมื่อคลิกนอก modal ก็ปิด modal ได้เช่นกัน
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});

// ฟังก์ชันถ่ายภาพ
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const capturedImg = document.getElementById('captured-img');
const clearBtn = document.getElementById('clear-btn'); // ปุ่ม X สำหรับลบภาพที่จับภาพแล้ว

// เปิดกล้อง
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        video.style.display = 'block';
        video.style.transform = 'scaleX(-1)'; // กลับภาพแบบ Horizontal (mirror)
    })
    .catch(error => {
        console.error('Error accessing camera:', error);
    });

captureBtn.addEventListener('click', async () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');

    // กลับภาพแบบ Horizontal (mirror)
    context.translate(canvas.width, 0); // สลับภาพซ้ายขวา
    context.scale(-1, 1); // ทำการ mirror ภาพ
    context.drawImage(video, 0, 0, canvas.width, canvas.height); // วาดภาพที่ถูก flip ลงบน canvas

    const imageDataUrl = canvas.toDataURL('image/png');

    // แสดงภาพที่ถ่าย
    capturedImg.src = imageDataUrl;
    capturedImg.style.display = 'block';

    video.style.display = 'none'; // ซ่อนวิดีโอหลังถ่ายภาพ

    // แสดงปุ่ม (X)
    clearBtn.style.display = 'block';

    // ส่งภาพไปยัง API เพื่อทำนาย
    const prediction = await predictImage(imageDataUrl);
    if (prediction) {

        // แสดงผลการทำนาย
        document.getElementById('result').textContent = ` ${prediction.predicted_class} (ความมั่นใจ: ${prediction.confidence})`;
        document.getElementById('bin_color').textContent = `ทิ้งลงถังขยะ${prediction.bin_color}`;
        document.getElementById('disposal_method').textContent = `${prediction.disposal_method.trim()}`;

        // ทำให้ผลลัพธ์แสดงผล
        document.getElementById('result').style.display = 'block';
        document.getElementById('bin_color').style.display = 'block';
        document.getElementById('disposal_method').style.display = 'block';

        // แสดงภาพ
        const imagesContainer = document.getElementById('bin-images');
        imagesContainer.innerHTML = ''; // เคลียร์เนื้อหาก่อนหน้านี้

        // สมมติว่าภาพอยู่ใน prediction.images ซึ่งเป็น array ของ URL
        prediction.images.forEach(imageUrl => {
            const imgElement = document.createElement('img'); // สร้าง element <img>
            imgElement.src = imageUrl; // ตั้งค่า src ของภาพ
            imgElement.alt = 'Waste Image'; // ตั้งค่า alt สำหรับภาพ

            imagesContainer.appendChild(imgElement); // เพิ่ม <img> ลงใน container

            // ปรับการจัดวางตามจำนวนภาพ
            if (prediction.images.length === 1) {
                imagesContainer.style.justifyContent = 'center'; // หากมีรูปเดียว ให้จัดวางที่ตรงกลาง
            } else {
                imagesContainer.style.justifyContent = 'space-between'; // หากมีหลายรูป จัดให้มีระยะห่าง
            }

        });

    } else {
        // หากไม่มีการทำนายแสดงข้อความเตือน
        document.getElementById('result').textContent = 'ไม่สามารถทำนายได้';
    }
});


// การอัพโหลดภาพ
document.getElementById('upload-btn').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
        const imageDataUrl = e.target.result;
        document.getElementById('uploaded-img').src = imageDataUrl;
        document.getElementById('uploaded-img').style.display = 'block';

        // ส่งภาพไปยัง API เพื่อทำนาย
        const prediction = await predictImage(imageDataUrl);
        if (prediction) {

            // แสดงผลการทำนาย
            document.getElementById('result2').textContent = ` ${prediction.predicted_class} (ความมั่นใจ: ${prediction.confidence})`;
            document.getElementById('bin_color2').textContent = `ทิ้งลงถังขยะ${prediction.bin_color}`;
            document.getElementById('disposal_method2').textContent = `${prediction.disposal_method.trim()}`;

            // ทำให้ผลลัพธ์แสดงผล
            document.getElementById('result2').style.display = 'block';
            document.getElementById('bin_color2').style.display = 'block';
            document.getElementById('disposal_method2').style.display = 'block';

            // แสดงภาพ
            const imagesContainer = document.getElementById('bin-images2');
            imagesContainer.innerHTML = ''; // เคลียร์เนื้อหาก่อนหน้านี้

            // สมมติว่าภาพอยู่ใน prediction.images ซึ่งเป็น array ของ URL
            prediction.images.forEach(imageUrl => {
                const imgElement = document.createElement('img'); // สร้าง element <img>
                imgElement.src = imageUrl; // ตั้งค่า src ของภาพ
                imgElement.alt = 'Waste Image'; // ตั้งค่า alt สำหรับภาพ

                imagesContainer.appendChild(imgElement); // เพิ่ม <img> ลงใน container

                // ปรับการจัดวางตามจำนวนภาพ
                if (prediction.images.length === 1) {
                    imagesContainer.style.justifyContent = 'center'; // หากมีรูปเดียว ให้จัดวางที่ตรงกลาง
                } else {
                    imagesContainer.style.justifyContent = 'space-between'; // หากมีหลายรูป จัดให้มีระยะห่าง
                }
            });
        } else {
            // หากไม่มีการทำนายแสดงข้อความเตือน
            document.getElementById('result2').textContent = 'ไม่สามารถทำนายได้';
        }

        // แสดงปุ่ม (X)
        document.getElementById('clear-btn-upload').style.display = 'block';

        // ซ่อนปุ่มอัพโหลดหลังอัพโหลด
        document.querySelector('.upload-btn-label').style.display = 'none';
    };
    reader.readAsDataURL(file);
});

// ฟังก์ชันปุ่ม (X)
document.getElementById('clear-btn-upload').addEventListener('click', () => {
    // ซ่อนภาพที่อัพโหลด
    document.getElementById('uploaded-img').style.display = 'none';

    // ซ่อนปุ่มอัพโหลด
    document.getElementById('clear-btn-upload').style.display = 'none';

    // แสดงปุ่ม
    document.querySelector('.upload-btn-label').style.display = 'block';

    // แสดงข้อความ "ภาพขยะของคุณ" อยู่เสมอ
    const headPhoto = document.querySelector('.head-photo');
    headPhoto.style.display = 'block';

    // รีเซ็ต input เพื่อรับค่าใหม่
    document.getElementById('upload-btn').value = ''; // รีเซ็ต input

    // รีเซ็ตผลลัพธ์
    document.getElementById('result2').textContent = '';
    document.getElementById('bin_color2').textContent = '';
    document.getElementById('disposal_method2').textContent = '';

    // รีเซ็ตภาพ
    const imagesContainer = document.getElementById('bin-images2');
    imagesContainer.innerHTML = ''; // ล้างเนื้อหาภาพที่เคยแสดงออกไป
});

// ฟังก์ชันปุ่ม (X)
clearBtn.addEventListener('click', () => {
    // ซ่อนภาพที่ถ่าย
    capturedImg.style.display = 'none';

    // ซ่อนปุ่ม (X)
    clearBtn.style.display = 'none';

    // แสดงวิดีโออีกครั้ง
    video.style.display = 'block';

    // แสดงข้อความ "ภาพขยะของคุณ" อยู่เสมอ
    const headPhoto = document.querySelector('.head-photo');
    headPhoto.style.display = 'block';

    // รีเซ็ตผลลัพธ์
    document.getElementById('result').textContent = '';
    document.getElementById('bin_color').textContent = '';
    document.getElementById('disposal_method').textContent = '';

    // รีเซ็ตภาพ
    const imagesContainer = document.getElementById('bin-images');
    imagesContainer.innerHTML = ''; // ล้างเนื้อหาภาพที่เคยแสดงออกไป
});
