# Prompt A: frases nuevas Q21 a Q33 (versión relajada, 13-11-2026)

13 frases x 14 partidos = 182 pares. Pega todo lo que hay debajo de la línea. Si la herramienta corta la respuesta, pídele «continúa con los partidos que faltan».

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
