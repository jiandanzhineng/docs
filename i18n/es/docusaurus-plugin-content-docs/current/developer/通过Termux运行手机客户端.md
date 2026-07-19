---
slug: /通过Termux运行手机客户端
title: Ejecutar el cliente móvil a través de Termux
sidebar_position: 10
---

> 🎉 **¡El cliente móvil se ha publicado oficialmente!**
> 
> Los desarrolladores no avanzados no necesitan leer este documento, por favor utilicen directamente el cliente publicado.
> 
> 📱 **Enlace de descarga del cliente: [docs/player/new-phone-client](/docs/player/new-phone-client)**
> 
> ⚠️ El contenido a continuación es solo para referencia de desarrolladores avanzados.

---

# Tutorial en video

Bilibili: https://www.bilibili.com/video/BV1ZicuzkETc/
YouTube: https://youtu.be/362cUVcYms8

# Proceso de uso
1. Descargue Termux. Enlace de descarga: [https://update.ezsapi.top/termux.apk](https://update.ezsapi.top/termux.apk)
2. Instale Termux y configure su administración de energía como <font>sin restricciones y bloqueo en segundo plano</font> para evitar que se cierre.
3. Abra Termux

**<font>En la primera ejecución, ejecute la siguiente declaración, cópiela y péguela en Termux, luego presione Enter</font>**

```bash
curl -fsSL https://firmware.undersilicon.cn/control-panel/run_control_panel_stable.sh | sh
```

Si **<font>no es la primera ejecución</font>**, puede ejecutar la siguiente declaración para mejorar la velocidad de carga (si desea actualizar, use la anterior)

```bash
cd "${HOME}/control-panel-stable" && npm run dev:all
```

Espere a que la ejecución se complete, similar a la imagen de abajo (si después de 20 minutos aún no aparece una imagen similar, consulte el problema común 1)

<img src={require('./img/aeI6B3lspG60kJMv/1761797537885-6667e5d2-a8ea-4d3b-956d-32f8ebe1d663-159999.jpeg').default} width="30%" height="auto" alt="1761797537885-6667e5d2-a8ea-4d3b-956d-32f8ebe1d663.jpeg" />

4. Active el punto de acceso móvil. Se recomienda configurar el nombre del punto de acceso como "easysmart", la contraseña como 8 unos (11111111) y la frecuencia en 2.4 GHz para que el dispositivo se conecte automáticamente (si no es así, consulte otras instrucciones de uso para configurar la red del dispositivo; se recomienda usar las opciones predeterminadas).
5. En el navegador del móvil, acceda a 127.0.0.1:5173.
6. En este momento, en la gestión de dispositivos debería ver que su dispositivo está conectado y puede iniciar juegos en la lista de juegos (si está vacío, actualice la página).

# Problemas comunes
## No se inicia normalmente
Debido a problemas de red, existe cierta probabilidad de que el inicio falle. En ese caso, hay dos soluciones:

1. Reinstale Termux (o borre todos los datos de Termux), y luego vuelva a ejecutarlo.
2. Reinicie el móvil, reinstale Termux (o borre todos los datos de Termux), y luego vuelva a ejecutarlo.
3. Si la velocidad de descarga es muy lenta, evite descargar entre las 7 PM y las 12 AM, ya que la red suele estar congestionada. Normalmente, por la mañana es más fluido.

Además, verifique si ha configurado Termux para <font>no tener restricciones en segundo plano</font>.

Si después de intentar estos métodos el problema persiste, únase al grupo de QQ 970326066 y contacte al administrador.

## El dispositivo no puede conectarse al punto de acceso móvil
Cambie el punto de acceso móvil a 2.4 GHz. Si aún no funciona, intente conectar otro dispositivo a este punto de acceso.
Posible causa 1: Ha ocurrido que otros móviles tampoco pueden conectarse, lo que indica un problema con el punto de acceso móvil.

Posible causa 2: Problema con el punto de acceso móvil. Algunos móviles no pueden configurar un punto de acceso en 2.4 GHz mientras están conectados a una red Wi-Fi de 5 GHz. En ese caso, desconecte el Wi-Fi del móvil, use solo datos móviles para navegar y luego active el punto de acceso Wi-Fi.

Posible causa 3: El usuario realizó una operación de configuración de red y el dispositivo ya no se conecta a la red Wi-Fi predeterminada. En ese caso, use la aplicación de configuración de red para volver a configurar el dispositivo con el nombre y contraseña de Wi-Fi predeterminados (el nombre de Wi-Fi en la aplicación de configuración se puede modificar).

## Termux muestra "Unable to install bootstrap"

No instale Termux en el modo de espacio paralelo ni en el modo de aplicación duplicada del móvil.

## No se puede acceder a 127.0.0.1:5173 desde el navegador del móvil

Configure la administración de energía de Termux como sin restricciones y con bloqueo en segundo plano para evitar que se cierre.