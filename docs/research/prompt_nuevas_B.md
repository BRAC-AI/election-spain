# Prompt B: frases nuevas Q34 a Q45 (13-11-2026)

12 frases x 14 partidos = 168 pares. Pega todo lo que hay debajo de la línea. Si la herramienta corta la respuesta, pídele «continúa con los partidos que faltan».

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
- Q34: Debe gobernar siempre el partido con más votos.
- Q35: El catalán, el euskera y el gallego deben poder usarse en el Congreso y ante la Administración del Estado.
- Q36: La ley contra la violencia machista debe mantenerse como está.
- Q37: La eutanasia debe seguir siendo legal.
- Q38: Pagar por sexo debe estar castigado por la ley.
- Q39: España no debe comerciar con armas con Israel.
- Q40: Las leyes españolas deben estar por encima de las de la Unión Europea.
- Q41: España debe cumplir las normas europeas contra el cambio climático, aunque cuesten dinero.
- Q42: Las pensiones deben subir cada año tanto como los precios.
- Q43: El Sáhara Occidental debe decidir su futuro en un referéndum.
- Q44: Los autónomos que ganan poco no deben tener que cobrar IVA.
- Q45: Los trenes de cercanías los debe gestionar cada comunidad, no el Estado.
