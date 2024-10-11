from pymongo import MongoClient

# กำหนด URL และฐานข้อมูล MongoDB (แก้ไข URL ให้ตรงกับของคุณ)
mongo_url = "mongodb+srv://65070085:PasswordDB1@cluster0.hghluah.mongodb.net/"
client = MongoClient(mongo_url)

# เข้าถึงฐานข้อมูล
db = client['Project_Waste']

# เข้าถึง collection ที่อัปโหลด JSON ลงไป
collection = db['Waste_Info']

# ดึงข้อมูลทั้งหมดจาก collection
documents = collection.find()

# แสดงข้อมูลที่ดึงมา
for doc in documents:
    print(doc)
