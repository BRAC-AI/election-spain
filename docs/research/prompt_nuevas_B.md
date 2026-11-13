# Prompt B: frases nuevas Q34 a Q45 (versión relajada, 13-11-2026)

12 frases x 14 partidos = 168 pares. Pega todo lo que hay debajo de la línea. Si la herramienta corta la respuesta, pídele «continúa con los partidos que faltan».

---

Actúa como investigador. Elecciones generales de España, 29 de noviembre de 2026.

Objetivo: para cada partido y cada afirmación, dame la mejor prueba que exista de qué piensa el partido. Prefiero una prueba floja y bien etiquetada a un «no encontrado». Lo único prohibido es inventar.

Escalera de pruebas. Usa el nivel más alto que encuentres y escribe su número:

1. Programa o medidas del partido para el 29N de 2026.
2. Voto de su grupo en el Congreso o el Senado (2019 a 2026). Di Sí, No o Abstención.
3. Frase literal de su candidato, líder o portavoz (2019 a 2026): prensa, radio, TV, YouTube, pódcast, redes del partido.
4. Lo que ha votado o hecho en un parlamento o gobierno autonómico, en un ayuntamiento grande o en el Parlamento Europeo.
5. Su programa electoral anterior (generales de 2023 o 2019, autonómicas o europeas).
6. Un medio serio que describa la postura del partido sin cita literal («el partido defiende…», «votó en contra…»).
7. La postura de un partido que forma parte de la coalición (por ejemplo IU, Más Madrid o Comuns para Frente Amplio; Més o Iniciativa para Compromís), o del grupo del que viene (Sumar para Frente Amplio). Di cuál.
8. Algo solo parecido: mismo tema, otra medida. Explica la diferencia en una frase.

Reglas, pocas:
- Cada fila lleva un enlace real. Si lo has abierto, escribe «abierto: sí». Si solo lo conoces por el buscador, «abierto: no».
- No valen otros comparadores de voto ni la opinión de un rival.
- Nunca deduzcas solo por ideología. Sin enlace no hay fila: entonces, y solo entonces, «no encontrado».
- Postura: «a favor», «en contra» o «a medias» respecto a la afirmación tal como está escrita. Abstención o «sí, pero» es «a medias».
- Si dos pruebas chocan, da la más reciente y avisa en la columna de notas.

Devuelve un CSV, una fila por par, con estas columnas:
partido,id_pregunta,postura,nivel (1 a 8),resumen_en_una_frase,cita_o_titulo,quién,fecha,url,página_o_minuto,abierto (sí / no),notas,confianza (alta / media / baja)

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
