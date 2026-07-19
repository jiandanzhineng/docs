---
slug: osr6-control-plugin
title: OSR6 Control Plugin
---

# OSR6 Control Plugin

This plugin allows OSR6 devices to be added to the UnderSilicon control end, enabling control over OSR6 devices.  
Other OSR devices (such as OSR2, OSR3, etc.) that use multifunplayer or XTPlayer can also be controlled with this plugin.

## Requirements

1. Windows environment
2. OSR6 device connected to the computer via serial port (data cable or Bluetooth)
3. OSR6 device can already be controlled via multifunplayer or XTPlayer

## Download Links

GitHub: https://github.com/jiandanzhineng/osr6-controller/releases/

Lanzou: https://wwaos.lanzouu.com/iCmtw3o8ni8f

## Usage Instructions

Video tutorial: https://www.bilibili.com/video/BV1Z4PWzdEkB/

Next, using the edging gameplay as an example, we introduce how to use the OSR6 plugin.

For the usage of edging gameplay, refer to: [3-Stage Edging Gameplay Introduction](../game/气压寸止玩法3阶段升级版说明.md)

The role of OSR6 in the game is to replace the original vibration module, using OSR6 to achieve stimulation effects.

1. Open multifunplayer
2. Open the UnderSilicon control end
3. Open the OSR6 control plugin, select the port for OSR6, and start the service
4. In multifunplayer, add a UDP output method, with the output address as 127.0.0.1 and the port matching the one in the OSR6 control plugin
5. Now you can see the OSR6 device in the UnderSilicon control end, and you can start the edging game
> ! Note: When starting the game, you must check the OSR6 device as the eccentric motor controller; otherwise, OSR6 will not receive game commands.

[Purchase Link](../game/气压寸止玩法3阶段升级版说明.md#buy-link-info)