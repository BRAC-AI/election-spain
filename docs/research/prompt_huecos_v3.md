# Prompt: últimos huecos (v3, 13-11-2026)

Quedan 40 pares sin nada y 41 con solo una pista. Pega todo lo que hay debajo de la línea. No hay nada que rellenar.

---

Actúa como verificador de hechos. Elecciones generales de España, 29 de noviembre de 2026.

Una búsqueda anterior no encontró prueba EXACTA para los pares de abajo. Vuelve a buscar, esta vez partido a partido y en sus propias fuentes. Una prueba es exacta si trata justo de lo que dice la afirmación, tal como está escrita.

Dónde mirar según el partido:
- Democracia 21: todos los PDF de democracia21.es/docs/, su web, y entrevistas y debates de Miriam González y sus cabezas de lista en 2026 (prensa, radio, TV, YouTube, pódcast).
- SALF: su programa o «contrato» para el 29N en seacabolafiesta.com, entrevistas y vídeos de Alvise Pérez desde 2024, y sus votos en el Parlamento Europeo (europarl.europa.eu, howtheyvote.eu).
- Frente Amplio: su programa y «medidas» del 29N en frenteamplio.info, y lo dicho en 2026 por Ada Colau y sus cabezas de lista. Los votos del grupo Sumar en el Congreso valen solo como «aproximada».
- Coalición Canaria: su programa 29N, los votos de Cristina Valido en el Congreso, y lo que hace o vota CC en el Gobierno y el Parlamento de Canarias.
- Compromís-Front Valencià: su programa 29N en frontvalencia.org, los votos de Àgueda Micó y Alberto Ibáñez en el Congreso, y los votos de Compromís en Les Corts Valencianes.
- Junts, EAJ-PNV, EH Bildu, BNG, ERC, PSOE, Vox, Podemos: votos en el Congreso y el Senado (legislatura XV), su programa 29N, citas de su portavoz desde agosto de 2023, y su parlamento autonómico.

Reglas:
- Solo cuenta lo que dice o hace el partido. No vale un periodista, un rival, un analista u otro comparador de voto.
- Abre cada enlace y comprueba que dice eso. Si no puedes abrirlo, no lo uses.
- En votos, da el enlace directo a la votación y di qué votó ese grupo: Sí, No o Abstención. Abstención es «a medias».
- Postura: «a favor», «en contra» o «a medias» respecto a la afirmación tal como está escrita.
- Si sigue sin haber prueba exacta, escribe «no encontrado». No repitas una pista aproximada: ya la tenemos.
- No deduzcas por ideología ni atribuyas a un partido lo que dice su socio.

Devuelve un CSV, una fila por par, con estas columnas:
partido,id_pregunta,postura,tipo_prueba (voto / programa / cita / autonómico / europeo),resumen_en_una_frase,cita_o_titulo_de_la_votación,quién,fecha,url,confianza (alta / media / baja)

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

Pares sin nada (40):
- Frente Amplio: Q02, Q04, Q11, Q16, Q19, Q20
- Junts: Q16
- EAJ-PNV: Q20
- BNG: Q07
- Coalición Canaria: Q10, Q16, Q18, Q19, Q20
- Compromís-Front Valencià: Q06, Q07, Q18, Q19, Q20
- Democracia 21: Q02, Q03, Q05, Q06, Q07, Q08, Q09, Q10, Q11, Q12, Q15, Q17, Q18, Q19, Q20
- SALF: Q02, Q05, Q06, Q16, Q17, Q18

Pares con solo una pista; busca una prueba exacta (41):
- PSOE: Q11, Q19
- Vox: Q06
- Frente Amplio: Q06, Q07, Q10, Q14
- Podemos: Q10, Q11, Q19
- ERC: Q06
- Junts: Q01, Q03, Q06, Q09
- EAJ-PNV: Q04, Q06, Q11, Q16
- EH Bildu: Q04, Q11, Q16
- BNG: Q11, Q16
- Coalición Canaria: Q01, Q03, Q04, Q06, Q11
- Compromís-Front Valencià: Q03, Q04, Q10, Q11, Q16
- Democracia 21: Q04, Q16
- SALF: Q01, Q08, Q09, Q12, Q20
