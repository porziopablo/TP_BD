CREATE TABLE Area(
	numeroArea int PRIMARY KEY identity NOT NULL,
	nombreArea nvarchar(30) NOT NULL,
	numeroNivel int NOT NULL,
	CONSTRAINT fk_nroNivel FOREIGN KEY(numeroNivel) REFERENCES NivelSeguridad(numeroNivel),
)