CREATE TABLE TieneAsignado(
	numeroEmpleado int NOT NULL, 
	numeroArea int NOT NULL,
	numeroFranja int NOT NULL,
	PRIMARY KEY(numeroArea, numeroEmpleado),
	CONSTRAINT fk_TieneAsignado_nroEmpleado FOREIGN KEY(numeroEmpleado) REFERENCES Empleado(numeroEmpleado),
	CONSTRAINT fk_TieneAsignado_nroArea FOREIGN KEY(numeroArea) REFERENCES Area(numeroArea),
	CONSTRAINT fk_TieneAsignado_nroFranja FOREIGN KEY(numeroFranja) REFERENCES FranjaHoraria(numeroFranja)
)