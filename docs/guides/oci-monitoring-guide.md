# OCI Resource & Consumption Monitoring Guide

This guide provides step-by-step instructions for monitoring your `erm-platform` infrastructure in Oracle Cloud Infrastructure (OCI). 

---

## 🔍 1. Resource Inventory (What is running?)
To see all resources currently deployed in your compartment:
1. Log in to the [Oracle Cloud Console](https://cloud.oracle.com/).
2. Open the **Navigation Menu** (top left, three lines).
3. Go to **Governance & Administration** -> **Tenancy Management** -> **Tenancy Explorer**.
4. Select your **Compartment** (e.g., `DevOps` or your Root compartment).
5. You will see a list of resources including:
   - **Compute Instance**: `erm-production-01`
   - **VCN**: `erm-platform-network`
   - **Subnet**: `erm-public-subnet`

---

## 📈 2. Service Utilization (How hard is it working?)
Monitor the CPU and Memory performance of your ARM server:
1. Go to **Compute** -> **Instances**.
2. Click on the instance name: `erm-production-01`.
3. Scroll down to the **Metrics** section.
4. Review the follow charts:
   - **CPU Utilization (%)**: Ideally between 10% - 70%.
   - **Memory Utilization (%)**: Watch for spikes above 80%.
   - **Network Bytes In/Out**: Track traffic to your services.
   - **Disk Read/Write**: Monitor database/logging activity.

> [!TIP]
> You can change the "Interval" (e.g., 1 minute) and "Time Range" (e.g., Last 24 hours) at the top of the metrics section for more detail.

---

## 💰 3. Consumption & Cost Analysis (What am I spending?)
Since you are using the **Always Free** ARM plan, your costs should be minimal/zero, but it's good practice to monitor:
1. Open the **Navigation Menu**.
2. Go to **Billing & Cost Management** -> **Cost Management** -> **Cost Analysis**.
3. Use the **Grouping** filter by `Service` to see which OCI services (Compute, Block Storage, Flow Logs) are contributing to usage.
4. Check the **Usage Reports** to see granular hourly data.

---

## 🛠️ 4. Platform-Level Monitoring (Internal Services)
The `erm-platform` has built-in observability tools running on the server itself. 
1. **Grafana Dashboards**: 
   - Access at: `http://<OCI_SERVER_IP>:3000`
   - Use these to see detailed logs and metrics from your Docker containers (Audit service, Keycloak, etc.).
2. **Jaeger Tracing**:
   - Access at: `http://<OCI_SERVER_IP>:16686`
   - Use this to see how requests flow through your platform services.

---

## 🚨 5. Setting Up Alerts
To get notified if your server goes down or utilization is too high:
1. In the **Metrics** view for your instance (from Step 2), click **Create Alarm on this Query**.
2. Set a **Threshold** (e.g., CPU Utilization > 90% for 5 minutes).
3. Configure the **Notification Topic** (Email/SMS) to alert you when the threshold is hit.

---

## 💾 6. Storage & Docker Consumption
To see how much disk space your platform is consuming:

### A. OCI Console (Cloud Level) -> **"Total Available"**
The easiest way to find your **Total Available Provisioned Storage**:
1. Go to **Compute** -> **Instances** -> Click `erm-production-01`.
2. On the left-hand side under **Resources**, click **Boot Volume**.
3. The **Size (GB)** shown here is your **Total Available** (e.g., 50GB).

### B. Terminal (Server Level) -> **"Total Consumed"**
The OCI Console doesn't always see "inside" your instance. For the most accurate **Total Consumed**, run these commands:

1. **Overall OS Storage**:
   ```bash
   df -h /
   ```
   *   **Size**: Your "Total Available" (e.g., 46G).
   *   **Used**: Your **"Total Consumed"** (e.g., 12G).
   *   **Avail**: Your remaining "Headroom".

2. **Docker Storage Breakdown**:
   ```bash
   sudo docker system df
   ```
   *   *Note: Using `sudo` is required to access the Docker API.*

3. **Largest Folders (Deep Dive)**:
   ```bash
   sudo du -sh /var/lib/docker/
   ```
   *   *Or for a detailed list (Corrected for permissions):*
   ```bash
   sudo bash -c "du -sh /var/lib/docker/* | sort -h"
   ```

> [!IMPORTANT]
> **Storage Tip**: If your storage is consistently above 80%, use `sudo docker system prune -a` to safely remove unused images and build cache.

---

## 🛳️ 7. Checking Deployment Status
The `erm-platform` is deployed using Docker Compose directly on your "Always Free" Compute Instance (IaaS). 

> [!CAUTION]
> **Why can't I see these in the OCI Web Console?**
> Because you are renting a raw Virtual Machine (Infrastructure-as-a-Service), the OCI Web Console can only see the "outside" of the machine (CPU, RAM, Disk). It *cannot* look inside the operating system to see your individual Docker containers running. 
> 
> To view your platform's health in a web interface, use your **Grafana Dashboards** (See Section 4) rather than the OCI Console.

To see exactly what is running on the machine level:

1. **Connect to your server via SSH**.
2. **Navigate to the deployment directory**:
   ```bash
   cd ~/erm-platform/infra/local
   ```
3. **Check the status of all services**:
   ```bash
   sudo docker-compose -f docker-compose.prod.yml ps
   ```
   *Look at the **State** column. It should say `Up`. If it says `Exit` or `Restarting`, that service has crashed.*

4. **View logs for a failing service** (Example: `audit-service`):
   ```bash
   sudo docker-compose -f docker-compose.prod.yml logs --tail=100 -f audit-service
   ```
   *Press `Ctrl+C` to exit the log view.*

5. **Quick Overview (All Docker Containers)**:
   If you aren't in the deployment folder, you can always run a global check:
   ```bash
   sudo docker ps -a
   ```
   *This shows every container on the machine, its uptime, and its current health.*
