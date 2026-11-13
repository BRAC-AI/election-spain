# Prompt: cerrar huecos con la mejor prueba disponible (v2, 13-11-2026)

Quedan 148 huecos. Pega todo lo que hay debajo de la línea en la herramienta de deep research. No hay nada que rellenar.

---

Actúa como verificador de hechos. Elecciones generales de España, 29 de noviembre de 2026.

Para cada par partido + afirmación de la lista final, encuentra la MEJOR prueba de qué piensa el partido. Busca en este orden y para en la primera que encuentres:

1. VOTO: cómo votó su grupo en el Congreso o el Senado en la legislatura XV (agosto 2023 a octubre 2026) sobre una ley, proposición o moción que trate justo de eso. Enlace a congreso.es, senado.es o a una noticia que diga el sentido del voto.
2. PROGRAMA 29N: una frase de su programa o de sus «medidas» de 2026, con enlace a la web del partido.
3. CITA: frase literal de su candidato, líder o portavoz con cargo, desde agosto de 2023. La más reciente gana.
4. GOBIERNO O PARLAMENTO AUTONÓMICO: lo que el partido ha hecho o votado donde gobierna o tiene escaños (País Vasco, Cataluña, Canarias, Galicia, Navarra, Comunitat Valenciana, Parlamento Europeo para SALF).
5. LO MÁS CERCANO: si nada trata justo de eso, la prueba más próxima sobre el mismo tema. Márcala como «aproximada» y explica en una frase por qué no es exacta.

Reglas:
- Solo cuenta lo que dice o hace el partido. No vale la opinión de un periodista, un rival, un analista u otro comparador de voto.
- Abre cada enlace y comprueba que dice eso. Si no puedes abrirlo, no lo uses.
- Postura: «a favor», «en contra» o «a medias» respecto a la afirmación TAL COMO ESTÁ ESCRITA. Abstenerse en una votación es «a medias».
- Si de verdad no hay nada en los cinco niveles, escribe «no encontrado» y di en una frase qué buscaste. No deduzcas por ideología.
- No atribuyas a un partido lo que dice su socio de coalición.

Devuelve un CSV, una fila por par, con estas columnas:
partido,id_pregunta,postura,tipo_prueba (voto / programa / cita / autonómico / aproximada),exactitud (exacta / aproximada),resumen_en_una_frase,cita_o_titulo_de_la_votación,quién,fecha,url,por_qué_es_aproximada,confianza (alta / media / baja)

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
- PP: Q05, Q09
- PSOE: Q02, Q11, Q15, Q18, Q19
- Vox: Q02, Q05, Q06, Q07, Q20
- Frente Amplio: Q01, Q02, Q04, Q06, Q07, Q08, Q10, Q11, Q14, Q16, Q17, Q18, Q19, Q20
- Podemos: Q02, Q07, Q10, Q11, Q15, Q19, Q20
- ERC: Q02, Q04, Q06, Q08, Q10, Q12, Q15
- Junts: Q01, Q02, Q03, Q05, Q06, Q08, Q09, Q12, Q14, Q15, Q16
- EAJ-PNV: Q02, Q03, Q04, Q05, Q06, Q07, Q08, Q09, Q10, Q11, Q12, Q14, Q15, Q16, Q20
- EH Bildu: Q02, Q04, Q07, Q08, Q10, Q11, Q12, Q13, Q14, Q15, Q16, Q17, Q20
- BNG: Q02, Q07, Q11, Q12, Q14, Q16, Q17
- Coalición Canaria: Q01, Q03, Q04, Q05, Q06, Q08, Q09, Q10, Q11, Q12, Q13, Q14, Q15, Q16, Q17, Q18, Q19, Q20
- Compromís-Front Valencià: Q03, Q04, Q06, Q07, Q08, Q10, Q11, Q12, Q13, Q14, Q15, Q16, Q18, Q19, Q20
- Democracia 21: Q02, Q03, Q04, Q05, Q06, Q07, Q08, Q09, Q10, Q11, Q12, Q15, Q16, Q17, Q18, Q19, Q20
- SALF: Q01, Q02, Q05, Q06, Q07, Q08, Q09, Q12, Q16, Q17, Q18, Q20
