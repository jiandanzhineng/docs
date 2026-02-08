---
slug: /手机客户端-建议采用默认wifi-不要进行配网
title: "Mobile Client (Empfohlen: Standard-WiFi verwenden, kein Netzwerkkonfiguration)"
sidebar_position: 1
---

Nur **<font>Android-Smartphones</font>** und Produkte, die nach dem 1. November 2025 ausgeliefert werden, werden unterstützt. Ältere Geräte können über die

[Anleitung zum Flashen der Hardware-Firmware](./其他使用说明/硬件固件烧录说明.md)

die Firmware aktualisieren.

# Verwendungsablauf
1.  Termux herunterladen. Download-Adresse: [https://update.ezsapi.top/termux.apk](https://update.ezsapi.top/termux.apk)
2.  Termux installieren und die Stromverwaltung von Termux auf **<font>Keine Einschränkungen, Hintergrund gesperrt</font>** setzen, um das Beenden im Hintergrund zu verhindern.
3.  Termux öffnen.

**<font>Bei der ersten Ausführung bitte den folgenden Befehl ausführen, kopieren, in Termux einfügen und die Eingabetaste drücken.</font>**

```bash
curl -fsSL https://update.ezsapi.top/run_control_panel.sh | sh
```

Wenn es **<font>nicht die erste Ausführung ist</font>**, kann der folgende Befehl ausgeführt werden, um die Ladegeschwindigkeit zu erhöhen (wenn ein Update gewünscht ist, bitte den obigen Befehl verwenden).

```bash
cd "${HOME}/control-panel-stable" && npm run dev:all
```

Warten Sie, bis die Ausführung abgeschlossen ist, ähnlich wie im folgenden Bild (wenn nach 20 Minuten kein ähnliches Bild erscheint, siehe Häufige Frage 1).

<img src={require('./img/aeI6B3lspG60kJMv/1761797537885-6667e5d2-a8ea-4d3b-956d-32f8ebe1d663-159999.jpeg').default} width="30%" height="auto" alt="1761797537885-6667e5d2-a8ea-4d3b-956d-32f8ebe1d663.jpeg" />

4.  Mobilfunk-Hotspot auf dem Smartphone aktivieren. Es wird empfohlen, den Hotspot-Namen auf `easysmart` und das Passwort auf `11111111` (acht Einsen) zu setzen. Das Gerät verbindet sich automatisch. Falls nicht, siehe die Methode zur Netzwerkkonfiguration des Geräts in den anderen Anleitungen. Die Verwendung der Standardoption wird empfohlen.
5.  Im Browser des Smartphones `127.0.0.1:5173` aufrufen.
6.  Jetzt sollte unter Geräteverwaltung zu sehen sein, dass Ihr Gerät verbunden ist. In der Spieleliste können Spiele gestartet werden (falls leer, bitte einmal aktualisieren).

# Häufige Fragen
## Nicht normal gestartet
Aufgrund von Netzwerkproblemen besteht eine gewisse Wahrscheinlichkeit, dass der Start fehlschlägt. Es gibt zwei Lösungsansätze:

1.  Termux neu installieren (oder alle Daten von Termux löschen) und anschließend erneut ausführen.
2.  Smartphone neu starten, Termux neu installieren (oder alle Daten von Termux löschen). Anschließend erneut ausführen.
3.  Wenn die Download-Geschwindigkeit zu langsam ist, vermeiden Sie den Zeitraum von 19:00 bis 24:00 Uhr für den Download, da das Netzwerk in dieser Zeit normalerweise überlastet ist. Vormittags ist es in der Regel flüssiger.

Überprüfen Sie außerdem, ob Termux auf **<font>Hintergrund uneingeschränkt</font>** eingestellt ist.

Wenn die oben genannten Methoden das Problem nicht lösen, treten Sie bitte der QQ-Gruppe 970326066 bei und wenden Sie sich an den Gruppenadministrator.

## Gerät kann keine Verbindung zum Mobilfunk-Hotspot herstellen
Bitte stellen Sie den Mobilfunk-Hotspot auf 2,4 GHz um. Wenn es dann immer noch nicht funktioniert, versuchen Sie, mit einem anderen Gerät eine Verbindung zu diesem Hotspot herzustellen.
Mögliche Ursache 1: Es gab Fälle, in denen auch andere Geräte keine Verbindung zum Hotspot herstellen konnten, was auf ein Problem mit dem Hotspot hinweist.
Mögliche Ursache 2: Es könnte auch ein Problem mit dem Hotspot selbst sein. Der Grund scheint zu sein, dass der Hotspot nicht auf 2,4 GHz umschalten kann. Ein Benutzer hat das Problem gelöst, indem er das aggregierte Frequenzband auf seinem Router in separate 2,4-GHz- und 5-GHz-Bänder aufgeteilt hat. Der genaue Lösungsgrund ist unbekannt.

Mögliche Ursache 3: Der Benutzer hat eine Netzwerkkonfiguration durchgeführt, und das Gerät verbindet sich nicht mehr mit dem Standard-WiFi. In diesem Fall verwenden Sie bitte die Konfigurations-App, um das Gerät erneut mit dem Standard-WiFi-Namen und -Passwort zu konfigurieren. Der WiFi-Name in der Konfigurations-App kann geändert werden.