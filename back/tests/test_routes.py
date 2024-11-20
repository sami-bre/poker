from fastapi import FastAPI
from fastapi.testclient import TestClient

# Import the router instead of routes module
from src.api.routes import router

# Create FastAPI app and include the router
app = FastAPI()
app.include_router(router)

# Create test client with the app
client = TestClient(app)


def test_create_simple_hand():
    # Test data
    test_hand = {
        "player_count": 6,
        "dealer_position": 5,
        "initial_stack_size": 3000,
        "hole": '[["Th", "4h"], ["Ts", "5h"], ["Td", "4d"], ["2h", "3h"], ["Ac", "3d"], ["Ks", "Kc"]]',
        "board": '["2s", "3c", "5s", "6h", "7h"]',
        "actions": '[["f",2],["f",3],["f",4],["f",5],["f",0]]',
        "winnings": "",
    }

    # Make request
    response = client.post("/hands", json=test_hand)

    # Verify response
    assert response.status_code == 200
    data = response.json()
    assert data["actions"] == test_hand["actions"]
    assert data["winnings"] == "1:-20;2:20;3:0;4:0;5:0;6:0"


def test_simple_hand_with_dealer_in_the_middle():
    # Test data
    test_hand = {
        "player_count": 6,
        "dealer_position": 1,  # 0 indexed
        "initial_stack_size": 3000,
        "hole": '[["Th", "4h"], ["Ts", "5h"], ["Td", "4d"], ["2h", "3h"], ["Ac", "3d"], ["Ks", "Kc"]]',
        "board": '["2s", "3c", "5s", "6h", "7h"]',
        "actions": '[["f",2],["f",3],["f",4],["f",5],["f",0]]',
        "winnings": "",
    }

    # Make request
    response = client.post("/hands", json=test_hand)

    # Verify response
    assert response.status_code == 200
    data = response.json()
    assert data["actions"] == test_hand["actions"]
    assert data["winnings"] == "3:-20;4:20;5:0;6:0;1:0;2:0"  # 1 indexed player id


def test_playthrough_2():
    # Test data
    test_hand = {
        "player_count": 6,
        "dealer_position": 2,
        "initial_stack_size": 2000,
        "hole": '[["2d","7d"],["Kh","2c"],["Ts","Th"],["8d","3s"],["8s","7s"],["Ad","9c"]]',
        "board": '["9c","Qh","Ks","Kd","9h"]',
        "actions": '[["c",5],["c",0],["f",1],["f",2],["c",3],["x",4],["m",-1],["x",3],["x",4],["x",5],["b40",0],["r80",3],["c",4],["c",5],["f",0],["n",-1],["x",3],["b40",4],["r80",5],["r120",3],["c",4],["c",5],["o",-1],["x",3],["x",4],["x",5]]',
        "winnings": "",
    }

    # Make request
    response = client.post("/hands", json=test_hand)

    # Verify response
    assert response.status_code == 200
    data = response.json()
    assert data["actions"] == test_hand["actions"]
    assert data["winnings"] == "4:-240;5:560;6:-240;1:-80;2:0;3:0"


def test_create_hand_invalid_moves():
    test_hand = {
        "player_count": 6,
        "dealer_position": 5,
        "initial_stack_size": 2000,
        "hole": '[["Th", "9h"], ["Ts", "5h"], ["Td", "4d"], ["2h", "3h"], ["Ac", "3d"], ["Ks", "Kc"]]',
        "board": '["8s", "7c", "3s", "6h", "7h"]',
        "actions": "['c', 2], ['f', 3], ['c', 4], ['c', 0],['x', 1], ['m', -1], ['x', 0], ['x', 1], ['x', 2], ['b80', 4], ['f', 0], ['r120', 1], ['c', 2], ['f', 4], ['n', -1], ['x', 1], ['f', 2]",
        "winnings": "",
    }

    response = client.post("/hands", json=test_hand)
    assert response.status_code == 400
    assert "Error calculating winnings" in response.json()["detail"]


def test_get_hands():
    # Get all hands
    response = client.get("/hands")

    # Verify response
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
