# Hunter Network — modelo de negocio (spec viva)

> Documento interno. No es superficie pública. Recoge las decisiones de modelo
> tomadas hasta la fecha para que persistan y para que el portal interno (CN /
> Connect, de Javi) se construya contra la misma lógica. Los números son de
> trabajo, fijados en la discovery con cada cliente — **nunca se publican** en
> ninguna superficie (regla de marca 5b).

## Principio rector (no negociable)

- El pago **no** compra acceso a buenos clientes. El **rendimiento** compra
  acceso a mejores campañas.
- La marca se protege **antes** que el volumen.
- Nunca empleo ni ingresos garantizados. Nunca "pagar por trabajar".

## Arquitectura de ingresos (por orden de importancia)

| Fuente | Quién paga | Papel | Salud |
|---|---|---|---|
| Reunión cualificada | Empresa | **La caja** | ✅ B2B, escalable |
| Spread | (margen de HN) | **El beneficio** | ✅ |
| Tarifa de evaluación | Hunter | **Filtro / fianza** | 🟡 simbólica, recuperable |
| Bonus por cierre | Empresa | Complemento | ✅ opcional |

**Regla de oro de salud:** el ingreso por spread de empresas debe ser **muy
superior** al ingreso por tarifas de vendedores. El día que se invierta, HN
dejó de ser una red comercial y se volvió una academia. Es la métrica que vigila
que el modelo no se corrompa.

## Los números (de trabajo, ilustrativos)

```
EMPRESA  ──paga──▶  ~150 €/reunión cualificada  (+bonus de cierre opcional)
                         │
                    HN se queda el spread  (~60 €)
                         │
HUNTER   ──cobra──▶  ~90 €/reunión   ·   ingreso 100 % por rendimiento
HUNTER   ──fianza─▶  30–50 € evaluación  →  SE LE DEVUELVE en su 1ª reunión cobrada
```

- El precio por reunión sube en nichos premium (clínicas, inmobiliario,
  decisores C-level) y baja en otros. Lo fija la discovery, no una tarifa
  pública.
- La tarifa de evaluación es una **fianza acreditable**: filtra al curioso, se
  devuelve al rendir. HN solo se queda la fianza de quien nunca genera una
  reunión cobrada (el que se auto-seleccionó como no serio).

## Cashflow (positivo por diseño)

El dinero **entra antes de salir**:

```
1. Empresa PREPAGA un bloque de reuniones (p.ej. 10) en la discovery.
2. Ese dinero queda en caja de HN ANTES de que ningún hunter trabaje.
3. Reunión hecha → ventana de 48–72 h para que el cliente objete.
4. Validada (sin objeción o tras revisión del operador) → el hunter cobra
   en el pago SEMANAL, financiado con dinero que HN ya tiene.
```

- **Nunca financias el hueco**: pagas al hunter con caja prepagada del cliente.
- El hunter cobra rápido (semanal, no al ritmo net-30 del cliente) → motivado.
- La ventana de validación da margen para disputas y un pequeño colchón.

## Reglas justas (a cerrar — fuente nº1 de disputas)

- **Definición de "reunión cualificada"** (lo que se factura): decisor correcto,
  se presentó, duración mínima, cumple el perfil pactado. ← PENDIENTE de cerrar
  por escrito.
- **No-show / disputa:**
  - No-show del lead que no es culpa del hunter → cuenta (o media).
  - Hunter infló la cualificación → no cuenta.
  - (Si no se respeta la justicia, los hunters se sienten robados y se van.)
- **Créditos prepagados sin usar:** al principio reembolsables (ganar
  confianza); más adelante "válidos 6 meses, no reembolsables".

## Decisiones abiertas (bloquean el encendido de pagos)

1. **Entidad legal que recibe el dinero.** XNLAB no es una empresa registrada
   (solo el dominio). Tener dinero **prepagado** del cliente es un pasivo
   contable (ingreso diferido); hay que definir quién es el titular/merchant of
   record **antes** de encender Stripe.
2. **Definición contractual de "reunión cualificada"** (ver arriba).
3. **Precio por nicho** (rangos por sector, fijados en discovery).
4. **Escalado de la evaluación**: el operador humano que revisa 5 llamadas por
   candidato no escala; definir qué se automatiza (el motor del portal lo
   prepara) y qué se mantiene manual.
5. **Arranque (oferta vs demanda):** asegurar 1–2 campañas reales antes de
   reclutar hunters en volumen, para no quemar candidatos sin trabajo.

## Reparto de superficies

- **Web pública** (este repo, `/hunter-network`): capta, filtra, comunica la
  promesa, abre las dos puertas (hunter / empresa), inicia el pago de la
  evaluación. NO opera.
- **Portal interno** (CN / Connect, de Javi): login, suscripción, formación,
  examen, agenda, jornadas, productividad, base de datos de candidatos,
  conciliación de pagos (webhook → ficha de hunter), el motor de operaciones.

---

_Última actualización del modelo: ciclo MMXXVI. Documento de trabajo, revisable
con datos reales de las primeras campañas._
