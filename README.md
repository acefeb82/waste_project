# waste_project
waste classification project for ISD
Intelligent System Development DSBA IT KMITL

Project Name : 
  Waste Classification Website "ทิ้งถังไหน" เว็บไซต์สำหรับช่วยแยกขยะ
Description : 
  เว็บไซต์สำหรับการช่วยแยกขยะ เมื่ออัพโหลดภาพขยะ จะแสดงผลว่าขยะชิ้นนี้ทิ้งลงถังใด จัดการให้ถูกต้องอย่างไร โดยใช้ Deep Lerning ในการทำนาย
How to run :
  1.เมื่ออัพโหลดไฟล์ทั้งหมดแล้ว ให้เข้าสู่ environment โดยเปิดเทอมินอลของโฟลเดอร์ model_deploy/python
  2.install packages ที่จำเป็นดังนี้
    FASTAPI, UVICORN, TENSORFLOW
  3.รันคำสั่ง python -m uvicorn api:app --reload
