import tensorflow as tf
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from starlette.requests import Request
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient
import numpy as np
from PIL import Image
import io

# สร้าง FastAPI instance
app = FastAPI()

# กำหนดเส้นทาง static files
app.mount("/images", StaticFiles(directory="../../images"), name="images")
app.mount("/static", StaticFiles(directory="../../templates"), name="static")

templates = Jinja2Templates(directory="../../templates")

# เชื่อมต่อกับ MongoDB
client = MongoClient("mongodb+srv://65070085:PasswordDB1@cluster0.hghluah.mongodb.net/")  # URL ของ MongoDB
db = client['Project_Waste']  # ชื่อฐานข้อมูล
waste_collection = db['Waste_Info']  # ชื่อคอลเลคชันที่เก็บข้อมูล

# โหลดโมเดลที่บันทึกไว้
load_model = tf.keras.models.load_model('C:/Users/User/acefeb/Project_WasteClass/model_deploy/python/allmodel.h5')
# เปลี่ยนชื่อ class ให้เป็นภาษาไทย
class_names = ['กระป๋องสเปรย์', 'กระป๋องอาหารอลูมิเนียม', 'กระป๋องน้ำอัดลม', 'กล่องพัสดุ', 'กระดาษลัง', 'เสื้อผ้า', 'กากกาแฟ', 'ช้อนส้อม'
               , 'เปลือกไข่', 'เศษอาหาร', 'ขวดแก้ว', 'บรรจุภัณฑ์เครื่องสำอาง', 'โหลแก้ว', 'นิตยสาร', 'หนังสือพิมพ์', 'กระดาษ', 'แก้วกระดาษ'
               , 'ฝาแก้ว', 'ขวดน้ำยาซักผ้า', 'กล่องอาหารพลาสติก', 'ถุงพลาสติก', 'ขวดน้ำพลาสติก', 'หลอด', 'ถุงขยะ', 'ขวดน้ำพลาสติก', 'รองเท้า'
               , 'กระป๋องเหล็ก', 'แก้วโฟม', 'กล่องโฟม/ถ้วยโฟม', 'ถุงชา']

# 1. ฟังก์ชันสำหรับโหลดและแปลงรูปภาพใหม่
def load_and_preprocess_image(image: Image.Image, target_size=(256, 256)):
    # แปลงภาพเป็น RGB หากเป็น RGBA หรือมี alpha channel
    if image.mode == 'RGBA':
        image = image.convert('RGB')
    # Resize รูปภาพให้มีขนาดเท่ากับ input ที่โมเดลคาดหวัง
    img = image.resize(target_size)
    # แปลงรูปภาพเป็น array และ normalize
    img_array = np.array(img)  # Normalize
    # เพิ่ม dimension เพื่อให้เป็นรูปแบบที่โมเดลอ่านได้
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# 2. หน้าแรก
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# 3. API สำหรับดึงข้อมูลทั้งหมดจาก MongoDB
@app.get("/waste_data")
async def get_waste_data():
    documents = waste_collection.find()
    waste_data_list = []
    for doc in documents:
        doc.pop('_id', None)
        waste_data_list.append(doc)
    return JSONResponse(content=waste_data_list)

# 4. API สำหรับรับภาพและทำนายผลลัพธ์
@app.post("/predict/")
async def predict_image(file: UploadFile = File(...)):
    # อ่านภาพจากไฟล์ที่อัปโหลด
    image = Image.open(io.BytesIO(await file.read()))
    
    # เตรียมภาพ
    processed_image = load_and_preprocess_image(image)
    
   # ทำนายผลลัพธ์
    predictions = load_model.predict(processed_image)
    predicted_class_idx = np.argmax(predictions, axis=1)[0]
    predicted_class_name = class_names[predicted_class_idx]
    confidence = predictions[0][predicted_class_idx] * 100  # ค่าความมั่นใจ

    # ดึงข้อมูลจาก MongoDB 
    predicted_class_id = str(predicted_class_idx + 1)  # กำหนด class_id จาก predicted_class_idx คอนเวิร์ตเป็น string ให้ตรงกับ key ใน MongoDB
    waste_data = waste_collection.find_one({predicted_class_id: {"$exists": True}}) # ค้นหาเอกสารที่มี class_id นั้นอยู่

    # แสดงข้อมูลการทำนาย
    if waste_data and predicted_class_id in waste_data:
        waste_info = waste_data[predicted_class_id]  # เข้าถึงข้อมูลของ class ที่ต้องการ
        waste_class = waste_info['class']
        bin_color = waste_info['bin_color']
        disposal_method = waste_info['disposal_method']
        images = waste_info['img-url']
    else:
        waste_class = "ไม่พบข้อมูล"
        bin_color = "ไม่พบข้อมูล"
        disposal_method = "ไม่พบข้อมูล"
        images = "ไม่พบข้อมูล"

    # พิมพ์ข้อมูลเพื่อดีบัก
    print(f"Predicted class: {waste_class}")
    print(f"Confidence: {confidence:.2f}%")
    print(f"Bin color: {bin_color}")
    print(f"Disposal method: {disposal_method}")
    print(f"img-url: {images}")

    # ส่งผลลัพธ์การทำนายกลับไป
    return {
        "predicted_class": waste_class,
        "bin_color": bin_color,
        "disposal_method": disposal_method,
        "confidence": f"{confidence:.2f}%",
        "images": images
    }

# วิธีรัน FastAPI server:
# cd C:\Users\User\acefeb\Project_WasteClass\model_deploy\python
# python -m uvicorn api:app --reload
