from flask import Blueprint
import controller

router = Blueprint('router', __name__)

@router.route('/data', methods=['GET'])
def get_data():
    return controller.get_data()

@router.route('/data', methods=['POST'])
def add_data():
    return controller.add_data()

@router.route('/get_managers', methods=['GET'])
def get_manager():
    return controller.get_managers()

@router.route('/add_manager', methods=['POST'])
def add_manager():
    return controller.add_manager()