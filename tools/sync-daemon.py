import os
import json
import re
import subprocess
import sys
from datetime import datetime, timezone

MODELS_PATH = os.path.join(os.path.dirname(__file__), 'models.json')
LAST_SYNC_PATH = os.path.join(os.path.dirname(__file__), '.last_sync')

def get_session_info():
    """Dynamically discover the language server PID, port, and token."""
    try:
        # 1. Get PID and Command Line from wmic
        cmd_wmic = 'wmic process where "name=\'language_server_windows_x64.exe\'" get processid,commandline /format:list'
        output_wmic = subprocess.check_output(cmd_wmic, shell=True).decode()
        
        pid_match = re.search(r'ProcessId=(\d+)', output_wmic)
        token_match = re.search(r'--csrf_token[=\s]+([a-f0-9\-]+)', output_wmic, re.I)
        
        if not pid_match or not token_match:
            return None
            
        pid = pid_match.group(1)
        token = token_match.group(1)
        
        # 2. Get listening ports for this PID
        cmd_netstat = f'netstat -ano | findstr {pid} | findstr LISTENING'
        output_netstat = subprocess.check_output(cmd_netstat, shell=True).decode()
        
        # We usually want the first local address port (often HTTPS)
        # Pattern: TCP 127.0.0.1:PORT ... LISTENING PID
        ports = re.findall(rf'127\.0\.0\.1:(\d+).+LISTENING\s+{pid}', output_netstat)
        
        if not ports:
            return None
            
        # Try finding a port that responds to HTTPS (port 60483 was working in tests)
        # We'll just return the list and try them in order
        return {
            "ports": ports,
            "token": token
        }
    except Exception as e:
        print(f"Discovery failed: {e}")
        return None

def sync():
    session = get_session_info()
    if not session:
        print("Could not find active Antigravity session.")
        return
    
    request_data = '{"metadata": {"ideName": "antigravity", "extensionName": "antigravity", "locale": "en"}}'
    
    # Try discovered ports
    success = False
    for port in session['ports']:
        url = f"https://127.0.0.1:{port}/exa.language_server_pb.LanguageServerService/GetUserStatus"
        
        try:
            with open('temp_req.json', 'w') as f:
                f.write(request_data)
                
            cmd = [
                'curl.exe', '-k', '-s', '-X', 'POST',
                '-H', 'Content-Type: application/json',
                '-H', 'Connect-Protocol-Version: 1',
                '-H', f'X-Codeium-Csrf-Token: {session["token"]}',
                '-d', '@temp_req.json',
                url
            ]
            
            response_json = subprocess.check_output(cmd).decode()
            if "userStatus" not in response_json:
                continue # Try next port
                
            data = json.loads(response_json)
            
            # Update our models.json
            if 'userStatus' in data and 'cascadeModelConfigData' in data['userStatus']:
                configs = data['userStatus']['cascadeModelConfigData']['clientModelConfigs']
                
                with open(MODELS_PATH, 'r') as f:
                    registry = json.load(f)
                
                api_models = {c['label']: c for c in configs}
                
                for m in registry['models']:
                    if m['name'] in api_models:
                        api_data = api_models[m['name']]
                        quota_info = api_data.get('quotaInfo')
                        if quota_info:
                            m['quota'] = float(quota_info.get('remainingFraction', 1.0))
                        else:
                            m['quota'] = 1.0 # Default to 1.0 if no quota info (infinite)
                
            registry['last_updated'] = datetime.now(timezone.utc).isoformat() + 'Z'
            
            with open(MODELS_PATH, 'w') as f:
                json.dump(registry, f, indent=4)
            
            with open(LAST_SYNC_PATH, 'w') as f:
                f.write(datetime.now(timezone.utc).isoformat())
                
                print(f"Successfully synced via port {port}")
                success = True
                break
        except Exception as e:
            continue
        finally:
            if os.path.exists('temp_req.json'):
                os.remove('temp_req.json')

    if not success:
        print("Sync failed on all discovered ports.")

if __name__ == "__main__":
    sync()
