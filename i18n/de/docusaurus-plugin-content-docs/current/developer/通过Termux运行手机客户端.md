---
slug: /通过Termux运行手机客户端
title: Ausführen des mobilen Clients über Termux
sidebar_position: 10
---

> 🎉 **Mobile Client offiziell veröffentlicht!**
> 
> Nicht-Erweiterte Entwickler müssen dieses Dokument nicht lesen, bitte direkt den veröffentlichten Client verwenden.
> 
> 📱 **Client-Download-Adresse: [docs/player/new-phone-client](/docs/player/new-phone-client)**
> 
> ⚠️ Der folgende Inhalt dient nur als Referenz für erweiterte Entwickler.

---

# Video-Tutorial

Bilibili: https://www.bilibili.com/video/BV1ZicuzkETc/
YouTube: https://youtu.be/362cUVcYms8

# Ablauf der Nutzung
1.  Lade Termux herunter. Download-Adresse: [https://update.ezsapi.top/termux.apk](https://update.ezsapi.top/termux.apk)
2.  Installiere Termux und setze die Stromverwaltung von Termux auf <font> uneingeschränkt, Hintergrund gesperrt</font>, um das Beenden im Hintergrund zu verhindern.
3.  Öffne Termux.

**<font>Beim ersten Ausführen bitte den folgenden Befehl kopieren, in Termux einfügen und Enter drücken:</font>**

```bash
curl -fsSL https://firmware.undersilicon.cn/control-panel/run_control_panel_stable.sh | sh
```

Falls es **<font>nicht das erste Ausführen ist</font>**, kann der folgende Befehl verwendet werden, um die Ladegeschwindigkeit zu erhöhen (wenn eine Aktualisierung gewünscht ist, bitte den obigen Befehl verwenden):

```bash
cd "${HOME}/control-panel-stable" && npm run dev:all
```

Warte, bis die Ausführung abgeschlossen ist. Es sollte ähnlich wie im folgenden Bild aussehen (falls nach 20 Minuten noch kein ähnliches Bild erscheint, bitte FAQ Punkt 1 konsultieren):

<img src={require('./img/aeI6B3lspG60kJMv/1761797537885-6667e5d2-a8ea-4d3b-956d-32f8ebe1d663-159999.jpeg').default} width="30%" height="auto" alt="1761797537885-6667e5d2-a8ea-4d3b-956d-32f8ebe1d663.jpeg" />

4.  Aktiviere den mobilen Hotspot. Es wird empfohlen, den Hotspot-Namen auf `easysmart`, das Passwort auf 8 Einsen und die Frequenz auf 2,4 GHz einzustellen. Das Gerät verbindet sich automatisch (falls andere Einstellungen gewünscht sind, bitte die Geräte-Netzwerkkonfiguration in anderen Anweisungen konsultieren, die Standardoption wird empfohlen).
5.  Öffne den mobilen Browser und greife auf `127.0.0.1:5173` zu.
6.  Unter Geräteverwaltung sollte nun das verbundene Gerät sichtbar sein, und Spiele können in der Spieleliste gestartet werden (falls leer, bitte einmal aktualisieren).

# Häufige Fragen
## Nicht erfolgreich gestartet
Aufgrund von Netzwerkproblemen besteht eine gewisse Wahrscheinlichkeit, dass der Start fehlschlägt. Es gibt zwei Lösungsansätze:

1.  Termux erneut installieren (oder alle Termux-Daten löschen) und danach erneut ausführen.
2.  Das Handy neu starten, Termux erneut installieren (oder alle Termux-Daten löschen) und danach erneut ausführen.
3.  Falls die Download-Geschwindigkeit zu langsam ist, vermeiden Sie die Zeit zwischen 19:00 und 24:00 Uhr, da das Netzwerk in dieser Zeit oft überlastet ist. Vormittags ist es in der Regel reibungsloser.

Stellen Sie auch sicher, dass Termux auf <font>unbegrenzten Hintergrundbetrieb</font> eingestellt ist.

Wenn die oben genannten Methoden das Problem nicht lösen, treten Sie bitte der QQ-Gruppe 970326066 bei und kontaktieren Sie den Gruppenadministrator.

## Gerät kann sich nicht mit dem mobilen Hotspot verbinden
Bitte stellen Sie den mobilen Hotspot auf 2,4 GHz um. Falls es dann immer noch nicht funktioniert, versuchen Sie, einen anderen Gerät mit diesem Hotspot zu verbinden.
Mögliche Ursache 1: Andere Handys konnten sich auch nicht mit dem Hotspot verbinden, was auf ein Problem mit dem Hotspot hinweist.

Mögliche Ursache 2: Problem mit dem mobilen Hotspot. Einige Handys können keinen 2,4-GHz-Hotspot einrichten, wenn sie mit einem 5-GHz-WLAN verbunden sind. Trennen Sie in diesem Fall die WLAN-Verbindung des Handys, verwenden Sie nur mobile Daten fürs Internet und aktivieren Sie dann den WLAN-Hotspot.

Mögliche Ursache 3: Der Benutzer hat eine Netzwerkkonfiguration durchgeführt, und das Gerät verbindet sich nicht mehr mit dem Standard-WLAN. Bitte verwenden Sie die Konfigurations-App, um das Gerät erneut mit dem Standard-WLAN-Namen und -Passwort zu konfigurieren. Der WLAN-Name in der App kann geändert werden.

## Termux zeigt "Unable to install bootstrap" an

Installieren Sie Termux nicht in einem separaten Handy-Profil oder im Anwendungs-Duo-Modus.

## Zugriff auf 127.0.0.1:5173 im mobilen Browser nicht möglich

Bitte stellen Sie die Stromverwaltung von Termux auf uneingeschränkt ein und sperren Sie den Hintergrund, um das Beenden im Hintergrund zu verhindern.