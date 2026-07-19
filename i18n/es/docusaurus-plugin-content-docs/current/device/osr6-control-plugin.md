---
slug: osr6-control-plugin
title: Plugin de control OSR6
---

# Plugin de control OSR6

Este plugin permite añadir dispositivos OSR6 al terminal de control UnderSilicon para controlar dispositivos OSR6.
Otros dispositivos OSR (OSR2, OSR3, etc.) también pueden utilizar este plugin si emplean multifunplayer o XTPlayer.

## Requisitos de uso

1. Entorno Windows
2. Dispositivo OSR6 conectado al ordenador por puerto serie (cable de datos o Bluetooth)
3. Ya se puede controlar el dispositivo OSR6 mediante multifunplayer o XTPlayer

## Enlaces de descarga

github: https://github.com/jiandanzhineng/osr6-controller/releases/

LanZou Yun: https://wwaos.lanzouu.com/iCmtw3o8ni8f

## Instrucciones de uso

Tutorial en video: https://www.bilibili.com/video/BV1Z4PWzdEkB/

A continuación, se toma como ejemplo el玩法 de寸止 para explicar cómo utilizar el plugin OSR6.

La forma de utilizar el玩法 de寸止 se refiere a [Introducción al juego de寸止 de 3 etapas](../game/气压寸止玩法3阶段升级版说明.md)

El papel de OSR6 en el juego es sustituir el módulo de vibración original, utilizando OSR6 para lograr efectos de estímulo.

1. Abrir multifunplayer
2. Abrir el terminal de control UnderSilicon
3. Abrir el plugin de control OSR6, seleccionar el puerto de OSR6 e iniciar el servicio
4. En multifunplayer, añadir el método de salida UDP, dirección de salida: 127.0.0.1, puerto coincidente con el del plugin de control OSR6
5. Ahora se puede ver el dispositivo OSR6 en el terminal de control UnderSilicon y comenzar el juego de寸止
> ! Nota: Al iniciar el juego, es necesario marcar el dispositivo OSR6 como controlador de motor de eje descentrado; de lo contrario, OSR6 no recibirá las instrucciones del juego.

[Enlace de compra](../game/气压寸止玩法3阶段升级版说明.md#buy-link-info)