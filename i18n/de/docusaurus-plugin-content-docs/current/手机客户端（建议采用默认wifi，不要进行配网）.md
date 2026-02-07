---
slug: /手机客户端-建议采用默认wifi-不要进行配网
title: Mobile Client (Verwenden Sie das Standard-WLAN, kein Netzwerkkonfiguration erforderlich)
sidebar_position: 1
---

Nur **<font>Android-Smartphones werden unterstützt</font>**, und Produkte, die nach dem 1. November 2025 ausgeliefert werden. Ältere Geräte können über

[Hardware-Firmware-Flash-Anleitung](./其他使用说明/硬件固件烧录说明.md)

die Firmware aktualisieren.

# Verwendungsablauf
1. Laden Sie Termux herunter. Download-Adresse: [https://update.ezsapi.top/termux.apk](https://update.ezsapi.top/termux.apk)
2. Installieren Sie Termux und stellen Sie das Energiemanagement von Termux auf **<font>Keine Einschränkungen, Hintergrund gesperrt</font>**, um zu verhindern, dass es im Hintergrund beendet wird.
3. Öffnen Sie Termux.

**<font>Beim ersten Ausführen, bitte führen Sie den folgenden Befehl aus, kopieren Sie ihn in Termux und drücken Sie die Eingabetaste</font>**

```bash
curl -fsSL https://update.ezsapi.top/run_control_panel.sh | sh
```

Wenn es **<font>nicht das erste Ausführen ist</font>**, können Sie den folgenden Befehl ausführen, um die Ladegeschwindigkeit zu erhöhen (wenn Sie aktualisieren möchten, verwenden Sie den obigen Befehl)

```bash
cd "${HOME}/control-panel-stable" && npm run dev:all
```

Warten Sie, bis die Ausführung abgeschlossen ist, ähnlich wie im folgenden Bild (wenn nach 20 Minuten kein ähnliches Bild erscheint, lesen Sie bitte Häufige Frage 1)

![1761797537885-6667e5d2-a8ea-4d3b-956d-32f8ebe1d663.jpeg](./img/aeI6B3lspG60kJMv/1761797537885-6667e5d2-a8ea-4d3b-956d-32f8ebe1d663-159999.jpeg)

4. Aktivieren Sie den Mobilfunk-Hotspot. Es wird empfohlen, den Hotspot-Namen auf `easysmart` und das Passwort auf `11111111` (acht Einsen) zu setzen. Das Gerät wird sich automatisch verbinden. Wenn dies nicht der Fall ist, lesen Sie bitte die Methode zur Netzwerkkonfiguration des Geräts in den anderen Anweisungen. Es wird empfohlen, die Standardoption zu verwenden.
5. Öffnen Sie im Handy-Browser `127.0.0.1:5173`
6. Jetzt sollten Sie im Gerätemanagement sehen können, dass Ihr Gerät verbunden ist. In der Spieleliste können Sie Spiele starten (wenn sie leer ist, bitte aktualisieren).

# Häufige Fragen
## Normales Starten nicht möglich
Aufgrund von Netzwerkproblemen besteht eine gewisse Wahrscheinlichkeit, dass der Start fehlschlägt. Es gibt zwei Lösungen:

1. Termux neu installieren (oder alle Daten von Termux löschen) und dann erneut ausführen.
2. Das Handy neu starten, Termux neu installieren (oder alle Daten von Termux löschen) und dann erneut ausführen.
3. Wenn die Download-Geschwindigkeit zu langsam ist, vermeiden Sie die Zeit zwischen 19:00 und 24:00 Uhr für Downloads, da das Netzwerk in dieser Zeit normalerweise stark ausgelastet ist. Am Vormittag ist es in der Regel weniger belastet.

Überprüfen Sie außerdem, ob Termux auf **<font>keine Hintergrundbeschränkungen</font>** eingestellt ist.

Wenn Sie nach dem Ausprobieren der beiden oben genannten Methoden das Problem immer noch nicht lösen können, treten Sie bitte der QQ-Gruppe 970326066 bei und kontaktieren Sie den Gruppenadministrator.

## Gerät kann sich nicht mit dem Mobilfunk-Hotspot verbinden
Bitte schalten Sie den Mobilfunk-Hotspot auf 2,4 GHz um. Wenn es immer noch nicht funktioniert, versuchen Sie, ein anderes Gerät mit diesem Hotspot zu verbinden.
Mögliche Ursache 1: Es gab Fälle, in denen auch andere Handys sich nicht mit dem Hotspot verbinden konnten, was auf ein Problem mit dem Hotspot des Handys hinweist.
Mögliche Ursache 2: Es könnte auch ein Problem mit dem Hotspot selbst sein. Der Grund scheint zu sein, dass der Hotspot nicht auf 2,4 GHz umschalten kann. Ein Benutzer hat das Problem gelöst, indem er die gebündelten Frequenzbänder auf seinem Router in separate 2,4-GHz- und 5-GHz-Netzwerke aufgeteilt hat. Der genaue Grund für die Lösung ist unbekannt.

Mögliche Ursache 3: Der Benutzer hat eine Netzwerkkonfiguration durchgeführt, und das Gerät verbindet sich nicht mehr mit dem Standard-WLAN. In diesem Fall verwenden Sie bitte die Netzwerkkonfigurations-App, um das Gerät erneut mit dem Standard-WLAN-Namen und -Passwort zu konfigurieren. Der WLAN-Name in der App kann geändert werden.