CREATE TABLE FranjaHoraria(
	numeroFranja int PRIMARY KEY IDENTITY NOT NULL,
	horaInicio time(0) NOT NULL,
	horaFin time(0) NOT NULL,
	CONSTRAINT franjaValida UNIQUE(horaInicio, horafin),
	CONSTRAINT horaFinValida CHECK(horaFin > horaInicio)
)



