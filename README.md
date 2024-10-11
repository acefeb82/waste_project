# waste_project
waste classification project for ISD
Intelligent System Development DSBA IT KMITL

Project Name :
  Waste Classification Website "ทิ้งถังไหน" เว็บไซต์สำหรับช่วยแยกขยะ
  
Description :
  เว็บไซต์สำหรับการช่วยแยกขยะ เมื่ออัพโหลดภาพขยะ จะแสดงผลว่าขยะชิ้นนี้ทิ้งลงถังใด จัดการให้ถูกต้องอย่างไร โดยใช้ Deep Lerning ในการทำนาย
  
How to run :

  1.เมื่ออัพโหลดไฟล์ทั้งหมดแล้ว ให้เข้าสู่ environment โดยเปิดเทอมินอลของไดเรกทอรี model_deploy/python หรือ สร้าง Virtual Environment เพื่อแยกโปรเจคออกจากการติดตั้งไลบรารีหลักในระบบ

    # สร้าง virtual environment
    python -m venv myenv
    
    # เรียกใช้งาน virtual environment
    # บน Windows
    myenv\Scripts\activate
    
    # บน macOS/Linux
    source myenv/bin/activate

  
  2.install packages ที่จำเป็นดังนี้
  
    pip install fastapi[all]  # ติดตั้ง FastAPI พร้อมกับทุกๆ dependencies
    
    pip install tensorflow  # ติดตั้ง TensorFlow
    
    pip install pymongo  # ติดตั้ง MongoDB driver สำหรับ Python
    
    pip install pillow  # ติดตั้ง Pillow สำหรับการจัดการภาพ
    
    pip install numpy  # ติดตั้ง NumPy สำหรับการคำนวณเชิงตัวเลข


  3.เข้าถึงไดเรกทอรีของไฟล์ผ่านเทอมินอล และรันคำสั่ง python -m uvicorn api:app --reload

  4.เมื่อ Server รัน สามารถเข้าถึง API ได้ที่ URL: http://127.0.0.1:8000/
