import tensorflow as tf
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image
import io

# สร้าง FastAPI instance
app = FastAPI()

# โหลดโมเดลที่บันทึกไว้
load_model = tf.keras.models.load_model('D:/acefeb/it/ISD/saved_model_checkpoint/allmodel.h5')

# ชื่อคลาสที่ใช้
class_names = ['Class1', 'Class2', 'Class3']  # ปรับตามชื่อคลาสที่คุณใช้

# 1. ฟังก์ชันสำหรับโหลดและแปลงรูปภาพใหม่
def load_and_preprocess_image(image: Image.Image, target_size=(256, 256)):
    # Resize รูปภาพให้มีขนาดเท่ากับ input ที่โมเดลคาดหวัง
    img = image.resize(target_size)
    # แปลงรูปภาพเป็น array และ normalize
    img_array = np.array(img) / 255.0  # Normalize
    # เพิ่ม dimension เพื่อให้เป็นรูปแบบที่โมเดลอ่านได้
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# 2. API สำหรับรับภาพและทำนายผลลัพธ์
@app.post("/predict/")
async def predict_image(file: UploadFile = File(...)):
    # อ่านภาพจากไฟล์ที่อัปโหลด
    image = Image.open(io.BytesIO(await file.read()))
    
    # เตรียมภาพ
    processed_image = load_and_preprocess_image(image)
    
    # ทำนายผลลัพธ์
    predictions = model.predict(processed_image)
    predicted_class_idx = np.argmax(predictions, axis=1)[0]
    predicted_class_name = class_names[predicted_class_idx]
    confidence = predictions[0][predicted_class_idx]  # ค่าความมั่นใจ
    
    # ส่งผลลัพธ์การทำนายกลับไป
    return {
        "predicted_class": predicted_class_name,
        "confidence": float(confidence)
    }

# วิธีรัน FastAPI server:
# uvicorn app:app --reload
