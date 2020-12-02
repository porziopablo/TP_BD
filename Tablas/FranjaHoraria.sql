CREATE TABLE FranjaHoraria(
	numeroFranja int PRIMARY KEY IDENTITY NOT NULL,
	horaInicio time(0) NOT NULL,
	/* el 0 en time implica que solo sea HH:MM:SS*/
	horaFin time(0) NOT NULL,
	CONSTRAINT franjaValida UNIQUE(horaInicio, horafin)
)