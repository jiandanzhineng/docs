---
slug: /手机客户端-建议采用默认wifi-不要进行配网
title: Cliente móvil (se recomienda usar la wifi predeterminada, no configurar la red)
sidebar_position: 1
---

Solo compatible con **<font>teléfonos Android</font>** y productos enviados después del 1 de noviembre de 2025. Los dispositivos anteriores pueden actualizar el firmware mediante:

[Instrucciones de grabación de firmware del hardware](./其他使用说明/硬件固件烧录说明.md)

# Proceso de uso
1. Descarga Termux. Enlace de descarga: [https://update.ezsapi.top/termux.apk](https://update.ezsapi.top/termux.apk)
2. Instala Termux y configura su administración de energía como **<font>Sin restricciones, bloqueo en segundo plano</font>** para evitar que se cierre en segundo plano.
3. Abre Termux.

**<font>Para la primera ejecución, copia y pega el siguiente comando en Termux y presiona Enter:</font>**

```bash
curl -fsSL https://update.ezsapi.top/run_control_panel.sh | sh
```

Si **<font>no es la primera ejecución</font>**, puedes usar el siguiente comando para acelerar la carga (usa el anterior si quieres actualizar):

```bash
cd "${HOME}/control-panel-stable" && npm run dev:all
```

Espera a que se complete la ejecución, similar a la siguiente imagen (si después de 20 minutos no aparece una imagen similar, consulta el Problema Común 1):

![1761797537885-6667e5d2-a8ea-4d3b-956d-32f8ebe1d663.jpeg](./img/aeI6B3lspG60kJMv/1761797537885-6667e5d2-a8ea-4d3b-956d-32f8ebe1d663-159999.jpeg)

4. Activa el punto de acceso (hotspot) del teléfono. Se recomienda configurar el nombre del punto de acceso como `easysmart` y la contraseña como `11111111`. El dispositivo se conectará automáticamente. Si no es así, consulta el método de configuración de red del dispositivo en otras instrucciones de uso. Se recomienda usar la opción predeterminada.
5. En el navegador del teléfono, accede a `127.0.0.1:5173`.
6. En este punto, en la administración de dispositivos deberías ver que tu dispositivo está conectado. En la lista de juegos puedes iniciar juegos (si está vacía, actualiza la página).

# Problemas comunes
## No se inicia correctamente
Debido a problemas de red, existe cierta probabilidad de fallo al iniciar. Hay dos soluciones:

1. Reinstala Termux (o borra todos los datos de Termux) y vuelve a ejecutarlo.
2. Reinicia el teléfono, reinstala Termux (o borra todos los datos de Termux) y vuelve a ejecutarlo.
3. Si la velocidad de descarga es muy lenta, evita descargar entre las 7:00 p.m. y las 12:00 a.m., ya que la red suele estar congestionada en ese horario. Por la mañana generalmente es más fluido.

Además, verifica si has configurado Termux con **<font>sin restricciones en segundo plano</font>**.

Si después de intentar los dos métodos anteriores aún no se resuelve, únete al grupo QQ 970326066 y contacta al administrador para recibir ayuda.

## El dispositivo no puede conectarse al punto de acceso del teléfono
Cambia el punto de acceso del teléfono a 2.4 GHz. Si aún no funciona, intenta conectar otro dispositivo al punto de acceso del teléfono.

Posible causa 1: Ha habido casos en que otros teléfonos tampoco pueden conectarse al punto de acceso, lo que indica un problema con el punto de acceso del teléfono.

Posible causa 2: También podría ser un problema del punto de acceso. La razón parece ser que el punto de acceso no logra cambiar a 2.4 GHz. Un usuario resolvió esto separando la banda agregada en su router en dos: 2.4 y 5 GHz, aunque la razón exacta de la solución es desconocida.

Posible causa 3: El usuario realizó una operación de configuración de red, por lo que el dispositivo ya no se conecta a la wifi predeterminada. En este caso, usa la aplicación de configuración de red para volver a configurar el dispositivo con la wifi y contraseña predeterminadas. El nombre de la wifi en la aplicación de configuración se puede modificar.