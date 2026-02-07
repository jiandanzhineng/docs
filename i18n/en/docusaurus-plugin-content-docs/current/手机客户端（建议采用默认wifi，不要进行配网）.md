---
slug: /mobile-client-recommend-default-wifi-no-network-configuration
title: Mobile Client (Recommend Using Default Wifi, Do Not Perform Network Configuration)
sidebar_position: 1
---

Only **<font>supports Android phones</font>** and products shipped after November 1, 2025. For previous devices, you can update the firmware via

[Hardware Firmware Flashing Instructions](./其他使用说明/硬件固件烧录说明.md)

# Usage Process
1. Download Termux. Download link: [https://update.ezsapi.top/termux.apk](https://update.ezsapi.top/termux.apk)
2. Install Termux and set its power management to **<font>No Restriction & Background Locking</font>** to prevent it from being killed in the background.
3. Open Termux.

**<font>For the first run, please execute the following command: copy and paste it into Termux, then press Enter.</font>**

```bash
curl -fsSL https://update.ezsapi.top/run_control_panel.sh | sh
```

If **<font>not the first run</font>**, you can execute the following command to improve loading speed (use the command above if you want to update).

```bash
cd "${HOME}/control-panel-stable" && npm run dev:all
```

Wait for the operation to complete, similar to the image below (if there is no similar image after 20 minutes, please refer to FAQ 1).

![1761797537885-6667e5d2-a8ea-4d3b-956d-32f8ebe1d663.jpeg](./img/aeI6B3lspG60kJMv/1761797537885-6667e5d2-a8ea-4d3b-956d-32f8ebe1d663-159999.jpeg)

4. Turn on the mobile phone hotspot. It is recommended to set the hotspot name to `easysmart` and the password to eight `1`s. The device will automatically connect. If not set to this, please refer to the device network configuration method in Other Instructions for network configuration. The default option is recommended.
5. Open the phone browser and visit `127.0.0.1:5173`.
6. At this point, you should see your device connected in Device Management, and you can start games in the Game List (if empty, try refreshing).

# Common Issues
## Failed to Start Normally
Due to network issues, there is a certain probability of startup failure. There are two solutions:

1. Reinstall Termux (or clear all Termux data), then run it again.
2. Restart the phone, reinstall Termux (or clear all Termux data), then run it again.
3. If the download speed is too slow, avoid the period from 7 PM to 12 AM, as the network is usually congested during this time. Mornings are generally smoother.

Also, check if Termux is set to **<font>No Background Restrictions</font>**.

If the above two methods still do not resolve the issue, please join QQ group 970326066 and contact the group owner for assistance.

## Device Cannot Connect to Phone Hotspot
Please switch the phone hotspot to 2.4G. If it still doesn't work, try connecting another device to this phone's hotspot.
Possible Cause 1: There have been cases where other phones also couldn't connect to the phone's hotspot, indicating an issue with the phone's hotspot.
Possible Cause 2: It might still be a phone hotspot issue. The reason seems to be that the hotspot cannot switch to 2.4G. One user resolved this by splitting the aggregated frequency band on their router into separate 2.4G and 5G bands. The exact reason for the fix is unknown.

Possible Cause 3: The user performed a network configuration operation, and the device no longer connects to the default wifi. In this case, please use the network configuration APP to reconfigure the device to the default wifi name and password. The wifi name for configuration in the APP can be modified.