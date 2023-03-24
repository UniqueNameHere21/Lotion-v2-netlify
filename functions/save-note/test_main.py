from main import *
import time

note = {
    "id": "665",
    "title": "NEW test FUCK title",
    "body": "ADD ME",
    "when": time.time().__str__()
}

def test_get():
    print("START")
    res = lambda_handler("m.bullock179@gmail.com", note)
