import json
CONFIG_PATH = "server_config.json"

def get_config():
    with open(CONFIG_PATH, "r") as f:
        config = json.load(f)
    return config


class Config:
    def __init__(self) -> None:
        json_config = get_config()
        self.api_key = json_config["api_key"]
        self.system_msg = json_config["system_msg"]