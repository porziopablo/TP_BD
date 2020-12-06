CREATE TABLE Evento(
	numeroEvento int identity NOT NULL, 
	numeroArea int NOT NULL,
	descripcionEvento nvarchar(500),
	fechaHoraEvento datetime,
	PRIMARY KEY(numeroEvento, numeroArea),
	CONSTRAINT fk_Evento_nroArea FOREIGN KEY(numeroArea) REFERENCES Area(numeroArea),
	CONSTRAINT fechaEventoValida CHECK (fechaHoraEvento < GETDATE()),
	CONSTRAINT descEventoInvalida CHECK (descripcionEvento != '')
)