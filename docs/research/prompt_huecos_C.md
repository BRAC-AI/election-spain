# Prompt C: los huecos que quedan en las 20 frases actuales (versión relajada, 13-11-2026)

48 pares. Pega todo lo que hay debajo de la línea. Si la herramienta corta la respuesta, pídele «continúa con los partidos que faltan».

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

Afirmaciones:
- Q01: El Gobierno debe poner un tope al precio de los alquileres.
- Q02: Solo quien vive en España debe poder comprar casa aquí.
- Q03: Las personas muy ricas deben pagar un impuesto extra.
- Q04: Todo el mundo debe pagar menos impuestos por lo que gana.
- Q05: Hay que trabajar menos horas a la semana cobrando lo mismo.
- Q06: El sueldo mínimo debe subir cada año tanto como los precios.
- Q07: Todas las familias deben recibir una ayuda por cada hijo.
- Q08: Los inmigrantes sin papeles deben poder usar la sanidad pública.
- Q09: La sanidad pública debe usar más los hospitales privados.
- Q10: Los colegios concertados deben seguir recibiendo dinero público.
- Q11: En todos los colegios de España se debe dar clase en castellano.
- Q12: Las centrales nucleares deben seguir abiertas más años.
- Q13: Hay que dar papeles a los inmigrantes que ya viven y trabajan aquí.
- Q14: Los españoles deben ir primero al repartir ayudas.
- Q15: España debe gastar más dinero en su ejército.
- Q16: Para cambiar de sexo en el DNI debe hacer falta un informe médico.
- Q17: El derecho al aborto debe estar en la Constitución.
- Q18: Una comunidad debe poder votar si quiere separarse de España.
- Q19: Cada comunidad debe poder cobrar todos sus impuestos.
- Q20: España debe seguir enviando armas a Ucrania.

Pares que faltan:
- PSOE: Q11
- Frente Amplio: Q02, Q04, Q11, Q16, Q19, Q20
- Podemos: Q11, Q19
- Junts: Q09, Q16
- EAJ-PNV: Q11, Q20
- EH Bildu: Q11
- BNG: Q07, Q11
- Coalición Canaria: Q11, Q16, Q19, Q20
- Compromís-Front Valencià: Q06, Q07, Q11, Q18, Q19, Q20
- Democracia 21: Q02, Q03, Q05, Q06, Q07, Q08, Q09, Q10, Q11, Q12, Q15, Q17, Q18, Q19, Q20
- SALF: Q02, Q05, Q06, Q16, Q17, Q18, Q20
