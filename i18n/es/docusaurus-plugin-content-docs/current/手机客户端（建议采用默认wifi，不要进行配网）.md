---
slug: /手机客户端-建议采用默认wifi-不要进行配网
title: Cliente móvil (se recomienda usar la wifi predeterminada, no configurar la red)
sidebar_position: 1
---

Solo es compatible con **<font>teléfonos Android</font>** y productos enviados después del 1 de noviembre de 2025. Los dispositivos anteriores pueden actualizar el firmware mediante

[Instrucciones de grabación de firmware de hardware](./其他使用说明/硬件固件烧录说明.md)

# Flujo de uso
1. Descarga Termux. Enlace de descarga: [https://update.ezsapi.top/termux.apk](https://update.ezsapi.top/termux.apk)
2. Instala Termux y configura su administración de energía como **<font>Sin restricciones, bloqueo en segundo plano</font>** para evitar que se cierre en segundo plano.
3. Abre Termux.

**<font>Para la primera ejecución, ejecuta la siguiente declaración, cópiala y pégala en Termux, luego presiona Enter.</font>**

```bash
curl -fsSL https://update.ezsapi.top/run_control_panel.sh | sh
```

Si **<font>no es la primera ejecución</font>**, puedes ejecutar la siguiente declaración para mejorar la velocidad de carga (si quieres actualizar, usa la de arriba).

```bash
cd "${HOME}/control-panel-stable" && npm run dev:all
```

Espera a que la ejecución se complete, similar a la siguiente imagen (si después de 20 minutos no aparece una imagen similar, consulta el Problema Común 1).

<img src={require('./img/aeI6B3lspG60kJMv/1761797537885-6667e5d2-a8ea-4d3b-956d-32f8ebe1d663-159999.jpeg').default} width="30%" height="auto" alt="1761797537885-6667e5d2-a8ea-4d3b-956d-32f8ebe1d663.jpeg" />

4. Activa el punto de acceso (hotspot) del teléfono. Se recomienda configurar el nombre del punto de acceso como "easysmart" y la contraseña como ocho "1". El dispositivo se conectará automáticamente. Si no es así, consulta el método de configuración de red del dispositivo en otras instrucciones de uso. Se recomienda usar la opción predeterminada.
5. En el navegador del teléfono, accede a 127.0.0.1:5173.
6. En este momento, en la gestión de dispositivos deberías ver que tu dispositivo está conectado. En la lista de juegos puedes iniciar juegos (si está vacía, puedes actualizar la página).

# Problemas comunes
## No se inicia correctamente
Debido a problemas de red, existe cierta probabilidad de que el inicio falle. En este caso, hay dos soluciones:

1. Reinstala Termux (o borra todos los datos de Termux) y vuelve a ejecutarlo.
2. Reinicia el teléfono, reinstala Termux (o borra todos los datos de Termux) y vuelve a ejecutarlo.
3. Si la velocidad de descarga es muy lenta, evita descargar entre las 7 p.m. y las 12 a.m., ya que la red suele estar congestionada en ese horario. Por la mañana generalmente es más fluido.

Además, verifica si has configurado Termux para que **<font>no tenga restricciones en segundo plano</font>**.

Si después de intentar estos métodos aún no se resuelve el problema, únete al grupo QQ 970326066 y contacta al administrador del grupo.

## El dispositivo no puede conectarse al punto de acceso del teléfono
Cambia el punto de acceso del teléfono a 2.4 GHz. Si aún no funciona, intenta conectar otro dispositivo al punto de acceso de este teléfono.
Posible causa 1: Ha habido casos en los que otros teléfonos tampoco pueden conectarse al punto de acceso, lo que indica un problema con el punto de acceso del teléfono.
Posible causa 2: También podría ser un problema del punto de acceso. La razón parece ser que el punto de acceso no puede cambiar a 2.4 GHz. Un usuario resolvió esto separando las bandas agregadas en el router en dos: 2.4 GHz y 5 GHz, aunque la razón exacta de la solución es desconocida.

Posible causa 3: El usuario realizó una operación de configuración de red, y el dispositivo ya no se conecta a la wifi predeterminada. En este caso, usa la aplicación de configuración de red para volver a configurar el dispositivo con la wifi y contraseña predeterminadas. El nombre de la wifi en la aplicación de configuración se puede modificar.