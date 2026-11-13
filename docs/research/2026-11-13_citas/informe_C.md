# Fact-checking electoral 29N: investigación de las combinaciones pendientes

## Resultado

He aplicado el criterio estricto que pediste: solo declaraciones explícitas entre el **1 de enero y el 13 de noviembre de 2026**, pronunciadas por candidatos, líderes o portavoces identificables; sin usar programas electorales como prueba y sin completar huecos por inferencia.

El CSV contiene las **174 combinaciones partido-pregunta pendientes**. De ellas, **12 tienen una cita directa que supera el filtro** y **162 quedan como `no encontrado`**. En varios casos he preferido dejar vacío un dato aun cuando había programas, votaciones, resúmenes periodísticos o posiciones históricas bastante claras. Eso es deliberado: con tus reglas, “probable” no es “verificado”.

[Descargar CSV completo](sandbox:/mnt/data/factcheck_elecciones_29N_2026_pendientes.csv)

## Citas que sí pasan el filtro

| Partido | ID | Postura | Evidencia |
|---|---|---|---|
| PP | Q02 | en contra | Margalida Pocoví rechazó expresamente una propuesta para impedir la compra a no residentes: “No podemos apoyar una propuesta que es inconstitucional, contraria al derecho europeo, técnicamente inviable”. La noticia identifica el contexto y la intervención parlamentaria balear. citeturn696574view0turn838551view0 |
| PP | Q08 | a medias | Feijóo defendió sanidad pública plena para quien “reside legalmente” y, para las personas en situación irregular, solo prestaciones básicas, urgencias y emergencias vitales. No es una negativa absoluta al uso de la sanidad, por eso no lo codifico como `en contra`. citeturn696574view1 |
| PP | Q09 | a medias | Carmen Fúnez afirmó que “la sanidad privada es un modelo imprescindible dentro del Sistema Nacional de Salud (SNS)”. Esto acredita apoyo a la colaboración privada, pero **no** dice literalmente que deba utilizarse *más*, así que lo dejo en `a medias`. citeturn696574view2turn287866view2 |
| PP | Q17 | en contra | Ester Muñoz declaró: “El derecho al aborto está blindado por una ley orgánica. Y por lo tanto, no hacía falta introducirlo en la Constitución”. Es oposición explícita a la afirmación exacta. citeturn696574view3 |
| PSOE | Q14 | en contra | Mar Espinar calificó la “prioridad nacional” acordada por PP y Vox de “políticas racistas”. El contexto de la información especifica que afectaba al acceso prioritario a ayudas y prestaciones públicas. citeturn696574view4 |
| PSOE | Q15 | a medias | Sánchez afirmó que dijeron “no a gastarnos el 5% en armas porque íbamos a seguir gastando en educación y sanidad”. Rechaza ese incremento concreto, pero no demuestra oposición a cualquier aumento del gasto militar. citeturn696574view5 |
| PSOE | Q17 | a favor | Sánchez fue inequívoco: “Yo me comprometo a que vamos a blindar el derecho a abortar en la Constitución española”. Es la evidencia más reciente localizada y responde literalmente a Q17. citeturn696574view5turn287866view6 |
| Vox | Q02 | a medias | Manuela Cañadas intervino contra la propuesta balear de restricción a no residentes, pero justificó su rechazo porque “No protege al español frente al capital extranjero”. Eso no equivale a rechazar cualquier restricción por residencia, y su criterio declarado es distinto, la nacionalidad. citeturn287866view1 |
| Podemos | Q15 | en contra | Irene Montero formuló una oposición exactamente incremental al gasto armamentístico: “no gastar ni un euro más en armas y gastarlo en escuelas y hospitales”. citeturn696574view6turn287866view4 |
| Junts | Q13 | a medias | Míriam Nogueras afirmó sobre la regularización extraordinaria que “este proceso no puede hacerse sin control, sin rigor y sin recursos” y anunció que Junts intentaría frenarlo. Es oposición a **ese proceso concreto**, no una negativa inequívoca a regularizar a toda persona que vive y trabaja en España, de ahí `a medias`. citeturn696574view7turn287866view5 |
| EAJ-PNV | Q17 | a favor | En el debate del Congreso, Maribel Vaquero sostuvo que, si se quiere blindar el aborto constitucionalmente, debería abordarse como derecho fundamental y criticó que el Gobierno eligiera el artículo 43. Es apoyo al blindaje constitucional, con desacuerdo sobre la técnica jurídica. citeturn813940search1turn813940search0 |
| Compromís-Front Valencià | Q02 | a favor | María Teresa Pérez, cabeza de lista por Alicante, incluyó expresamente entre sus propuestas “prohibir la compra a los no residentes”. Es correspondencia directa con Q02. citeturn696574view8turn287866view3 |

## Criterios que han cambiado varias clasificaciones

He aplicado de forma especialmente conservadora tus advertencias sobre equivalencias. Por ejemplo, el PP no queda `a favor` de Q09 solo por defender la colaboración público-privada; la cita encontrada habla de que la sanidad privada es “imprescindible”, pero no reclama literalmente **más derivaciones** a hospitales privados. citeturn696574view2 Del mismo modo, la declaración de Feijóo sobre inmigrantes irregulares en Q08 queda `a medias`, porque sí admite prestaciones sanitarias básicas y atención urgente, aunque niegue la cobertura pública plena que reserva a residentes legales. citeturn696574view1

La misma cautela afecta a Junts en Q13. Nogueras trata de frenar una regularización extraordinaria concreta por cómo se articula y por sus requisitos, no formula una regla general contra conceder residencia a inmigrantes que ya viven y trabajan aquí. citeturn696574view7 Y para Vox en Q02, votar o argumentar contra una prohibición basada en residencia no basta para decir que Vox quiera permitir libremente la compra a no residentes: la propia portavoz critica la propuesta porque, a su juicio, no protege específicamente al español frente al capital extranjero. citeturn287866view1

## Casos donde había señales, pero no una cita admisible

Encontré bastante material que **no entró en el CSV como postura**. Por ejemplo, existen noticias y comparadores que describen programas de ERC, BNG, PNV, Frente Amplio, Vox o SALF en numerosos temas, pero el encargo excluye usar el programa como prueba principal. En ERC, por ejemplo, la cobertura de su programa de 2026 describe posiciones fiscales, laborales y territoriales muy concretas, pero eso no sustituye una frase pronunciada por Rufián, Alamany u otro portavoz para las Q pendientes. citeturn430585search0turn430585search4

Algo parecido ocurre con el BNG. Hay cobertura del programa de campaña y constancia de su voto en la reforma constitucional del aborto, pero la declaración directa de Néstor Rego localizada únicamente expresa “cierto escepticismo” sobre el efecto práctico del blindaje. Eso no permite convertir limpiamente Q17 en `a favor` o `en contra` usando solo sus palabras. citeturn696574view9turn125901search5

En SALF aparecieron agregadores que atribuyen posiciones a Alvise Pérez sobre aborto, Ley Trans o Ucrania, e incluso una entrevista de enero de 2026. Sin embargo, para las Q pendientes no localicé dentro del periodo una cita directa, abierta y suficientemente exacta que cumpliera a la vez la regla temática y la de atribución. Por eso esas celdas siguen como `no encontrado`; no he trasladado las conclusiones de esos agregadores al fichero. citeturn538661search0turn538661search7

## Cobertura y limitaciones

La mayor fuente de `no encontrado` no es necesariamente que el partido carezca de postura política. Es que **no he encontrado una declaración literal de 2026 que responda exactamente a la formulación de tu test y cumpla el estándar de fuente**. Esta diferencia es importante. Una votación, un programa o una política de gobierno pueden revelar bastante, pero tus reglas los dejan fuera cuando no vienen acompañados de palabras atribuibles a un portavoz.

También he evitado trasladar automáticamente posiciones entre organizaciones relacionadas. En el caso de **UPN-PP**, por ejemplo, hay intervenciones de UPN anteriores a la coalición electoral y posiciones del PP sobre aborto, pero atribuir cualquiera de ellas a la candidatura conjunta posterior sin una declaración de la propia coalición sería exceder la evidencia. En abril, Alberto Catalán de UPN calificó la reforma constitucional del aborto de “debate falso”, pero esa intervención precede a la candidatura UPN-PP y tampoco resuelve por sí sola si se opone al blindaje constitucional en abstracto o a la vía jurídica empleada. citeturn696574view9

No he incluido minutos de vídeos porque ninguna de las filas finalmente utilizadas depende de una cita audiovisual que requiera timestamp. Todas las fuentes retenidas son noticias de prensa con cita literal o, en el caso del PNV, una intervención parlamentaria verificable. El campo `minuto` queda por tanto vacío de forma intencionada, no por falta de comprobación.

## Archivo final

El fichero está codificado en UTF-8 con BOM para que Excel abra correctamente tildes y caracteres como `quién_lo_dice`. Mantiene exactamente estas columnas y este orden:

`partido,id_pregunta,postura,cita_literal,quién_lo_dice,cargo,fecha,medio,tipo,url,minuto,confianza`

Incluye una fila para **cada una de las 174 combinaciones solicitadas**, con los campos de evidencia vacíos cuando el resultado es `no encontrado`.

[Descargar `factcheck_elecciones_29N_2026_pendientes.csv`](sandbox:/mnt/data/factcheck_elecciones_29N_2026_pendientes.csv)