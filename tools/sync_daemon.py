import os
import json
import re
import subprocess
import urllib.request
import urllib.error
import ssl
from datetime import datetime, timezone

MODELS_PATH = os.path.join(os.path.dirname(__file__), 'models.json')

def get_session_info():
    """Dynamically discover the language server PID and token (Windows-specific)."""
    try:
        # Get PID and Command Line
        cmd_wmic = 'wmic process where "name=\'language_server_windows_x64.exe\'" get processid,commandline /format:list'
        output_wmic = subprocess.check_output(cmd_wmic, shell=True).decode()
        
        pid_match = re.search(r'ProcessId=(\d+)', output_wmic)
        token_match = re.search(r'--csrf_token[=\s]+([a-f0-9\-]+)', output_wmic, re.I)
        
        if not pid_match or not token_match:
            return None
            
        pid = pid_match.group(1)
        token = token_match.group(1)
        
        # Get listening ports for this PID
        cmd_netstat = f'netstat -ano | findstr {pid}'
        output_netstat = subprocess.check_output(cmd_netstat, shell=True).decode()
        ports = re.findall(rf'127\.0\.0\.1:(\d+).+LISTENING\s+{pid}', output_netstat)
        
        if not ports:
            return None
            
        return {"ports": ports, "token": token}
    except Exception as e:
        print(f"Discovery failed: {e}")
        return None

def sync():
    session = get_session_info()
    if not session:
        print("[SYNC WARNING] Could not find active Antigravity session.")
        return
    
    request_data = json.dumps({
        "metadata": {"ideName": "antigravity", "extensionName": "antigravity", "locale": "en"}
    }).encode('utf-8')
    
    # Ignore SSL verification (equivalent to curl -k)
    ssl_context = ssl._create_unverified_context()
    success = False
    
    for port in session['ports']:
        url = f"http://127.0.0.1:{port}/exa.language_server_pb.LanguageServerService/GetUserStatus"
        
        req = urllib.request.Request(
            url,
            data=request_data,
            headers={
                'Content-Type': 'application/json',
                'Connect-Protocol-Version': '1',
                'X-Codeium-Csrf-Token': session["token"]
            },
            method='POST'
        )
        
        try:
            # Native Python HTTP request (No temp files, no curl.exe)
            with urllib.request.urlopen(req, context=ssl_context, timeout=5) as response:
                response_json = response.read().decode('utf-8')
                
            if "userStatus" not in response_json:
                continue
                
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
                        
                        if quota_info and quota_info.get('remainingFraction') is not None:
                            m['quota'] = float(quota_info['remainingFraction'])
                        else:
                            # Safer Fallback: Standard/Enhanced models assume 1.0, high-tier models assume 0.0
                            m['quota'] = 1.0 if m.get('tier') in ["Standard", "Enhanced"] else 0.0
                
                registry['last_updated'] = datetime.now(timezone.utc).isoformat() + 'Z'
                
                with open(MODELS_PATH, 'w') as f:
                    json.dump(registry, f, indent=4)
                    
                print(f"[SYNC SUCCESS] Registry updated via port {port}")
                success = True
                break
                
        except urllib.error.URLError:
            continue
        except Exception as e:
            print(f"[SYNC ERROR] Port {port} failed: {e}")
            continue

    if not success:
        print("[SYNC FATAL] Sync failed on all discovered ports.")

if __name__ == "__main__":
    sync()