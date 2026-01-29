import os
import requests
import json

class TaskadeClient:
    def __init__(self, api_token=None):
        self.api_token = api_token or os.getenv("TASKADE_TOKEN")
        self.base_url = "https://www.taskade.com/api/v1"
        self.headers = {
            "Authorization": f"Bearer {self.api_token}",
            "Content-Type": "application/json"
        }

    def is_configured(self):
        return bool(self.api_token)

    def get_workspaces(self):
        if not self.is_configured(): return []
        response = requests.get(f"{self.base_url}/workspaces", headers=self.headers)
        if response.status_code == 200:
            items = response.json().get("items", [])
            if not items:
                print(f"DEBUG: No items in response. JSON: {response.json()}")
            return items
        else:
            print(f"DEBUG: Workspace fetch failed. Status: {response.status_code}, Response: {response.text}")
        return []

    def create_project(self, folder_id, title, content=""):
        if not self.is_configured(): return None
        payload = {
            "folderId": folder_id,
            "title": title,
            "content": content,
            "contentType": "text/markdown"
        }
        url = f"{self.base_url}/projects"
        response = requests.post(url, headers=self.headers, json=payload)
        if response.status_code in [200, 201]:
            return response.json()
        print(f"Error creating project: {response.text}")
        return None

if __name__ == "__main__":
    client = TaskadeClient()
    if not client.is_configured():
        print("CRITICAL: TASKADE_TOKEN not set in environment.")
    else:
        print("Taskade Client initialized. Ready to sync.")
