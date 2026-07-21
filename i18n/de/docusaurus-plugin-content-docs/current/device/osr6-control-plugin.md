---
slug: osr6-control-plugin
title: OSR6-Steuerungs-Plugin
---

# OSR6-Steuerungs-Plugin

Dieses Plugin kann OSR6-Geräte zur UnderSilicon-Steuerung hinzufügen, um die Steuerung von OSR6-Geräten zu ermöglichen.
Andere OSR-Geräte (OSR2, OSR3 usw.), die multifunplayer oder XTPlayer verwenden, können ebenfalls mit diesem Plugin genutzt werden.

## Anforderungen

1. Windows-Umgebung
2. OSR6-Gerät ist über eine serielle Schnittstelle mit dem Computer verbunden (per Kabel oder Bluetooth möglich)
3. Die Steuerung des OSR6-Geräts über multifunplayer oder XTPlayer ist bereits möglich

## Download-Adressen

GitHub: https://github.com/jiandanzhineng/osr6-controller/releases/

LanZouYun: https://wwaos.lanzouu.com/iCmtw3o8ni8f

## Bedienungsanleitung

Video-Tutorial: https://www.bilibili.com/video/BV1Z4PWzdEkB/

Im Folgenden wird die Verwendung des OSR6-Plugins am Beispiel des "Edging"-Spiels erläutert.

Die Verwendung des "Edging"-Spiels bezieht sich auf [die Einführung zum 3-stufigen Edging-Spiel](../player/气压寸止玩法3阶段升级版说明.md)

Die Rolle des OSR6 im Spiel besteht darin, das ursprüngliche Vibrationsmodul zu ersetzen und durch den OSR6 die stimulierende Wirkung zu erzielen.

1. Öffnen Sie multifunplayer.
2. Öffnen Sie die UnderSilicon-Steuerung.
3. Öffnen Sie das OSR6-Steuerungs-Plugin, wählen Sie den Port des OSR6 aus und starten Sie den Dienst.
4. Fügen Sie in multifunplayer eine **UDP-Ausgabemethode** hinzu. Die Ausgabeadresse lautet 127.0.0.1, der Port muss mit dem im OSR6-Steuerungs-Plugin übereinstimmen.
5. Nun sollte das OSR6-Gerät in der UnderSilicon-Steuerung sichtbar sein. Das "Edging"-Spiel kann gestartet werden.
> ! Hinweis: Beim Start des Spiels muss das OSR6-Gerät als **Exzentermotor-Controller** ausgewählt werden, da es sonst keine Spielbefehle empfangen kann.

[Kauf-Link](../player/气压寸止玩法3阶段升级版说明.md#buy-link-info)