import requests
import json

def remove_file():

    file_sha256_hash = ""
    collection_id = ""
    virustotal_apikey = ""


    url = f"https://www.virustotal.com/api/v3/collections/{collection_id}/files"
    headers = {
        "x-apikey": virustotal_apikey,
        "Content-Type": "application/json",
        "accept": "application/json"
    }
    data = json.dumps({
        "data": [
            {
                "type": "file",
                "id": file_sha256_hash,
            },
        ]
    })
    
    response = requests.delete(url, headers=headers, data=data)
    if response.status_code == 200:
        print("Deleted!")
    else:
        print("Collection Error - Error")
        print(response.status_code)
        print(response.text)

if __name__ == "__main__":
    remove_file()