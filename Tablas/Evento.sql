CREATE TABLE Evento(
	numeroEvento int identity NOT NULL, 
	numeroArea int NOT NULL,
	descripcionEvento ntext,
	fechaHoraEvento datetime,
	PRIMARY KEY(numeroEvento, numeroArea),
	CONSTRAINT fk_Evento_nroArea FOREIGN KEY(numeroArea) REFERENCES Area(numeroArea),
)