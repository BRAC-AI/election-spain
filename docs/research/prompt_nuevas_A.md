# Prompt A: frases nuevas Q21 a Q33 (13-11-2026)

13 frases x 14 partidos = 182 pares. Pega todo lo que hay debajo de la línea. Si la herramienta corta la respuesta, pídele «continúa con los partidos que faltan».

---

Actúa como verificador de hechos. Elecciones generales de España, 29 de noviembre de 2026.

Para cada partido y cada afirmación, encuentra la MEJOR prueba de qué piensa el partido. Busca en este orden y para en la primera:

1. PROGRAMA 29N: frase de su programa o «medidas» de 2026, con enlace y página.
2. VOTO: cómo votó su grupo en el Congreso o el Senado (legislatura XV, agosto 2023 a octubre 2026) sobre un texto que trate justo de eso. Enlace directo a la votación. Di si votó Sí, No o Abstención. Abstención es «a medias».
3. CITA: frase literal de su candidato, líder o portavoz con cargo, desde agosto de 2023. Vale prensa, radio, TV, YouTube o pódcast (da el minuto).
4. AUTONÓMICO O EUROPEO: lo que el partido ha votado o hecho en su parlamento o gobierno autonómico, o en el Parlamento Europeo.
5. PARECIDO: si nada trata justo de eso, la prueba más cercana sobre el mismo tema. Marca exactitud «aproximada» y explica por qué en una frase.

Reglas:
- Solo cuenta lo que dice o hace el partido. No vale un periodista, un rival, un analista u otro comparador de voto.
- Abre cada enlace y comprueba que dice eso. Si no puedes abrirlo, no lo uses.
- Postura: «a favor», «en contra» o «a medias» respecto a la afirmación tal como está escrita.
- Si no hay nada en los cinco niveles, escribe «no encontrado». No deduzcas por ideología ni atribuyas a un partido lo que dice su socio.
- Frente Amplio: los votos del grupo Sumar valen solo como «aproximada».

Devuelve un CSV, una fila por par, con estas columnas:
partido,id_pregunta,postura,tipo_prueba (programa / voto / cita / autonómico / europeo / aproximada),exactitud (exacta / aproximada),resumen_en_una_frase,cita_o_titulo_de_la_votación,quién,fecha,url,página_o_minuto,por_qué_es_aproximada,confianza (alta / media / baja)

Partidos:
PP, PSOE, Vox, Frente Amplio, Podemos, ERC, Junts, EAJ-PNV, EH Bildu, BNG, Coalición Canaria, Compromís-Front Valencià, Democracia 21, SALF

Afirmaciones:
- Q21: El Estado debe dar ventajas fiscales a los planes de pensiones privados.
- Q22: Hay que poder jubilarse a los 65 años con la pensión completa.
- Q23: Heredar de padres a hijos no debe pagar impuestos.
- Q24: Los bancos deben pagar un impuesto extra por sus beneficios.
- Q25: Despedir a un trabajador debe salir más caro.
- Q26: Quien ocupa una casa ajena debe poder ser desalojado en 48 horas.
- Q27: No se deben abrir más pisos turísticos donde falta vivienda.
- Q28: Se deben poder seguir vendiendo coches de gasolina y diésel después de 2035.
- Q29: Hay que llevar agua de unos ríos a otras zonas donde falta (trasvases).
- Q30: Un inmigrante con papeles que comete un delito grave debe ser expulsado.
- Q31: Todas las comunidades deben estar obligadas a acoger a menores inmigrantes que llegan solos.
- Q32: El órgano que dirige a los jueces deben elegirlo los propios jueces, no el Congreso.
- Q33: Los ciudadanos deben poder votar si quieren monarquía o república.
