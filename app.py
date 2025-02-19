from flask import Flask, request, jsonify
from pymongo import MongoClient

app = Flask(__name__)

client = MongoClient("mongodb+srv://haimassraf:Aa123456@cluster0.s8vwr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
db = client["key_loger_project"]
users_collection = db["users"]

@app.route('/')
def home():
    return "Welcome to my MongoDB-powered server!", 200


@app.route('/users', methods=['GET'])
def get_users():
    users = list(users_collection.find({}, {"_id": 0}))
    return jsonify(users), 200


@app.route('/users', methods=['POST'])
def add_user():
    try:
        data = request.json
        if not data.get("name") or not data.get("email"):
            return jsonify({"error": "Invalid data. Required fields: name, email"}), 400

        result = users_collection.insert_one(data)

        data["_id"] = str(result.inserted_id)
        return jsonify({
            "message": "User added successfully!",
            "data": data,
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == '__main__':
    app.run(debug=True)
